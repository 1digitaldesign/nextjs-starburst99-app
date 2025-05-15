import fs from 'fs';
import path from 'path';
import { getModelRun } from '../../../lib/edge-config';

export default async function handler(req, res) {
  const { runId } = req.query;
  
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    // Validate the runId format to prevent directory traversal
    if (!runId || !runId.match(/^run-\d+-[a-z0-9]+$/)) {
      return res.status(400).json({ message: 'Invalid run ID format' });
    }
    
    // Try to get model run from Edge Config first
    let edgeConfigModel = null;
    try {
      edgeConfigModel = await getModelRun(runId);
      if (edgeConfigModel) {
        console.log('Found model in Edge Config:', edgeConfigModel);
      }
    } catch (error) {
      console.warn('Could not fetch from Edge Config:', error.message);
    }
    
    const runDir = path.join(process.cwd(), 'model_runs', runId);
    
    // Ensure model_runs directory exists
    const modelRunsDir = path.join(process.cwd(), 'model_runs');
    try {
      await fs.promises.mkdir(modelRunsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, that's okay
    }
    
    // Check if directory exists
    try {
      await fs.promises.access(runDir, fs.constants.F_OK);
    } catch (error) {
      return res.status(404).json({ 
        message: 'Model run not found',
        details: 'The requested model run does not exist in the server.',
        runId
      });
    }
    
    // Get list of output files
    const files = await fs.promises.readdir(runDir);
    
    // Check for status.json first
    if (files.includes('status.json')) {
      const statusPath = path.join(runDir, 'status.json');
      const statusContent = await fs.promises.readFile(statusPath, 'utf8');
      const status = JSON.parse(statusContent);
      
      if (status.status === 'created') {
        return res.status(200).json({
          runId,
          status: 'created',
          message: status.message || 'Model created but not yet executed',
          modelName: status.modelName,
          createdAt: status.createdAt
        });
      }
    }
    
    // Parse requested file type from query
    const fileType = req.query.fileType || 'spectrum1';
    
    // Find matching file - handle both with and without period prefix
    const targetFile = files.find(file => 
      file.endsWith(`.${fileType}`) || file === fileType
    );
    
    if (!targetFile) {
      // Check if we have any output files at all
      const outputFiles = files.filter(file => 
        file.endsWith('.spectrum1') || file === 'spectrum1' ||
        file.endsWith('.color1') || file === 'color1' ||
        file.endsWith('.output1') || file === 'output1'
      );
      
      if (outputFiles.length === 0) {
        return res.status(404).json({ 
          message: `No output files found for this model run. The model may still be running or may have failed.`,
          status: 'no_outputs',
          availableFiles: files
        });
      }
      
      // If we have output files but not the requested type
      return res.status(404).json({ 
        message: `No ${fileType} file found for this model run`,
        status: 'missing_file_type',
        availableFiles: files,
        suggestedFileType: outputFiles[0].split('.').pop() // Suggest an available file type
      });
    }
    
    // Read file content
    const filePath = path.join(runDir, targetFile);
    const fileContent = await fs.promises.readFile(filePath, 'utf8');
    
    // Parse file content based on type
    let parsedData;
    
    if (fileType === 'spectrum1') {
      parsedData = parseSpectrumFile(fileContent);
    } else if (fileType === 'color1') {
      parsedData = parseColorFile(fileContent);
    } else {
      // For other files, just return raw text
      parsedData = { raw: fileContent };
    }
    
    return res.status(200).json({
      runId,
      fileType,
      fileName: targetFile,
      data: parsedData
    });
    
  } catch (error) {
    console.error('Error retrieving model results:', error);
    return res.status(500).json({ 
      message: 'Failed to retrieve model results',
      error: error.message
    });
  }
}

/**
 * Parse spectrum file into structured data
 */
function parseSpectrumFile(content) {
  const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  
  const data = lines.map(line => {
    const [wavelength, flux] = line.trim().split(/\s+/).map(parseFloat);
    return { wavelength, flux };
  }).filter(item => !isNaN(item.wavelength) && !isNaN(item.flux));
  
  return {
    type: 'spectrum',
    wavelengthUnit: 'Angstrom',
    fluxUnit: 'erg/s/cm2/A',
    data
  };
}

/**
 * Parse color file into structured data
 */
function parseColorFile(content) {
  const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  
  const data = lines.map(line => {
    const values = line.trim().split(/\s+/).map(parseFloat);
    if (values.length >= 5) {
      return {
        age: values[0],   // Age in Myr
        uMinusB: values[1], // U-B color
        bMinusV: values[2], // B-V color
        vMinusR: values[3], // V-R color
        vMinusK: values[4]  // V-K color
      };
    }
    return null;
  }).filter(Boolean);
  
  return {
    type: 'colors',
    data
  };
}
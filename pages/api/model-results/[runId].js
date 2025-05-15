import fs from 'fs';
import path from 'path';

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
    
    const runDir = path.join(process.cwd(), 'model_runs', runId);
    
    // Check if directory exists
    try {
      await fs.promises.access(runDir, fs.constants.F_OK);
    } catch (error) {
      return res.status(404).json({ message: 'Model run not found' });
    }
    
    // Get list of output files
    const files = await fs.promises.readdir(runDir);
    
    // Parse requested file type from query
    const fileType = req.query.fileType || 'spectrum1';
    
    // Find matching file
    const targetFile = files.find(file => file.endsWith(`.${fileType}`));
    
    if (!targetFile) {
      return res.status(404).json({ 
        message: `No ${fileType} file found for this model run`,
        availableFiles: files
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
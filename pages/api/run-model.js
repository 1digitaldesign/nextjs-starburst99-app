import fs from 'fs';
import path from 'path';

// Import our job queue system
import jobQueue from '../../../lib/queue/jobQueue';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { modelName, parameters } = req.body;

    if (!modelName) {
      return res.status(400).json({ message: 'Model name is required' });
    }

    // Create a unique directory for this run
    const runId = `run-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    const runDir = path.join(process.cwd(), 'model_runs', runId);
    
    // Ensure directory exists
    await fs.promises.mkdir(runDir, { recursive: true });

    // Create input file for Starburst99
    const inputFile = path.join(runDir, 'standard.input1');
    const inputContent = generateInputFile(modelName, parameters);
    
    await fs.promises.writeFile(inputFile, inputContent);

    // Add the job to the queue instead of executing directly
    jobQueue.addJob({
      runId,
      modelName,
      inputFilePath: inputFile,
      outputDir: runDir
    });

    // Return immediately with the job ID
    return res.status(200).json({
      message: 'Model queued successfully',
      runId,
      status: 'queued'
    });
    
  } catch (error) {
    console.error('Error queuing Starburst99 model:', error);
    return res.status(500).json({ 
      message: 'Failed to queue model',
      error: error.message
    });
  }
}

/**
 * Generate an input file for Starburst99 based on model parameters
 */
function generateInputFile(modelName, params = {}) {
  // Default parameters
  const defaultParams = {
    metallicity: '0.020',  // Solar metallicity
    imf: 'kroupa',         // Kroupa IMF
    starFormation: 'instantaneous', // Instantaneous burst
    time_min: 0.01,        // 0.01 Myr
    time_max: 50.0,        // 50 Myr
    time_step: 0.1,        // 0.1 Myr
    mass_min: 0.1,         // 0.1 solar masses
    mass_max: 100.0        // 100 solar masses
  };
  
  // Merge with provided parameters
  const p = { ...defaultParams, ...params };
  
  // Convert IMF choice to parameters
  let imfExponents, imfBoundaries;
  switch(p.imf) {
    case 'salpeter':
      imfExponents = '2.35 2.35';
      imfBoundaries = '0.1 1.0 100.0';
      break;
    case 'kroupa':
      imfExponents = '1.3 2.3';
      imfBoundaries = '0.1 0.5 100.0';
      break;
    case 'chabrier':
      imfExponents = '1.3 2.3';
      imfBoundaries = '0.1 1.0 100.0';
      break;
    case 'topHeavy':
      imfExponents = '1.3 1.8';
      imfBoundaries = '0.1 0.5 100.0';
      break;
    case 'bottomHeavy':
      imfExponents = '1.3 2.7';
      imfBoundaries = '0.1 0.5 100.0';
      break;
    default:
      imfExponents = '1.3 2.3';
      imfBoundaries = '0.1 0.5 100.0';
  }
  
  // Convert star formation mode to parameter
  const sfMode = p.starFormation === 'instantaneous' ? '-1' : '1';
  
  // Convert metallicity to model selection
  let izValue;
  switch(p.metallicity) {
    case '0.001': izValue = '13'; break;
    case '0.004': izValue = '12'; break;
    case '0.008': izValue = '13'; break;
    case '0.020': izValue = '14'; break;
    case '0.040': izValue = '15'; break;
    default: izValue = '14'; // Default to solar
  }
  
  // Format the input file according to Starburst99 requirements
  // This is a simplified version based on the Starburst99 input format
  return `Model name
${modelName}
Star formation
${sfMode}
Total mass
1.0
SFR
1.0
Number of intervals for the IMF
2
Exponents for the IMF
${imfExponents}
Mass boundaries for the IMF
${imfBoundaries}
SN cut off
8.0
Black hole cut off
120.0
Metallicity
${izValue}
Mass loss
0
Time
${p.time_min}
Time scale
0
Delta t
${p.time_step}
Number of time intervals
1000
Maximum time
${p.time_max}
Grid
3
Lmin
0
Lmax
0
Delta output
2.0
Atmosphere
5
Highres metallicity
3
UV line metallicity
1
Turb. vel.
3
RSG abundance
0
Output files
1 1 -1 1 1 1 1 1 1 1 1 1 1 1 1
`;
}
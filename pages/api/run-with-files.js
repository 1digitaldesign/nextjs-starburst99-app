import fs from 'fs';
import path from 'path';

// Import our job queue system
import jobQueue from '../../../lib/queue/jobQueue';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { uploadId, modelName } = req.body;

    if (!uploadId) {
      return res.status(400).json({ message: 'Upload ID is required' });
    }
    
    // Check if upload directory exists
    const uploadDir = path.join(process.cwd(), 'uploads', uploadId);
    if (!fs.existsSync(uploadDir)) {
      return res.status(404).json({ message: 'Upload not found' });
    }

    // Create a unique directory for this run
    const runId = `run-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    const runDir = path.join(process.cwd(), 'model_runs', runId);
    
    // Ensure directory exists
    await fs.promises.mkdir(runDir, { recursive: true });

    // Copy all files from upload directory to run directory
    const files = await fs.promises.readdir(uploadDir);
    for (const file of files) {
      const sourcePath = path.join(uploadDir, file);
      const destPath = path.join(runDir, file);
      
      // Get file stats
      const stats = await fs.promises.stat(sourcePath);
      
      if (stats.isFile()) {
        await fs.promises.copyFile(sourcePath, destPath);
      }
    }
    
    // Ensure there's an input file named 'standard.input1' or create a symlink to it
    const inputFiles = files.filter(file => file.endsWith('.input') || file === 'standard.input1');
    if (inputFiles.length > 0) {
      // If there's no file named exactly 'standard.input1', create a symlink to the first input file
      if (!files.includes('standard.input1')) {
        try {
          await fs.promises.symlink(
            path.join(runDir, inputFiles[0]), 
            path.join(runDir, 'standard.input1')
          );
        } catch (error) {
          // If symlink fails, just copy the file instead
          await fs.promises.copyFile(
            path.join(runDir, inputFiles[0]), 
            path.join(runDir, 'standard.input1')
          );
        }
      }
      
      // Get the input file path
      const inputFilePath = path.join(runDir, 'standard.input1');
      
      // Add the job to the queue
      jobQueue.addJob({
        runId,
        modelName: modelName || 'Uploaded Model',
        inputFilePath,
        outputDir: runDir
      });
      
      // Return immediately with the job ID
      return res.status(200).json({
        message: 'Model queued successfully',
        runId,
        status: 'queued'
      });
      
    } else {
      return res.status(400).json({ message: 'No input file found in uploaded files' });
    }
  } catch (error) {
    console.error('Error queuing Starburst99 model with uploaded files:', error);
    return res.status(500).json({ 
      message: 'Failed to queue model',
      error: error.message
    });
  }
}
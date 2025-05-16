/**
 * A simple in-memory job queue system for managing Starburst99 model runs.
 * This module handles queuing, tracking, and executing Fortran model runs.
 */

const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const util = require('util');
const execPromise = util.promisify(exec);

// Configuration
const MAX_CONCURRENT_JOBS = 5; // Allow up to 5 concurrent jobs
const JOB_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds

// The job queue and active jobs list
const jobQueue = [];
const activeJobs = new Map();
const completedJobs = new Map();

// The queue processor state
let isProcessing = false;

/**
 * Adds a new job to the queue
 * @param {Object} jobData - Job configuration data
 * @param {string} jobData.runId - Unique ID for the model run
 * @param {string} jobData.modelName - Name of the model to run
 * @param {string} jobData.inputFilePath - Path to the input file
 * @param {string} jobData.outputDir - Directory to store output files
 * @returns {string} The job ID
 */
function addJob(jobData) {
  const job = {
    id: jobData.runId,
    status: 'queued',
    createdAt: new Date(),
    ...jobData
  };
  
  jobQueue.push(job);
  
  // Start processing the queue if it's not already being processed
  if (!isProcessing) {
    processQueue();
  }
  
  return job.id;
}

/**
 * Process the job queue, starting jobs as resources become available
 */
async function processQueue() {
  if (isProcessing) return;
  
  try {
    isProcessing = true;
    
    while (jobQueue.length > 0 && activeJobs.size < MAX_CONCURRENT_JOBS) {
      const job = jobQueue.shift();
      await startJob(job);
    }
    
  } finally {
    isProcessing = false;
    
    // If there are more jobs in the queue and space for them, process them
    if (jobQueue.length > 0 && activeJobs.size < MAX_CONCURRENT_JOBS) {
      setTimeout(processQueue, 100);
    }
  }
}

/**
 * Start a job to run a Starburst99 model
 * @param {Object} job - Job object
 */
async function startJob(job) {
  try {
    // Update job status
    job.status = 'running';
    job.startedAt = new Date();
    activeJobs.set(job.id, job);
    
    // Set up a timer to prevent jobs from running too long
    const timeoutId = setTimeout(() => {
      terminateJob(job.id, 'timeout');
    }, JOB_TIMEOUT);
    
    // Set up path to Fortran executable
    const STARBURST_PATH = process.env.STARBURST_PATH || 
                          path.resolve(process.cwd(), 'bin', 'starburst99');
    
    // Ensure the output directory exists
    await fs.mkdir(job.outputDir, { recursive: true });
    
    // Run the Fortran executable
    const { stdout, stderr } = await execPromise(
      `cd "${job.outputDir}" && "${STARBURST_PATH}"`,
      { timeout: JOB_TIMEOUT - 1000 } // Set timeout slightly less than our job timeout
    );
    
    // Clear the timeout since the job has completed
    clearTimeout(timeoutId);
    
    // Check if the job was completed successfully
    // For now, we'll consider it successful if any output files were generated
    const outputFiles = await fs.readdir(job.outputDir);
    const spectrumFile = outputFiles.find(file => file.endsWith('.spectrum1'));
    
    if (spectrumFile) {
      completeJob(job.id, 'completed', { stdout, stderr, outputFiles });
    } else {
      completeJob(job.id, 'failed', { stdout, stderr, error: 'No output files generated' });
    }
    
  } catch (error) {
    // Job failed for some reason
    completeJob(job.id, 'failed', { error: error.message });
  }
}

/**
 * Marks a job as completed
 * @param {string} jobId - The ID of the job
 * @param {string} status - The final status of the job (completed or failed)
 * @param {Object} results - Results data for the job
 */
function completeJob(jobId, status, results) {
  // Get the job
  const job = activeJobs.get(jobId);
  if (!job) return;
  
  // Update job status and results
  job.status = status;
  job.completedAt = new Date();
  job.results = results;
  
  console.log(`Job ${jobId} completed with status: ${status}`);
  
  // Move job from active to completed
  activeJobs.delete(jobId);
  completedJobs.set(jobId, job);
  
  // Continue processing the queue
  if (jobQueue.length > 0) {
    setTimeout(processQueue, 100);
  }
}

/**
 * Forcibly terminates a job (used for timeouts)
 * @param {string} jobId - The ID of the job
 * @param {string} reason - The reason for termination
 */
function terminateJob(jobId, reason) {
  const job = activeJobs.get(jobId);
  if (!job) return;
  
  completeJob(jobId, 'terminated', { 
    error: `Job terminated: ${reason}`,
    partial: true
  });
}

/**
 * Get the status of a job
 * @param {string} jobId - The ID of the job
 * @returns {Object|null} The job status or null if not found
 */
function getJobStatus(jobId) {
  // Check active jobs
  if (activeJobs.has(jobId)) {
    const job = activeJobs.get(jobId);
    return {
      id: job.id,
      status: job.status,
      createdAt: job.createdAt,
      startedAt: job.startedAt,
      runTime: job.startedAt ? (new Date() - job.startedAt) : 0,
      queuePosition: 0
    };
  }
  
  // Check completed jobs
  if (completedJobs.has(jobId)) {
    const job = completedJobs.get(jobId);
    return {
      id: job.id,
      status: job.status,
      createdAt: job.createdAt,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      runTime: job.completedAt && job.startedAt ? 
               (job.completedAt - job.startedAt) : 0,
      results: job.results
    };
  }
  
  // Check queued jobs
  const queuePosition = jobQueue.findIndex(job => job.id === jobId);
  if (queuePosition >= 0) {
    const job = jobQueue[queuePosition];
    return {
      id: job.id,
      status: 'queued',
      createdAt: job.createdAt,
      queuePosition: queuePosition + 1
    };
  }
  
  return null;
}

/**
 * Get all jobs in the system
 * @returns {Object} Object containing queued, active, and completed jobs
 */
function getAllJobs() {
  return {
    queued: [...jobQueue],
    active: Array.from(activeJobs.values()),
    completed: Array.from(completedJobs.values()).slice(-20) // Return only most recent 20
  };
}

/**
 * Clear completed jobs from memory
 * @param {number} olderThanHours - Clear jobs older than this many hours
 * @returns {number} Number of jobs cleared
 */
function clearCompletedJobs(olderThanHours = 24) {
  const cutoffTime = new Date(Date.now() - (olderThanHours * 60 * 60 * 1000));
  let cleared = 0;
  
  for (const [jobId, job] of completedJobs.entries()) {
    if (job.completedAt < cutoffTime) {
      completedJobs.delete(jobId);
      cleared++;
    }
  }
  
  return cleared;
}

module.exports = {
  addJob,
  getJobStatus,
  getAllJobs,
  clearCompletedJobs
};
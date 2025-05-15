const jobQueue = require('./jobQueue');
const fs = require('fs').promises;
const path = require('path');

// Queue maintenance interval (4 hours)
const CLEANUP_INTERVAL = 4 * 60 * 60 * 1000;

// Path for persistent job status storage
const STATUS_FILE_PATH = path.join(process.cwd(), 'data', 'job_status.json');

/**
 * Initialize the queue management system
 */
async function initQueueManager() {
  console.log('Initializing Queue Manager...');
  
  // Set up periodic queue cleanup
  setInterval(() => {
    const clearedCount = jobQueue.clearCompletedJobs(24);
    if (clearedCount > 0) {
      console.log(`Cleared ${clearedCount} completed jobs from memory`);
    }
    
    // Save current queue state to disk
    saveQueueState();
  }, CLEANUP_INTERVAL);
  
  // Attempt to load previous queue state
  await loadQueueState();
  
  console.log('Queue Manager initialized');
}

/**
 * Save the current state of the queue to disk
 */
async function saveQueueState() {
  try {
    // Create data directory if it doesn't exist
    await fs.mkdir(path.dirname(STATUS_FILE_PATH), { recursive: true });
    
    // Get all job information
    const jobState = jobQueue.getAllJobs();
    
    // Save to disk
    await fs.writeFile(STATUS_FILE_PATH, JSON.stringify(jobState, null, 2));
    
    console.log('Queue state saved to disk');
  } catch (error) {
    console.error('Error saving queue state:', error);
  }
}

/**
 * Load previous queue state from disk
 */
async function loadQueueState() {
  try {
    // Check if the status file exists
    try {
      await fs.access(STATUS_FILE_PATH);
    } catch (e) {
      // File doesn't exist, nothing to load
      console.log('No previous queue state found');
      return;
    }
    
    // Read the file
    const data = await fs.readFile(STATUS_FILE_PATH, 'utf8');
    const jobState = JSON.parse(data);
    
    // TODO: In a full implementation, we would rehydrate the queue with
    // previously running jobs, but for this simple version, we'll just log
    console.log(`Found ${jobState.completed.length} previously completed jobs`);
    
  } catch (error) {
    console.error('Error loading queue state:', error);
  }
}

module.exports = {
  initQueueManager,
  saveQueueState
};
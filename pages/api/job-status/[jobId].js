// Import conditionally to match run-model.js
let jobQueue;
if (process.env.DISABLE_QUEUE_MANAGER === 'false' || !process.env.DISABLE_QUEUE_MANAGER) {
  try {
    const getJobQueue = require('../../../lib/queue/singleton');
    jobQueue = getJobQueue();
  } catch (error) {
    console.warn('Job queue not available in job-status:', error.message);
  }
}

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    // Get the job ID from the request
    const { jobId } = req.query;
    
    if (!jobId) {
      return res.status(400).json({ message: 'Job ID is required' });
    }
    
    // Get the job status
    const status = jobQueue.getJobStatus(jobId);
    
    console.log(`Checking status for job ${jobId}:`, status);
    console.log('All jobs:', jobQueue.getAllJobs());
    
    if (!status) {
      return res.status(404).json({ 
        message: 'Job not found',
        jobId
      });
    }
    
    // Return the job status
    return res.status(200).json({
      jobId,
      ...status
    });
    
  } catch (error) {
    console.error('Error fetching job status:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch job status',
      error: error.message
    });
  }
}
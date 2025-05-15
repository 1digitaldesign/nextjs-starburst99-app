let jobQueue;
if (process.env.DISABLE_QUEUE_MANAGER !== 'true') {
  try {
    jobQueue = require('../../lib/queue/jobQueue');
  } catch (error) {
    console.warn('Job queue not available:', error.message);
  }
}

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    // Check if queue is available
    if (!jobQueue || typeof jobQueue.getAllJobs !== 'function') {
      return res.status(200).json({
        queueLength: 0,
        activeJobs: 0,
        recentlyCompleted: 0,
        jobs: {
          queued: [],
          active: [],
          completed: []
        },
        message: 'Queue system is not available'
      });
    }
    
    // Get all jobs from the queue
    const jobs = jobQueue.getAllJobs();
    
    // Return the jobs
    return res.status(200).json({
      queueLength: jobs.queued.length,
      activeJobs: jobs.active.length,
      recentlyCompleted: jobs.completed.length,
      jobs
    });
    
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch jobs',
      error: error.message
    });
  }
}
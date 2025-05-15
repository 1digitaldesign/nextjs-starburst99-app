import jobQueue from '../../lib/queue/jobQueue';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
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
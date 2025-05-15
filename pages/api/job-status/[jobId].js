import jobQueue from '../../../lib/queue/jobQueue';

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
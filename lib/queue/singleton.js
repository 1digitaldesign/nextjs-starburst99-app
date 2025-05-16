// Singleton pattern to ensure we share the same jobQueue instance across modules
let jobQueueInstance = null;

function getJobQueue() {
  if (!jobQueueInstance) {
    try {
      jobQueueInstance = require('./jobQueue');
      console.log('Created new jobQueue instance');
    } catch (error) {
      console.error('Failed to create jobQueue instance:', error);
    }
  }
  return jobQueueInstance;
}

module.exports = getJobQueue;
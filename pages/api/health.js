export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    message: 'API is working',
    environment: process.env.NODE_ENV,
    queueDisabled: process.env.DISABLE_QUEUE_MANAGER === 'true',
    timestamp: new Date().toISOString()
  });
}
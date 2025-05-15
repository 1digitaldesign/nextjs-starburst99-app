import { get } from '@vercel/edge-config';

export default async function handler(req, res) {
  let edgeConfigStatus = 'unknown';
  let edgeConfigConnected = false;
  
  // Test Edge Config connection
  try {
    const test = await get('app_metadata');
    edgeConfigStatus = 'connected';
    edgeConfigConnected = true;
  } catch (error) {
    edgeConfigStatus = 'not configured';
    edgeConfigConnected = false;
  }
  
  res.status(200).json({
    status: 'ok',
    message: 'API is working',
    environment: process.env.NODE_ENV,
    queueDisabled: process.env.DISABLE_QUEUE_MANAGER === 'true',
    edgeConfig: {
      status: edgeConfigStatus,
      connected: edgeConfigConnected
    },
    timestamp: new Date().toISOString()
  });
}
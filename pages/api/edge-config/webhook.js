// This webhook endpoint can be called by external services to update Edge Config
// Since Edge Config is read-only from the app, updates must be done via Vercel API

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { action, runId, modelName, parameters, status, ...additionalData } = req.body;
    
    // Verify webhook secret (if configured)
    const webhookSecret = process.env.EDGE_CONFIG_WEBHOOK_SECRET;
    if (webhookSecret && req.headers['x-webhook-secret'] !== webhookSecret) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Log the webhook request
    console.log('Edge Config webhook received:', {
      action,
      runId,
      modelName,
      status
    });

    // Prepare the response based on action
    let response = { success: false };
    
    switch (action) {
      case 'create_model':
        // This would typically trigger an API call to Vercel Edge Config API
        response = {
          success: true,
          message: 'Model creation logged. Update Edge Config via Vercel API.',
          data: {
            runId,
            modelName,
            parameters,
            timestamp: new Date().toISOString()
          }
        };
        break;
        
      case 'update_status':
        response = {
          success: true,
          message: 'Status update logged. Update Edge Config via Vercel API.',
          data: {
            runId,
            status,
            ...additionalData,
            timestamp: new Date().toISOString()
          }
        };
        break;
        
      default:
        response = {
          success: false,
          message: `Unknown action: ${action}`
        };
    }

    return res.status(200).json(response);
    
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ 
      message: 'Failed to process webhook',
      error: error.message
    });
  }
}
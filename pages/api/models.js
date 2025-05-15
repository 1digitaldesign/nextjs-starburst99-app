import { getAllModelRuns } from '../../lib/edge-config';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get models from Edge Config
    let models = [];
    try {
      models = await getAllModelRuns();
      console.log(`Found ${models.length} models in Edge Config`);
    } catch (error) {
      console.warn('Could not fetch models from Edge Config:', error.message);
      // Return empty array if Edge Config is not available
    }

    return res.status(200).json({
      models,
      count: models.length,
      source: 'edge-config',
      message: models.length > 0 ? 'Models fetched from Edge Config' : 'No models found'
    });

  } catch (error) {
    console.error('Error fetching models:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch models',
      error: error.message
    });
  }
}
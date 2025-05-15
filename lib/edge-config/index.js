import { get, getAll, has } from '@vercel/edge-config';

// Model run operations using Edge Config
export async function getModelRun(runId) {
  try {
    const key = `model_run_${runId}`;
    const modelRun = await get(key);
    return modelRun;
  } catch (error) {
    console.error('Error getting model run from Edge Config:', error);
    return null;
  }
}

export async function getAllModelRuns() {
  try {
    // Get all items from Edge Config
    const allItems = await getAll();
    
    // Filter for model run entries
    const modelRuns = Object.entries(allItems)
      .filter(([key, value]) => key.startsWith('model_run_'))
      .map(([key, value]) => ({
        id: key.replace('model_run_', ''),
        ...value
      }))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    return modelRuns;
  } catch (error) {
    console.error('Error getting all model runs from Edge Config:', error);
    return [];
  }
}

export async function checkModelRunExists(runId) {
  try {
    const key = `model_run_${runId}`;
    return await has(key);
  } catch (error) {
    console.error('Error checking if model run exists:', error);
    return false;
  }
}

// Queue operations
export async function getQueueStatus() {
  try {
    const queue = await get('queue_status');
    return queue || {
      queued: [],
      active: [],
      completed: []
    };
  } catch (error) {
    console.error('Error getting queue status from Edge Config:', error);
    return {
      queued: [],
      active: [],
      completed: []
    };
  }
}

// Get metadata
export async function getMetadata() {
  try {
    const metadata = await get('app_metadata');
    return metadata || {
      total_runs: 0,
      last_updated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting metadata from Edge Config:', error);
    return {
      total_runs: 0,
      last_updated: new Date().toISOString()
    };
  }
}
// Edge Config is read-only from the application
// Updates need to be done via Vercel API or dashboard
// This file provides the structure for external updates

export const EdgeConfigKeys = {
  modelRun: (runId) => `model_run_${runId}`,
  queueStatus: 'queue_status',
  metadata: 'app_metadata'
};

export const createModelRunData = (runId, modelName, parameters) => ({
  id: runId,
  model_name: modelName,
  status: 'created',
  created_at: new Date().toISOString(),
  parameters: parameters,
  result_files: null,
  error_message: null
});

export const updateModelRunStatus = (existingData, status, additionalData = {}) => ({
  ...existingData,
  status,
  ...(status === 'running' && { started_at: new Date().toISOString() }),
  ...(status === 'completed' && { completed_at: new Date().toISOString() }),
  ...(additionalData.error_message && { error_message: additionalData.error_message }),
  ...(additionalData.result_files && { result_files: additionalData.result_files })
});

// Example webhook payload for updating Edge Config via Vercel API
export const createWebhookPayload = (edgeConfigId, updates) => ({
  method: 'PATCH',
  headers: {
    Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    items: updates.map(({ key, value }) => ({
      operation: 'upsert',
      key,
      value
    }))
  })
});

// Instructions for setting up Edge Config updates
export const setupInstructions = `
To enable model tracking with Edge Config:

1. Create an Edge Config store in Vercel Dashboard
2. Note the Edge Config ID
3. Set up a webhook or serverless function to update Edge Config
4. Use the Vercel API to update Edge Config when models are created/updated

Example API call:
PATCH https://api.vercel.com/v1/edge-config/{edgeConfigId}/items

Authorization: Bearer {VERCEL_TOKEN}
Content-Type: application/json

{
  "items": [
    {
      "operation": "upsert",
      "key": "model_run_xyz123",
      "value": {
        "id": "xyz123",
        "model_name": "Test Model",
        "status": "created",
        "created_at": "2024-01-15T10:00:00Z"
      }
    }
  ]
}
`;
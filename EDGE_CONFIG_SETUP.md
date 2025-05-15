# Edge Config Setup Guide

This application uses Vercel Edge Config for distributed, read-only data storage of model runs.

## Setting Up Edge Config

### 1. Create Edge Config Store

1. Go to your Vercel project dashboard
2. Navigate to the "Storage" tab
3. Click "Create Database"
4. Select "Edge Config"
5. Name your store (e.g., "starburst99-models")
6. Create the store

### 2. Connect Edge Config to Your Project

After creating the Edge Config store:

1. The connection will be automatically established
2. Environment variables will be added to your project:
   - `EDGE_CONFIG` - The connection string

### 3. Initial Edge Config Data Structure

Initialize your Edge Config with these keys:

```json
{
  "app_metadata": {
    "total_runs": 0,
    "last_updated": "2024-01-15T00:00:00Z"
  },
  "queue_status": {
    "queued": [],
    "active": [],
    "completed": []
  }
}
```

### 4. Model Run Data Structure

When creating model runs, use this structure:

```json
{
  "model_run_${runId}": {
    "id": "run-1234567890-abc123",
    "model_name": "Solar Metallicity Burst",
    "status": "created",
    "created_at": "2024-01-15T10:00:00Z",
    "started_at": null,
    "completed_at": null,
    "parameters": {
      "metallicity": "0.020",
      "imf": "kroupa",
      "starFormation": "instantaneous"
    },
    "result_files": null,
    "error_message": null
  }
}
```

## Updating Edge Config

Since Edge Config is read-only from the application, updates must be done via:

### Option 1: Vercel Dashboard

1. Go to your Edge Config store
2. Click "Edit"
3. Add/modify entries
4. Save changes

### Option 2: Vercel API

Use the Vercel API to programmatically update Edge Config:

```bash
curl -X PATCH https://api.vercel.com/v1/edge-config/{edgeConfigId}/items \
  -H "Authorization: Bearer {VERCEL_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

### Option 3: External Service with Webhook

1. Set up an external service that monitors model runs
2. When a model is created/updated, call the webhook:

```bash
curl -X POST https://your-app.vercel.app/api/edge-config/webhook \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: your-secret" \
  -d '{
    "action": "create_model",
    "runId": "run-1234567890-abc123",
    "modelName": "Test Model",
    "parameters": {
      "metallicity": "0.020"
    }
  }'
```

3. The external service then updates Edge Config via Vercel API

## Environment Variables

Add these to your Vercel project:

- `EDGE_CONFIG` - Automatically set when you connect Edge Config
- `EDGE_CONFIG_WEBHOOK_SECRET` - Optional secret for webhook authentication
- `VERCEL_TOKEN` - Required for programmatic Edge Config updates

## Monitoring

The app provides several endpoints to monitor Edge Config:

- `/api/health` - Shows Edge Config connection status
- `/api/models` - Lists all models from Edge Config
- `/api/edge-config/webhook` - Webhook endpoint for external updates

## Best Practices

1. Keep Edge Config data minimal - store only essential metadata
2. Use file storage for large data (input files, results)
3. Update Edge Config asynchronously to avoid blocking requests
4. Implement proper error handling for Edge Config failures
5. Cache Edge Config reads when possible for better performance

## Limitations

- Edge Config has a size limit (512KB per store)
- Updates are eventually consistent (may take a few seconds)
- Read-only from the application (updates via API only)
- Maximum 10000 items per store
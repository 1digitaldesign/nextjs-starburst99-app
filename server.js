const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { initQueueManager } = require('./lib/queue/queueManager');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Prepare the Next.js app
const app = next({ dev });
const handle = app.getRequestHandler();

// Initialize the app and queue manager (if enabled)
app.prepare().then(() => {
  // Only initialize queue manager if not disabled
  if (process.env.DISABLE_QUEUE_MANAGER !== 'true') {
    console.log('Initializing Queue Manager...');
    initQueueManager().catch(err => {
      console.error('Error initializing queue manager:', err);
    });
  } else {
    console.log('Queue Manager initialization disabled by environment variable');
  }
  
  // Create the HTTP server
  const server = createServer(async (req, res) => {
    try {
      // Parse the URL
      const parsedUrl = parse(req.url, true);
      
      // Let Next.js handle the request
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  server.listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log('> Press CTRL+C to stop the server');
  });
  
  // Handle server shutdown
  ['SIGINT', 'SIGTERM'].forEach(signal => {
    process.on(signal, () => {
      console.log(`> ${signal} signal received, closing server`);
      server.close(() => {
        console.log('> Server closed');
        process.exit(0);
      });
    });
  });
}).catch(err => {
  console.error('Error starting server:', err);
  process.exit(1);
});
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { initQueueManager } = require('./lib/queue/queueManager');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Prepare the Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Initialize the app and queue manager
app.prepare().then(() => {
  // Initialize the job queue manager
  initQueueManager().catch(err => {
    console.error('Error initializing queue manager:', err);
  });
  
  // Create the HTTP server
  createServer(async (req, res) => {
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
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
}).catch(err => {
  console.error('Error starting server:', err);
  process.exit(1);
});
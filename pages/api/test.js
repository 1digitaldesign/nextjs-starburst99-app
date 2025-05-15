export default function handler(req, res) {
  console.log('Test API called');
  console.log('Method:', req.method);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  
  res.status(200).json({ 
    message: 'Test API is working',
    method: req.method,
    body: req.body,
    timestamp: new Date().toISOString()
  });
}
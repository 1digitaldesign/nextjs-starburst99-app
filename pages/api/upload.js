import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Disable the default body parser to handle form data
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    // Create folder to store uploads if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Configure formidable
    const form = new formidable.IncomingForm({
      uploadDir,
      keepExtensions: true,
      maxFiles: 5,       // Allow up to 5 files
      maxFileSize: 10 * 1024 * 1024, // 10MB max size
      filter: (part) => {
        // Only accept text files and data files
        return (
          part.name === 'files' && 
          (part.mimetype?.includes('text') || 
           !part.mimetype || 
           part.originalFilename?.endsWith('.dat') ||
           part.originalFilename?.endsWith('.input'))
        );
      },
    });
    
    // Parse incoming form data
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });
    
    // Create a unique ID for this batch of uploads
    const uploadId = uuidv4();
    const finalDir = path.join(uploadDir, uploadId);
    fs.mkdirSync(finalDir, { recursive: true });
    
    // Process uploaded files
    const fileArray = Array.isArray(files.files) ? files.files : [files.files];
    const fileData = [];
    
    for (const file of fileArray) {
      if (!file) continue;
      
      // Move file to the final directory with original name
      const finalPath = path.join(finalDir, file.originalFilename);
      fs.renameSync(file.filepath, finalPath);
      
      // Detect file type
      let fileType = 'unknown';
      if (file.originalFilename.endsWith('.input') || file.originalFilename === 'standard.input1') {
        fileType = 'input';
      } else if (file.originalFilename.endsWith('.dat')) {
        fileType = 'data';
      } else if (file.mimetype?.includes('text')) {
        fileType = 'text';
      }
      
      fileData.push({
        name: file.originalFilename,
        path: finalPath,
        type: fileType,
        size: file.size,
      });
    }
    
    // Return success response with file info
    return res.status(200).json({
      message: 'Files uploaded successfully',
      uploadId,
      files: fileData
    });
    
  } catch (error) {
    console.error('Error handling file upload:', error);
    return res.status(500).json({ 
      message: 'Failed to process file upload',
      error: error.message 
    });
  }
}
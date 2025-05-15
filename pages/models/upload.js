import React, { useState, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import axios from 'axios';
import styles from '../../styles/Upload.module.css';

export default function UploadModelFiles() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [modelName, setModelName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploadId, setUploadId] = useState(null);
  const [error, setError] = useState(null);
  const [runningModel, setRunningModel] = useState(false);
  
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };
  
  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (selectedFiles.length === 0) {
      setError('Please select at least one file to upload');
      return;
    }
    
    setUploading(true);
    setError(null);
    
    try {
      // Create form data
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });
      
      // Upload files
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setUploadComplete(true);
      setUploadId(response.data.uploadId);
      
    } catch (err) {
      console.error('Error uploading files:', err);
      setError(err.response?.data?.message || err.message || 'Failed to upload files');
    } finally {
      setUploading(false);
    }
  };
  
  const runModelWithFiles = async () => {
    if (!uploadId) return;
    
    setRunningModel(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/run-with-files', {
        uploadId,
        modelName: modelName || 'Uploaded Files Model'
      });
      
      // Redirect to results page
      if (response.data && response.data.runId) {
        router.push(`/models/results/${response.data.runId}`);
      } else {
        throw new Error('No run ID returned from API');
      }
      
    } catch (err) {
      console.error('Error running model with uploaded files:', err);
      setError(err.response?.data?.message || err.message || 'Failed to run model');
      setRunningModel(false);
    }
  };
  
  return (
    <div className={styles.container}>
      <Head>
        <title>Upload Model Files - Starburst99</title>
        <meta name="description" content="Upload custom files for Starburst99 model" />
      </Head>
      
      <main className={styles.main}>
        <h1 className={styles.title}>Upload Custom Model Files</h1>
        
        <div className={styles.description}>
          <p>Upload your own input files for Starburst99 to run a custom model configuration.</p>
          <p>Acceptable files: <code>.input</code>, <code>.dat</code>, and other text files.</p>
        </div>
        
        {error && (
          <div className={styles.error}>
            <p>{error}</p>
          </div>
        )}
        
        {!uploadComplete ? (
          <form className={styles.uploadForm} onSubmit={handleUpload}>
            <div className={styles.formGroup}>
              <label htmlFor="modelName">Model Name (Optional)</label>
              <input 
                type="text"
                id="modelName"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className={styles.input}
                placeholder="e.g., My Custom Model"
              />
            </div>
            
            <div className={styles.uploadArea}>
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                className={styles.fileInput}
                id="fileInput"
              />
              <label htmlFor="fileInput" className={styles.fileLabel}>
                <div className={styles.uploadIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                </div>
                <span>Click to select files or drag and drop</span>
              </label>
              
              {selectedFiles.length > 0 && (
                <div className={styles.fileList}>
                  <h3>Selected Files:</h3>
                  <ul>
                    {selectedFiles.map((file, index) => (
                      <li key={index}>
                        {file.name} ({(file.size / 1024).toFixed(1)} KB)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <button 
              type="submit" 
              className={styles.button}
              disabled={uploading || selectedFiles.length === 0}
            >
              {uploading ? 'Uploading...' : 'Upload Files'}
            </button>
          </form>
        ) : (
          <div className={styles.successMessage}>
            <div className={styles.successIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h2>Upload Complete!</h2>
            <p>Your files have been uploaded successfully. You can now run the model with these files.</p>
            
            <button 
              className={styles.button}
              onClick={runModelWithFiles}
              disabled={runningModel}
            >
              {runningModel ? 'Running Model...' : 'Run Model with Uploaded Files'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';
import styles from '../../styles/Queue.module.css';

export default function QueueStatus() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [queueData, setQueueData] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(10);
  
  // Function to fetch queue data
  const fetchQueueData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/jobs');
      setQueueData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching queue data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch queue data');
    } finally {
      setLoading(false);
    }
  };
  
  // Set up periodic refresh
  useEffect(() => {
    // Initial fetch
    fetchQueueData();
    
    // Set up interval for refreshing
    const intervalId = setInterval(() => {
      fetchQueueData();
    }, refreshInterval * 1000);
    
    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, [refreshInterval]);
  
  // Render job information
  const renderJobInfo = (job) => {
    return (
      <div key={job.id} className={styles.jobCard}>
        <div className={styles.jobHeader}>
          <h3 className={styles.jobId}>{job.id}</h3>
          <span className={`${styles.status} ${styles[job.status]}`}>
            {job.status}
          </span>
        </div>
        
        <div className={styles.jobDetails}>
          {job.modelName && (
            <p><strong>Model:</strong> {job.modelName}</p>
          )}
          
          {job.createdAt && (
            <p><strong>Created:</strong> {new Date(job.createdAt).toLocaleString()}</p>
          )}
          
          {job.startedAt && (
            <p><strong>Started:</strong> {new Date(job.startedAt).toLocaleString()}</p>
          )}
          
          {job.completedAt && (
            <p><strong>Completed:</strong> {new Date(job.completedAt).toLocaleString()}</p>
          )}
          
          {job.runTime !== undefined && (
            <p><strong>Runtime:</strong> {(job.runTime / 1000).toFixed(2)} seconds</p>
          )}
          
          {job.queuePosition !== undefined && (
            <p><strong>Queue Position:</strong> {job.queuePosition}</p>
          )}
          
          {job.status === 'completed' && (
            <div className={styles.jobActions}>
              <Link href={`/models/results/${job.id}`} className={styles.viewResults}>
                View Results
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className={styles.container}>
      <Head>
        <title>Job Queue Status - Starburst99</title>
        <meta name="description" content="View the status of the Starburst99 job queue" />
      </Head>
      
      <main className={styles.main}>
        <h1 className={styles.title}>Job Queue Status</h1>
        
        <div className={styles.controls}>
          <button onClick={fetchQueueData} className={styles.refreshButton}>
            Refresh Now
          </button>
          
          <div className={styles.refreshRateControl}>
            <label htmlFor="refreshRate">Auto-refresh every:</label>
            <select
              id="refreshRate"
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className={styles.select}
            >
              <option value="5">5 seconds</option>
              <option value="10">10 seconds</option>
              <option value="30">30 seconds</option>
              <option value="60">1 minute</option>
              <option value="300">5 minutes</option>
            </select>
          </div>
        </div>
        
        {loading && !queueData && (
          <div className={styles.loading}>Loading queue data...</div>
        )}
        
        {error && (
          <div className={styles.error}>{error}</div>
        )}
        
        {queueData && (
          <div className={styles.queueData}>
            <div className={styles.summary}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Queued:</span>
                <span className={styles.summaryValue}>{queueData.queueLength}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Active:</span>
                <span className={styles.summaryValue}>{queueData.activeJobs}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Completed:</span>
                <span className={styles.summaryValue}>{queueData.recentlyCompleted}</span>
              </div>
            </div>
            
            {queueData.jobs.active.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Active Jobs</h2>
                <div className={styles.jobList}>
                  {queueData.jobs.active.map(renderJobInfo)}
                </div>
              </div>
            )}
            
            {queueData.jobs.queued.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Queued Jobs</h2>
                <div className={styles.jobList}>
                  {queueData.jobs.queued.map(renderJobInfo)}
                </div>
              </div>
            )}
            
            {queueData.jobs.completed.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Recently Completed Jobs</h2>
                <div className={styles.jobList}>
                  {queueData.jobs.completed.map(renderJobInfo)}
                </div>
              </div>
            )}
            
            {queueData.jobs.queued.length === 0 && 
             queueData.jobs.active.length === 0 && 
             queueData.jobs.completed.length === 0 && (
              <div className={styles.emptyMessage}>
                <p>No jobs in the queue system</p>
              </div>
            )}
          </div>
        )}
        
        <div className={styles.actions}>
          <Link href="/" className={styles.link}>
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
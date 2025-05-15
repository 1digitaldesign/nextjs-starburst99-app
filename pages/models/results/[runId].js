import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import axios from 'axios';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import styles from '../../../styles/ModelResults.module.css';

// Dynamically import our visualization components to avoid SSR issues
const SpectralChart = dynamic(
  () => import('../../../components/spectral/SpectralChart'),
  { ssr: false, loading: () => <div className={styles.loading}>Loading chart...</div> }
);

const ColorEvolution = dynamic(
  () => import('../../../components/spectral/ColorEvolution'),
  { ssr: false, loading: () => <div className={styles.loading}>Loading chart...</div> }
);

export default function ModelResults() {
  const router = useRouter();
  const { runId } = router.query;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modelData, setModelData] = useState(null);
  const [activeTab, setActiveTab] = useState('spectrum');
  const [modelInfo, setModelInfo] = useState({
    name: '',
    date: '',
    parameters: {}
  });
  
  useEffect(() => {
    if (!runId) return;
    
    const fetchModelData = async () => {
      try {
        setLoading(true);
        
        // Fetch the default spectrum data
        const response = await axios.get(`/api/model-results/${runId}?fileType=spectrum1`);
        setModelData(response.data);
        
        // Extract model info from run ID (format: run-timestamp-randomstring)
        const timestamp = runId.split('-')[1];
        if (timestamp) {
          const date = new Date(parseInt(timestamp));
          setModelInfo(prev => ({
            ...prev,
            date: date.toLocaleString()
          }));
        }
        
      } catch (err) {
        console.error('Error fetching model data:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch model results');
      } finally {
        setLoading(false);
      }
    };
    
    fetchModelData();
  }, [runId]);
  
  const fetchDataType = async (fileType) => {
    if (!runId) return;
    
    try {
      setLoading(true);
      setActiveTab(fileType.replace('1', ''));
      
      const response = await axios.get(`/api/model-results/${runId}?fileType=${fileType}`);
      setModelData(response.data);
      
    } catch (err) {
      console.error(`Error fetching ${fileType} data:`, err);
      setError(err.response?.data?.message || err.message || `Failed to fetch ${fileType} data`);
    } finally {
      setLoading(false);
    }
  };
  
  // Render content based on active tab
  const renderContent = () => {
    if (loading) {
      return <div className={styles.loading}>Loading model results...</div>;
    }
    
    if (error) {
      return <div className={styles.error}>{error}</div>;
    }
    
    if (!modelData) {
      return <div className={styles.message}>No model data found</div>;
    }
    
    switch (activeTab) {
      case 'spectrum':
        if (!modelData.data || !modelData.data.data) {
          return <div className={styles.message}>No spectrum data available</div>;
        }
        return (
          <SpectralChart 
            spectrumData={modelData.data.data} 
            wavelengthUnit={modelData.data.wavelengthUnit} 
            fluxUnit={modelData.data.fluxUnit} 
          />
        );
        
      case 'color':
        if (!modelData.data || !modelData.data.data) {
          return <div className={styles.message}>No color data available</div>;
        }
        return <ColorEvolution colorData={modelData.data.data} />;
        
      case 'raw':
        if (!modelData.data || !modelData.data.raw) {
          return <div className={styles.message}>No raw data available</div>;
        }
        return (
          <div className={styles.rawData}>
            <pre>{modelData.data.raw}</pre>
          </div>
        );
        
      default:
        return <div className={styles.message}>Select a data type to view</div>;
    }
  };
  
  // Get the appropriate name for the run ID display
  const getDisplayName = () => {
    if (modelInfo.name) {
      return modelInfo.name;
    }
    
    // Extract just the unique part of the run ID for display
    return runId ? runId.split('-').slice(2).join('-') : 'Model Results';
  };
  
  return (
    <div className={styles.container}>
      <Head>
        <title>{modelData ? `Model Results: ${getDisplayName()}` : 'Model Results'}</title>
        <meta name="description" content="Starburst99 model results" />
      </Head>
      
      <main className={styles.main}>
        <h1 className={styles.title}>
          {modelData ? `Model Results: ${getDisplayName()}` : 'Model Results'}
        </h1>
        
        {modelInfo.date && (
          <div className={styles.modelMeta}>
            <p>Run on: {modelInfo.date}</p>
          </div>
        )}
        
        <div className={styles.tabs}>
          <button 
            className={`${styles.tabButton} ${activeTab === 'spectrum' ? styles.active : ''}`}
            onClick={() => fetchDataType('spectrum1')}
          >
            Spectral Energy Distribution
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'color' ? styles.active : ''}`}
            onClick={() => fetchDataType('color1')}
          >
            Color Evolution
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'raw' ? styles.active : ''}`}
            onClick={() => fetchDataType('output1')}
          >
            Raw Output
          </button>
        </div>
        
        <div className={styles.content}>
          {renderContent()}
        </div>
        
        <div className={styles.actions}>
          <Link href="/models/new" className={styles.link}>
            Create New Model
          </Link>
          <Link href="/models/upload" className={styles.link}>
            Upload Files
          </Link>
        </div>
      </main>
    </div>
  );
}
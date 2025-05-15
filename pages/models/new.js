import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import axios from 'axios';
import styles from '../../styles/NewModel.module.css';

export default function NewModel() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Basic model parameters
  const [modelName, setModelName] = useState('');
  const [metallicity, setMetallicity] = useState('0.020');
  const [imf, setImf] = useState('kroupa');
  const [starFormation, setStarFormation] = useState('instantaneous');
  
  // Advanced time evolution parameters
  const [timeMin, setTimeMin] = useState(0.01);
  const [timeMax, setTimeMax] = useState(50.0);
  const [timeStep, setTimeStep] = useState(0.1);
  
  // Advanced mass range parameters
  const [massMin, setMassMin] = useState(0.1);
  const [massMax, setMassMax] = useState(100.0);
  
  // UI state
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Create the model configuration object
      const modelConfig = {
        modelName,
        parameters: {
          metallicity,
          imf,
          starFormation,
          time_min: parseFloat(timeMin),
          time_max: parseFloat(timeMax),
          time_step: parseFloat(timeStep),
          mass_min: parseFloat(massMin),
          mass_max: parseFloat(massMax)
        }
      };
      
      console.log('Submitting model config:', modelConfig);
      
      // Submit to the API
      const response = await axios.post('/api/run-model', modelConfig);
      console.log('API response:', response.data);
      
      // Handle different response scenarios
      if (response.data && response.data.runId) {
        if (response.data.status === 'queued') {
          // Normal flow - model was queued successfully
          router.push(`/models/results/${response.data.runId}`);
        } else if (response.data.status === 'created') {
          // Queue unavailable - show message but still redirect
          alert(response.data.note || 'Model created but queue unavailable');
          router.push(`/models/results/${response.data.runId}`);
        } else {
          // Unknown status
          throw new Error(`Unexpected status: ${response.data.status}`);
        }
      } else {
        throw new Error('No run ID returned from API');
      }
    } catch (err) {
      console.error('Error submitting model:', err);
      console.error('Error response:', err.response);
      console.error('Error details:', err.response?.data);
      
      // Show more detailed error message
      const errorMessage = err.response?.data?.details 
        ? `${err.response.data.message}: ${err.response.data.error}`
        : err.response?.data?.message || err.message || 'Failed to run model';
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className={styles.container}>
      <Head>
        <title>New Starburst99 Model</title>
        <meta name="description" content="Create a new Starburst99 model" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Create New Starburst99 Model</h1>
        
        {error && (
          <div className={styles.error}>
            <p>{error}</p>
          </div>
        )}
        
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="modelName">Model Name</label>
            <input 
              id="modelName"
              type="text" 
              value={modelName} 
              onChange={(e) => setModelName(e.target.value)}
              required
              className={styles.input}
              placeholder="e.g., SolarMetallicity_Burst"
            />
            <small>A unique name to identify this model run</small>
          </div>
          
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Basic Parameters</h3>
            
            <div className={styles.formGroup}>
              <label htmlFor="metallicity">Metallicity (Z)</label>
              <select 
                id="metallicity"
                value={metallicity} 
                onChange={(e) => setMetallicity(e.target.value)}
                className={styles.select}
              >
                <option value="0.001">0.001 (very low)</option>
                <option value="0.004">0.004 (low)</option>
                <option value="0.008">0.008 (SMC)</option>
                <option value="0.020">0.020 (solar)</option>
                <option value="0.040">0.040 (high)</option>
              </select>
              <small>Metal content of stars (Z=0.020 is solar)</small>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="imf">Initial Mass Function</label>
              <select 
                id="imf"
                value={imf} 
                onChange={(e) => setImf(e.target.value)}
                className={styles.select}
              >
                <option value="kroupa">Kroupa (default)</option>
                <option value="salpeter">Salpeter</option>
                <option value="chabrier">Chabrier</option>
                <option value="topHeavy">Top Heavy</option>
                <option value="bottomHeavy">Bottom Heavy</option>
              </select>
              <small>Distribution of initial stellar masses</small>
            </div>
            
            <div className={styles.formGroup}>
              <label>Star Formation Mode</label>
              <div className={styles.radioGroup}>
                <label>
                  <input 
                    type="radio" 
                    name="starFormation"
                    value="instantaneous" 
                    checked={starFormation === 'instantaneous'} 
                    onChange={(e) => setStarFormation(e.target.value)} 
                  />
                  Instantaneous Burst
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="starFormation"
                    value="continuous" 
                    checked={starFormation === 'continuous'} 
                    onChange={(e) => setStarFormation(e.target.value)} 
                  />
                  Continuous
                </label>
              </div>
              <small>How stars form over time</small>
            </div>
          </div>
          
          <div className={styles.advancedToggle}>
            <button 
              type="button" 
              className={styles.toggleButton}
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
            </button>
          </div>
          
          {showAdvanced && (
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>Advanced Parameters</h3>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="timeMin">Minimum Time (Myr)</label>
                  <input 
                    id="timeMin"
                    type="number" 
                    step="0.01"
                    min="0.01"
                    max="10"
                    value={timeMin} 
                    onChange={(e) => setTimeMin(e.target.value)}
                    className={styles.input}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="timeMax">Maximum Time (Myr)</label>
                  <input 
                    id="timeMax"
                    type="number" 
                    step="1"
                    min="1"
                    max="1000"
                    value={timeMax} 
                    onChange={(e) => setTimeMax(e.target.value)}
                    className={styles.input}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="timeStep">Time Step (Myr)</label>
                  <input 
                    id="timeStep"
                    type="number" 
                    step="0.01"
                    min="0.01"
                    max="10"
                    value={timeStep} 
                    onChange={(e) => setTimeStep(e.target.value)}
                    className={styles.input}
                  />
                </div>
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="massMin">Minimum Mass (M☉)</label>
                  <input 
                    id="massMin"
                    type="number" 
                    step="0.1"
                    min="0.1"
                    max="10"
                    value={massMin} 
                    onChange={(e) => setMassMin(e.target.value)}
                    className={styles.input}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="massMax">Maximum Mass (M☉)</label>
                  <input 
                    id="massMax"
                    type="number" 
                    step="1"
                    min="1"
                    max="300"
                    value={massMax} 
                    onChange={(e) => setMassMax(e.target.value)}
                    className={styles.input}
                  />
                </div>
              </div>
            </div>
          )}
          
          <div className={styles.formActions}>
            <button 
              type="submit" 
              className={styles.button}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Running...' : 'Run Starburst99 Model'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
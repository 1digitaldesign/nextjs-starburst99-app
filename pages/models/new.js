import React, { useState } from 'react';
import Head from 'next/head';
import styles from '../../styles/NewModel.module.css';

export default function NewModel() {
  const [modelName, setModelName] = useState('');
  const [metallicity, setMetallicity] = useState('0.020');
  const [imf, setImf] = useState('kroupa');
  const [starFormation, setStarFormation] = useState('instantaneous');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // This would submit the model configuration to the backend
    alert(`Model configuration submitted: ${modelName}`);
  };
  
  return (
    <div className={styles.container}>
      <Head>
        <title>New Starburst99 Model</title>
        <meta name="description" content="Create a new Starburst99 model" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Create New Model</h1>
        
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
            />
          </div>
          
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
          </div>
          
          <div className={styles.formGroup}>
            <label>Star Formation</label>
            <div className={styles.radioGroup}>
              <label>
                <input 
                  type="radio" 
                  value="instantaneous" 
                  checked={starFormation === 'instantaneous'} 
                  onChange={(e) => setStarFormation(e.target.value)} 
                />
                Instantaneous Burst
              </label>
              <label>
                <input 
                  type="radio" 
                  value="continuous" 
                  checked={starFormation === 'continuous'} 
                  onChange={(e) => setStarFormation(e.target.value)} 
                />
                Continuous
              </label>
            </div>
          </div>
          
          <button type="submit" className={styles.button}>
            Run Model
          </button>
        </form>
      </main>
    </div>
  );
}
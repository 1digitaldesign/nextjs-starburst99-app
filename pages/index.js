import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import styles from '../styles/Home.module.css'

export default function Home() {
  const [apiStatus, setApiStatus] = React.useState({ loading: true, data: null });

  React.useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setApiStatus({ loading: false, data }))
      .catch(err => setApiStatus({ loading: false, error: err.message }));
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Starburst99 Web Interface</title>
        <meta name="description" content="A web interface for Starburst99 stellar synthesis code" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <span className={styles.highlight}>Starburst99</span> Web Interface
        </h1>

        <p className={styles.description}>
          A modern web interface for the Starburst99 stellar population synthesis code
        </p>

        {apiStatus.loading ? (
          <p>Checking API status...</p>
        ) : apiStatus.error ? (
          <p style={{ color: 'red' }}>API Error: {apiStatus.error}</p>
        ) : (
          <div>
            <p style={{ color: 'green' }}>
              API Status: {apiStatus.data?.status} | 
              Queue: {apiStatus.data?.queueDisabled ? 'Disabled' : 'Enabled'} | 
              Environment: {apiStatus.data?.environment}
            </p>
            <p style={{ color: apiStatus.data?.edgeConfig?.connected ? 'green' : 'orange' }}>
              Edge Config: {apiStatus.data?.edgeConfig?.status || 'Unknown'}
            </p>
          </div>
        )}

        <div className={styles.grid}>
          <Link href="/models/new" className={styles.card}>
            <h2>Run Models &rarr;</h2>
            <p>Create and run new Starburst99 models with custom parameters.</p>
          </Link>

          <Link href="/models/upload" className={styles.card}>
            <h2>Upload Files &rarr;</h2>
            <p>Use your own input files to run custom Starburst99 models.</p>
          </Link>

          <Link href="/admin/queue" className={styles.card}>
            <h2>Job Queue &rarr;</h2>
            <p>View the status of running and queued model jobs.</p>
          </Link>

          <Link href="#browse" className={styles.card}>
            <h2>Browse Results &rarr;</h2>
            <p>View and analyze results from previous model runs.</p>
          </Link>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>
          Powered by Starburst99 - Integrated with Next.js
        </p>
      </footer>
    </div>
  )
}
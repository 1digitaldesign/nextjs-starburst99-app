import Head from 'next/head'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Starburst99 Web Interface</title>
        <meta name="description" content="A web interface for Starburst99 stellar synthesis code" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a href="#">Starburst99 Web Interface</a>
        </h1>

        <p className={styles.description}>
          A modern web interface for the Starburst99 stellar population synthesis code
        </p>

        <div className={styles.grid}>
          <a href="#" className={styles.card}>
            <h2>Run Models &rarr;</h2>
            <p>Create and run new Starburst99 models with custom parameters.</p>
          </a>

          <a href="#" className={styles.card}>
            <h2>Browse Results &rarr;</h2>
            <p>View and analyze results from previous model runs.</p>
          </a>

          <a href="#" className={styles.card}>
            <h2>Documentation &rarr;</h2>
            <p>Learn about Starburst99 parameters and output formats.</p>
          </a>

          <a
            href="#"
            className={styles.card}
          >
            <h2>About &rarr;</h2>
            <p>
              Learn about the Starburst99 code and its applications in astrophysics.
            </p>
          </a>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by Starburst99
        </a>
      </footer>
    </div>
  )
}
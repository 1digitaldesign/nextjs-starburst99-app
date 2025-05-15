// Optional Fortran setup - skips in Vercel environment
if (process.env.VERCEL || process.env.CI || process.env.DISABLE_FORTRAN_SETUP) {
  console.log('Skipping Fortran setup in deployment environment');
  process.exit(0);
}

// Otherwise run the regular setup
require('./setup-fortran.js');
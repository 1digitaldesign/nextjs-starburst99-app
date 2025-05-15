#!/usr/bin/env node
/**
 * This script handles setting up the Fortran code for use with the Next.js application
 * It compiles the Starburst99 Fortran code and sets up the necessary directory structure
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const FORTRAN_SRC = path.join(PROJECT_ROOT, 'fortran');
const FORTRAN_BIN = path.join(PROJECT_ROOT, 'bin');
const MODEL_RUNS_DIR = path.join(PROJECT_ROOT, 'model_runs');
const CLEAN_GALAXY_DIR = path.join(PROJECT_ROOT, 'clean-galaxy');

// Create directories if they don't exist
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Copy Fortran source files to the project's fortran directory
function copyFortranSource() {
  ensureDirectoryExists(FORTRAN_SRC);
  
  if (fs.existsSync(CLEAN_GALAXY_DIR)) {
    console.log('Copying Fortran source files from clean-galaxy...');
    
    // Copy source files
    if (fs.existsSync(path.join(CLEAN_GALAXY_DIR, 'src'))) {
      execSync(`cp -r ${path.join(CLEAN_GALAXY_DIR, 'src')}/* ${FORTRAN_SRC}/`);
    }
    
    // Copy Makefile
    if (fs.existsSync(path.join(CLEAN_GALAXY_DIR, 'Makefile'))) {
      execSync(`cp ${path.join(CLEAN_GALAXY_DIR, 'Makefile')} ${FORTRAN_SRC}/`);
    }
    
    console.log('Fortran source files copied successfully');
  } else {
    console.error('Error: clean-galaxy directory not found');
    process.exit(1);
  }
}

// Compile the Fortran code using the provided Makefile
function compileFortranCode() {
  ensureDirectoryExists(FORTRAN_BIN);
  
  console.log('Compiling Fortran code...');
  try {
    // Navigate to the Fortran source directory
    process.chdir(FORTRAN_SRC);
    
    // Run make command
    execSync('make fixed', { stdio: 'inherit' });
    
    // Copy compiled binary to bin directory
    execSync(`cp galaxy_fixed ${path.join(FORTRAN_BIN, 'starburst99')}`);
    
    console.log('Fortran code compiled successfully');
  } catch (error) {
    console.error('Error compiling Fortran code:', error.message);
    process.exit(1);
  }
}

// Prepare data directories and symlinks
function setupDataDirectories() {
  console.log('Setting up data directories...');
  
  // Create symlinks for data directories
  for (const dir of ['data', 'json_data']) {
    const targetPath = path.join(FORTRAN_SRC, dir);
    const sourcePath = path.join(CLEAN_GALAXY_DIR, dir);
    
    if (fs.existsSync(sourcePath) && !fs.existsSync(targetPath)) {
      console.log(`Creating symlink: ${targetPath} -> ${sourcePath}`);
      fs.symlinkSync(sourcePath, targetPath, 'dir');
    }
  }
  
  // Create model runs directory
  ensureDirectoryExists(MODEL_RUNS_DIR);
  
  console.log('Data directories set up successfully');
}

// Update package.json scripts to include Fortran setup
function updatePackageJson() {
  const packageJsonPath = path.join(PROJECT_ROOT, 'package.json');
  console.log('Updating package.json...');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Add Fortran-related scripts
    packageJson.scripts = {
      ...packageJson.scripts,
      'setup-fortran': 'node scripts/setup-fortran.js',
      'postinstall': 'npm run setup-fortran'
    };
    
    // Add bin path to the environment variables for the dev and start scripts
    packageJson.scripts.dev = 'STARBURST_PATH=' + path.join(FORTRAN_BIN, 'starburst99') + ' next dev';
    packageJson.scripts.start = 'STARBURST_PATH=' + path.join(FORTRAN_BIN, 'starburst99') + ' next start';
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('package.json updated successfully');
  } catch (error) {
    console.error('Error updating package.json:', error.message);
  }
}

// Main function to run all setup steps
function main() {
  console.log('Setting up Starburst99 Fortran code for Next.js integration...');
  
  try {
    copyFortranSource();
    compileFortranCode();
    setupDataDirectories();
    updatePackageJson();
    
    console.log('Starburst99 Fortran setup completed successfully');
  } catch (error) {
    console.error('Setup failed:', error.message);
    process.exit(1);
  }
}

// Run the main function if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = {
  copyFortranSource,
  compileFortranCode,
  setupDataDirectories,
  updatePackageJson
};
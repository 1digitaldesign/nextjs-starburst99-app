const fs = require('fs');
const path = require('path');

// Directories to search for React component files
const DIRS_TO_SEARCH = [
  path.join(__dirname, '../pages'),
  path.join(__dirname, '../components')
];

// File extensions to process
const FILE_EXTENSIONS = ['.js', '.jsx'];

// Skip non-component files like configuration files
const EXCLUDE_FILES = ['next.config.js', '.babelrc', 'jest.config.js'];

// Counter for number of files modified
let filesModified = 0;

/**
 * Check if a file is a React component file
 * @param {string} content - The file content
 * @returns {boolean} - True if the file is a React component
 */
function isReactComponentFile(content) {
  // Look for JSX syntax or React component patterns
  return (
    content.includes('return (') && 
    (content.includes('<') && content.includes('/>')) ||
    content.includes('React.') ||
    content.includes('useState') ||
    content.includes('useEffect') ||
    content.includes('extends Component') ||
    content.includes('export default function')
  );
}

/**
 * Add React import if not present
 * @param {string} filePath - Path to the file
 */
function addReactImport(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Skip if not a React component
    if (!isReactComponentFile(content)) {
      console.log(`Skipping non-component file: ${filePath}`);
      return;
    }

    // Check if React is already imported
    const hasDirectReactImport = /^\s*import\s+React\b/.test(content);
    const hasNamedReactImport = /^\s*import\s+{\s*[^}]*React\s*[^}]*}\s+from\s+['"]react['"]/.test(content);
    
    if (hasDirectReactImport || hasNamedReactImport) {
      console.log(`React already imported in: ${filePath}`);
      return;
    }

    // Check if there are other imports from react
    const hasReactImport = /^\s*import\s+{([^}]*)}\s+from\s+['"]react['"]/.exec(content);
    
    let newContent;
    
    if (hasReactImport) {
      // Add React to existing import
      const importStatement = hasReactImport[0];
      const importNames = hasReactImport[1];
      const newImportStatement = importStatement.replace(
        `import {${importNames}}`, 
        `import React, {${importNames}}`
      );
      newContent = content.replace(importStatement, newImportStatement);
    } else {
      // Add new React import at the top of the file
      newContent = `import React from 'react';\n${content}`;
    }

    // Write the updated content back to the file
    fs.writeFileSync(filePath, newContent, 'utf8');
    filesModified++;
    console.log(`Added React import to: ${filePath}`);

  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}

/**
 * Recursively process all files in a directory
 * @param {string} dir - Directory to process
 */
function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    // Skip excluded files
    if (EXCLUDE_FILES.includes(file)) {
      return;
    }
    
    if (stat.isDirectory()) {
      // Recursively process subdirectories
      processDirectory(filePath);
    } else if (FILE_EXTENSIONS.includes(path.extname(file))) {
      // Process JS/JSX files
      addReactImport(filePath);
    }
  });
}

// Process all directories
DIRS_TO_SEARCH.forEach(dir => {
  if (fs.existsSync(dir)) {
    processDirectory(dir);
  } else {
    console.warn(`Directory not found: ${dir}`);
  }
});

console.log(`\nCompleted! Modified ${filesModified} files.`);
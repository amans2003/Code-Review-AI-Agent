const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const TEMP_DIR = path.join(__dirname, '..', '..', 'temp');

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

/**
 * Clones a github repository into a temporary directory
 * @param {string} repoUrl 
 * @param {string} jobId 
 * @returns {Promise<string>} path to cloned directory
 */
const cloneRepository = (repoUrl, jobId) => {
  return new Promise((resolve, reject) => {
    const clonePath = path.join(TEMP_DIR, jobId);
    
    if (fs.existsSync(clonePath)) {
      fs.rmSync(clonePath, { recursive: true, force: true });
    }
    
    fs.mkdirSync(clonePath, { recursive: true });

    // Sanitize repoUrl to prevent command injection
    // Basic Git URL format verification
    if (!repoUrl.startsWith('http://') && !repoUrl.startsWith('https://') && !repoUrl.startsWith('git@')) {
      return reject(new Error('Invalid repository URL format'));
    }

    const command = `git clone --depth 1 "${repoUrl}" .`;

    exec(command, { cwd: clonePath }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Git clone failed for ${repoUrl}:`, stderr);
        // Fallback cleanup
        try { fs.rmSync(clonePath, { recursive: true, force: true }); } catch (e) {}
        return reject(new Error(`Failed to clone repository: ${stderr || error.message}`));
      }
      resolve(clonePath);
    });
  });
};

/**
 * Scan directory recursively for js, jsx, ts, tsx files
 * @param {string} dirPath 
 * @param {string} originalRootPath - base path for generating relative paths
 * @returns {Array<{path: string, content: string}>} files list
 */
const scanDirectory = (dirPath, originalRootPath = dirPath) => {
  let results = [];
  const list = fs.readdirSync(dirPath);
  
  const ignoreDirs = ['node_modules', '.git', 'dist', 'build', 'out', 'coverage', '.next', '.cache', 'public'];
  const allowedExtensions = ['.js', '.jsx', '.ts', '.tsx'];

  for (const file of list) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat && stat.isDirectory()) {
      if (ignoreDirs.includes(file)) continue;
      results = results.concat(scanDirectory(fullPath, originalRootPath));
    } else {
      const ext = path.extname(file);
      if (allowedExtensions.includes(ext)) {
        // Only read files under 200KB to avoid hitting token limits
        if (stat.size < 200 * 1024) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            const relativePath = path.relative(originalRootPath, fullPath).replace(/\\/g, '/');
            results.push({
              path: relativePath,
              content
            });
          } catch (err) {
            console.error(`Error reading file ${fullPath}:`, err);
          }
        }
      }
    }
  }
  return results;
};

/**
 * Delete temp files after scanning
 * @param {string} jobId 
 */
const cleanup = (jobId) => {
  const clonePath = path.join(TEMP_DIR, jobId);
  if (fs.existsSync(clonePath)) {
    try {
      fs.rmSync(clonePath, { recursive: true, force: true });
    } catch (e) {
      console.error(`Failed to cleanup temp path ${clonePath}:`, e.message);
    }
  }
};

module.exports = {
  cloneRepository,
  scanDirectory,
  cleanup
};

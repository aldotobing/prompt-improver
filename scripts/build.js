const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting optimized build process...');

// Set memory limit
process.env.NODE_OPTIONS = '--max-old-space-size=8192';
process.env.NEXT_TELEMETRY_DISABLED = '1';
process.env.NODE_ENV = 'production';

// Clean previous builds
console.log('Cleaning previous builds...');
const dirsToClean = ['.next', 'out', '.cache'];
dirsToClean.forEach(dir => {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
    console.log(`Cleaned ${dir}`);
  } catch (e) {
    console.log(`No ${dir} directory to clean`);
  }
});

// Function to run command with retries
function runCommand(command, maxRetries = 2, retryDelay = 5000) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${maxRetries}: ${command}`);
      execSync(command, { stdio: 'inherit' });
      return; // Success
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxRetries) {
        console.log(`Retrying in ${retryDelay}ms...`);
        new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
  
  console.error('All build attempts failed');
  process.exit(1);
}

// Run the build
console.log('Starting Next.js build...');
try {
  runCommand('next build');
  
  // Create out directory if it doesn't exist
  if (!fs.existsSync('out')) {
    fs.mkdirSync('out');
  }
  
  // Create CNAME file
  fs.writeFileSync('out/CNAME', 'prompt.aldotobing.online');
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}

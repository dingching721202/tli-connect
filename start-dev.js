const { execSync } = require('child_process');

console.log('🚀 Starting TLI Connect development server...\n');

// Try different ports if one is in use
const ports = [3000, 3001, 3002, 8000, 8001];

for (const port of ports) {
  try {
    console.log(`Trying port ${port}...`);
    execSync(`npx next dev --port ${port}`, { stdio: 'inherit' });
    break;
  } catch (error) {
    if (error.message.includes('EACCES')) {
      console.log(`❌ Permission denied for port ${port}`);
    } else if (error.message.includes('EADDRINUSE')) {
      console.log(`❌ Port ${port} is already in use`);
    } else {
      console.log(`❌ Error on port ${port}:`, error.message);
    }
    
    if (port === ports[ports.length - 1]) {
      console.log('\n❌ All ports failed. Please try running manually with: npx next dev --port 3000');
    }
  }
}
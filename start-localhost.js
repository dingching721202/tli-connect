const { spawn } = require('child_process');

console.log('🚀 Starting TLI Connect on localhost only...\n');

// Start with localhost binding to avoid permission issues
const child = spawn('npx', ['next', 'dev', '--port', '3000', '--hostname', 'localhost'], {
  stdio: 'inherit',
  shell: true
});

console.log('📍 Server will be available at: http://localhost:3000\n');

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  child.kill('SIGINT');
  process.exit(0);
});

child.on('error', (error) => {
  console.error('❌ Error starting server:', error.message);
  console.log('\n🔧 Try these alternatives:');
  console.log('1. npm run dev:3001');
  console.log('2. npm run dev:8000');
  console.log('3. npx next dev --port 3002 --hostname localhost');
});

child.on('exit', (code) => {
  if (code !== 0) {
    console.log(`\n⚠️  Server exited with code ${code}`);
    console.log('Try running: npm run dev:3001');
  }
});
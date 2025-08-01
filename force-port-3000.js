const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Forcing TLI Connect to use port 3000...\n');

// Ensure .env.local exists with correct port
const envPath = path.join(__dirname, '.env.local');
const envContent = `# TLI Connect Environment Variables - Force Port 3000
PORT=3000
HOSTNAME=localhost
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
`;

fs.writeFileSync(envPath, envContent);
console.log('✅ Created .env.local with PORT=3000');

// Clear any Next.js cache that might have old port settings
const nextDir = path.join(__dirname, '.next');
if (fs.existsSync(nextDir)) {
  try {
    fs.rmSync(nextDir, { recursive: true, force: true });
    console.log('✅ Cleared Next.js cache');
  } catch (error) {
    console.log('⚠️  Could not clear cache, continuing...');
  }
}

console.log('🚀 Starting server on localhost:3000...\n');

// Start with explicit port and hostname
const args = [
  'next', 
  'dev', 
  '--port', '3000',
  '--hostname', 'localhost'
];

const child = spawn('npx', args, {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    PORT: '3000',
    HOSTNAME: 'localhost'
  }
});

console.log('📍 Server will be available at: http://localhost:3000');
console.log('🛑 Press Ctrl+C to stop the server\n');

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  child.kill('SIGINT');
  process.exit(0);
});

child.on('error', (error) => {
  console.error('❌ Error starting server:', error.message);
  console.log('\n🔧 If port 3000 is still blocked, try:');
  console.log('npx next dev --port 3001 --hostname localhost');
});

child.on('exit', (code) => {
  if (code !== 0) {
    console.log(`\n⚠️  Server exited with code ${code}`);
  }
});
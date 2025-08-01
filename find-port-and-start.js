const { execSync, spawn } = require('child_process');
const net = require('net');

// Function to check if a port is available
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true);
      });
      server.close();
    });
    
    server.on('error', () => {
      resolve(false);
    });
  });
}

// Function to find an available port
async function findAvailablePort(startPort = 3000) {
  const maxPort = startPort + 100;
  
  for (let port = startPort; port <= maxPort; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  
  throw new Error('No available ports found');
}

// Main function
async function startServer() {
  console.log('🔍 Finding available port...\n');
  
  try {
    // Kill any existing Next.js processes
    console.log('🛑 Stopping any existing Next.js processes...');
    try {
      if (process.platform === 'win32') {
        execSync('taskkill /f /im node.exe 2>nul || echo "No processes to kill"', { stdio: 'inherit' });
      } else {
        execSync('pkill -f "next dev" || echo "No processes to kill"', { stdio: 'inherit' });
      }
    } catch (error) {
      // Ignore errors when killing processes
    }
    
    // Wait a moment for processes to fully terminate
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const port = await findAvailablePort(3000);
    console.log(`✅ Found available port: ${port}\n`);
    
    console.log('🚀 Starting Next.js development server...\n');
    
    // Start the server with localhost binding
    const child = spawn('npx', ['next', 'dev', '--port', port.toString(), '--hostname', 'localhost'], {
      stdio: 'inherit',
      shell: true
    });
    
    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down server...');
      child.kill('SIGINT');
      process.exit(0);
    });
    
    child.on('error', (error) => {
      console.error('❌ Error starting server:', error.message);
    });
    
    child.on('exit', (code) => {
      if (code !== 0) {
        console.log(`\n⚠️  Server exited with code ${code}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.log('\n🔧 Try these alternatives:');
    console.log('1. npm run dev');
    console.log('2. npx next dev --port 3001');
    console.log('3. npx next dev --port 8000');
  }
}

startServer();
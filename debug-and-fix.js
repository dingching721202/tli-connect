const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 TLI Connect Debug & Fix Script\n');

// 1. Check Node.js version
console.log('1. Checking Node.js version...');
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  console.log(`✅ Node.js version: ${nodeVersion}`);
  
  const majorVersion = parseInt(nodeVersion.replace('v', '').split('.')[0]);
  if (majorVersion < 18) {
    console.log('⚠️  Warning: Node.js 18+ recommended for Next.js 15');
  }
} catch (error) {
  console.log('❌ Could not check Node.js version');
}

// 2. Install dependencies
console.log('\n2. Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed');
} catch (error) {
  console.log('❌ Failed to install dependencies');
}

// 3. Check for missing files
console.log('\n3. Checking configuration files...');
const requiredFiles = [
  'tailwind.config.js',
  'postcss.config.mjs',
  'next.config.ts',
  'tsconfig.json',
  'package.json'
];

requiredFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} missing`);
  }
});

// 4. Try to build (check for compilation errors)
console.log('\n4. Testing compilation...');
try {
  execSync('npx next build --dry-run', { stdio: 'inherit' });
  console.log('✅ Compilation test passed');
} catch (error) {
  console.log('⚠️  Compilation issues detected, but continuing...');
}

// 5. Clear Next.js cache
console.log('\n5. Clearing Next.js cache...');
try {
  if (fs.existsSync(path.join(__dirname, '.next'))) {
    fs.rmSync(path.join(__dirname, '.next'), { recursive: true, force: true });
    console.log('✅ Cache cleared');
  } else {
    console.log('✅ No cache to clear');
  }
} catch (error) {
  console.log('⚠️  Could not clear cache');
}

console.log('\n🚀 Ready to start! Run: npm run dev');
console.log('📍 Server will be available at: http://localhost:3000');
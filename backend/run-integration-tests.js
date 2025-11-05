#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('Running Integration Tests for API Endpoints...\n');

try {
  // Run integration tests specifically
  const command = 'npx jest --testPathPattern=integration --verbose --forceExit';
  
  console.log(`Executing: ${command}\n`);
  
  const result = execSync(command, {
    cwd: __dirname,
    stdio: 'inherit',
    encoding: 'utf8'
  });
  
  console.log('\n✅ Integration tests completed successfully!');
  
} catch (error) {
  console.error('\n❌ Integration tests failed:');
  console.error(error.message);
  process.exit(1);
}
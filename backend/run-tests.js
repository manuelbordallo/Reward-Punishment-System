#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('Running backend unit tests...\n');

try {
    // Run all service tests
    console.log('=== Service Tests ===');
    execSync('npx jest __tests__/services/ --no-coverage --verbose', {
        stdio: 'inherit',
        cwd: __dirname
    });

    console.log('\n=== Repository Tests ===');
    execSync('npx jest __tests__/repositories/ --no-coverage --verbose', {
        stdio: 'inherit',
        cwd: __dirname
    });

    console.log('\n✅ All tests completed successfully!');
} catch (error) {
    console.error('\n❌ Some tests failed');
    process.exit(1);
}
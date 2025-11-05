#!/usr/bin/env node

// Simple validation script to check if our tests can run
const { execSync } = require('child_process');

console.log('🧪 Validating backend unit tests...\n');

const testFiles = [
  '__tests__/services/PersonService.test.js',
  '__tests__/services/RewardService.test.js', 
  '__tests__/services/PunishmentService.test.js',
  '__tests__/services/ScoreCalculationService.test.js',
  '__tests__/repositories/PersonRepository.test.js',
  '__tests__/repositories/AssignmentRepository.test.js'
];

let passedTests = 0;
let totalTests = testFiles.length;

for (const testFile of testFiles) {
  try {
    console.log(`Running ${testFile}...`);
    execSync(`npx jest ${testFile} --no-coverage --silent`, { 
      stdio: 'pipe',
      cwd: __dirname,
      timeout: 10000
    });
    console.log(`✅ ${testFile} - PASSED`);
    passedTests++;
  } catch (error) {
    console.log(`❌ ${testFile} - FAILED`);
    console.log(`   Error: ${error.message.split('\n')[0]}`);
  }
}

console.log(`\n📊 Test Results: ${passedTests}/${totalTests} test files passed`);

if (passedTests === totalTests) {
  console.log('🎉 All tests are working correctly!');
  process.exit(0);
} else {
  console.log('⚠️  Some tests need attention');
  process.exit(1);
}
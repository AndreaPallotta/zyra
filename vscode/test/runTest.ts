import * as path from 'path';

// Use dynamic require to avoid compile-time type dependency in scaffold
const runTests: any = require('@vscode/test-electron').runTests;

async function main() {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, '..');
    const extensionTestsPath = path.resolve(__dirname, 'suite');
    await runTests({ extensionDevelopmentPath, extensionTestsPath });
  } catch (err) {
    console.error('Failed to run tests', err);
    process.exit(1);
  }
}

main();

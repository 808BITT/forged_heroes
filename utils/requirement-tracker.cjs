#!/usr/bin/env node

// Requirement Coverage Tracker CLI for llero
// Usage: node utils/requirement-tracker.js <check|report> [--module=tool] [--output=json] [--update]

const fs = require('fs/promises');
const path = require('path');
const glob = require('glob');
const yaml = require('js-yaml');
const { parse } = require('comment-parser');
const { spawnSync } = require('child_process');

const REQUIREMENTS_DIR = path.resolve(__dirname, '../requirements');
const TESTS_DIR = path.resolve(__dirname, '../test');

function parseArgs() {
  const args = process.argv.slice(2);
  const command = args[0];
  const options = {};
  for (const arg of args.slice(1)) {
    if (arg.startsWith('--module=')) options.module = arg.split('=')[1];
    if (arg.startsWith('--output=')) options.output = arg.split('=')[1];
    if (arg === '--update') options.update = true;
    if (arg === '--fast') options.fast = true;
    if (arg === '--headless') options.headless = true;
    if (arg.startsWith('--workers=')) options.workers = parseInt(arg.split('=')[1], 10);
    if (arg.startsWith('--batch-size=')) options.batchSize = parseInt(arg.split('=')[1], 10);
  }
  return { command, options };
}

async function loadRequirements(moduleFilter) {
  const files = glob.sync(`${REQUIREMENTS_DIR}/*.yml`);
  const requirements = {};
  for (const file of files) {
    if (moduleFilter && !file.includes(moduleFilter)) continue;
    const content = await fs.readFile(file, 'utf8');
    const data = yaml.load(content);
    if (Array.isArray(data)) {
      for (const req of data) {
        if (req.id) requirements[req.id] = { ...req, module: path.basename(file, '.yml') };
      }
    } else if (data && data.requirements) {
      for (const req of data.requirements) {
        if (req.id) requirements[req.id] = { ...req, module: path.basename(file, '.yml') };
      }
    }
  }
  return requirements;
}

function extractRequirementTagsFromFile(fileContent) {
  const tags = [];
  // Parse block comments
  for (const block of parse(fileContent)) {
    for (const tag of block.tags) {
      if (tag.tag === 'requirement' && tag.name.match(/^REQ-/)) {
        tags.push(tag.name);
      }
    }
  }
  // Parse decorator style: @requirement("REQ-...")
  const decoratorRegex = /@requirement\s*\(\s*["'](REQ-[A-Z]+-\d+)["']\s*\)/g;
  let match;
  while ((match = decoratorRegex.exec(fileContent))) {
    tags.push(match[1]);
  }
  return tags;
}

async function scanTestFiles() {
  // Support .js, .ts, and .cjs in test directories
  const files = glob.sync(`${TESTS_DIR}/**/*.{js,ts,cjs}`);
  const map = {};
  for (const file of files) {
    const content = await fs.readFile(file, 'utf8');
    const tags = extractRequirementTagsFromFile(content);
    for (const reqId of tags) {
      if (!map[reqId]) map[reqId] = [];
      map[reqId].push({ file });
    }
  }
  return map;
}

async function runPlaywrightForRequirements(requirementToTests, options = {}) {
  const testFiles = Array.from(
    new Set(Object.values(requirementToTests).flat().map(t => t.file))
  );
  if (testFiles.length === 0) {
    console.log("No test files found linked to requirements.");
    return {};
  }

  // Normalize paths to use forward slashes (Playwright accepts POSIX style)
  const normalizedFiles = testFiles.map(f => f.split(path.sep).join('/'));

  // Process test files in batches to avoid memory issues
  const batchSize = options.batchSize || (options.fast ? 5 : 10);
  const fileStatus = {};

  // Set worker count (default to 1/4 of CPU cores if not specified)
  const workers = options.workers || Math.max(1, Math.floor(require('os').cpus().length / 4));

  console.log(`Running Playwright for ${testFiles.length} test file(s) with ${workers} workers in ${Math.ceil(normalizedFiles.length / batchSize)} batches...`);

  // Run Playwright directly (no batching) with --project=chromium to get a list of test names
  const testListResult = spawnSync(
    'npx',
    ['playwright', 'test', '--list', '--project=chromium', '--reporter=json'],
    { encoding: 'utf8', shell: process.platform === 'win32' }
  );

  // Create a mapping of test files to their test names
  const testsByFile = {};
  if (testListResult.stdout) {
    try {
      const testListJson = JSON.parse(testListResult.stdout);
      for (const suite of testListJson.suites || []) {
        for (const spec of suite.specs || []) {
          const testFile = spec.file;
          const testName = spec.title;
          if (!testsByFile[testFile]) testsByFile[testFile] = [];
          testsByFile[testFile].push(testName);
        }
      }
    } catch (error) {
      console.error('Error parsing Playwright test list JSON:', error);
    }
  }

  for (let i = 0; i < normalizedFiles.length; i += batchSize) {
    const batchFiles = normalizedFiles.slice(i, i + batchSize);
    console.log(`Running batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(normalizedFiles.length / batchSize)} (${batchFiles.length} files)...`);

    // Configure Playwright arguments for this batch
    const playwrightArgs = ['playwright', 'test', '--reporter=json', ...batchFiles];

    // Add performance options
    playwrightArgs.push('--workers=' + workers);
    if (options.fast) playwrightArgs.push('--project=chromium', '--timeout=30000');
    // Replace '--headless' with '--project=chromium' for compatibility
    if (options.headless !== false) playwrightArgs.push('--project=chromium'); // Ensure compatibility with Playwright CLI
    else playwrightArgs.push('--headed'); // Add fallback for headed mode

  // Run the tests for this batch
    const result = spawnSync(
      'npx',
      playwrightArgs,
      { encoding: 'utf8', shell: process.platform === 'win32', maxBuffer: 10 * 1024 * 1024 }
    );

    if (result.error) {
      console.error('Error running Playwright:', result.error);
      continue;
    }

    // Debugging: Log raw output for each batch
    console.log(`Raw Playwright output for batch ${Math.floor(i / batchSize) + 1}:`);
    console.log(result.stdout || '<No stdout>');
    console.log(result.stderr || '<No stderr>');

    // Parse the output to determine which files passed/failed
    try {
      if (!result.stdout.trim()) {
        console.warn(`Batch ${Math.floor(i / batchSize) + 1} produced no JSON output.`);
        continue;
      }

      const outputJson = JSON.parse(result.stdout);
      for (const suite of outputJson.suites || []) {
        for (const spec of suite.specs || []) {
          const file = spec.file;
          const status = spec.ok ? 'PASSED' : 'FAILED';
          fileStatus[file] = status;
        }
      }
    } catch (error) {
      console.error(`Error parsing Playwright JSON output for batch ${Math.floor(i / batchSize) + 1}:`, error);
      console.error('Raw stdout:', result.stdout || '<No stdout>');
      console.error('Raw stderr:', result.stderr || '<No stderr>');
    }
  }

  // Map requirement IDs to statuses
  const requirementStatus = {};
  for (const [reqId, tests] of Object.entries(requirementToTests)) {
    const statuses = tests.map(t => fileStatus[t.file] || 'UNKNOWN');
    requirementStatus[reqId] = statuses.includes('FAILED') ? 'FAILED' :
      statuses.includes('PASSED') ? 'PASSED' : 'UNKNOWN';
  }

  return requirementStatus;
}

async function checkCommand({ module, output, ...options }) {
  const requirements = await loadRequirements(module);
  const reqToTests = await scanTestFiles(); // Map: { "REQ-ID": [{ file: "path/to/test.js" }] }

  // Run Playwright for tests linked to requirements
  const testResults = await runPlaywrightForRequirements(reqToTests, options); // Map: { "REQ-ID": "PASSED" | "FAILED" }

  const report = [];
  for (const [reqId, req] of Object.entries(requirements)) {
    const tests = reqToTests[reqId] || [];
    let status = 'UNCOVERED'; // Default status

    if (tests.length > 0) {
      // If tests exist, check Playwright results for this requirement ID
      status = testResults[reqId] || 'UNKNOWN'; // UNKNOWN if tests exist but Playwright didn't report status (e.g., error)
      if (status === 'UNKNOWN') {
        console.warn(`Warning: Tests found for ${reqId}, but Playwright status is unknown. Check Playwright execution.`);
          // Decide if UNKNOWN should be treated as FAILED or something else
          status = 'FAILED'; // Treat unknown/error states as failure
      }
    }
    
    report.push({ id: reqId, status: status, ...req, tests });
  }

  // Output
  let uncoveredCount = 0;
  let failedCount = 0;
  let passedCount = 0;

  for (const entry of report) {
    switch (entry.status) {
      case 'PASSED':
        console.log(`✔ PASSED: ${entry.id} (${entry.description || 'No description'}) - Covered by ${entry.tests.length} test file(s).`);
        passedCount++;
        break;
      case 'FAILED':
        console.log(`✖ FAILED: ${entry.id} (${entry.description || 'No description'}) - Tests failed or status unknown.`);
        failedCount++;
        break;
      case 'UNCOVERED':
      default:
        console.log(`⚠ UNCOVERED: ${entry.id} (${entry.description || 'No description'}) - No tests found.`);
        uncoveredCount++;
        break;
    }
  }
  
  console.log('\n--- Summary ---');
  console.log(`Passed: ${passedCount}`);
  console.log(`Failed: ${failedCount}`);
  console.log(`Uncovered: ${uncoveredCount}`);
  console.log(`Total Requirements: ${report.length}`);

  // Exit with non-zero code if there are failures or uncovered requirements
  if (failedCount > 0 || uncoveredCount > 0) {
      process.exitCode = 1; 
  }
  // Add output=json, etc. as needed
}

async function reportCommand({ module, output }) {
  // Similar to checkCommand, but output JSON/Markdown/HTML
  // ...
}

(async function main() {
  const { command, options } = parseArgs();
  if (command === 'check') {
    await checkCommand(options);
  } else if (command === 'report') {
    await reportCommand(options);
  } else {
    console.log('Usage: node utils/requirement-tracker.js <check|report> [--module=tool] [--output=json] [--update]');
  }
})();

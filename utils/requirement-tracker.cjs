#!/usr/bin/env node

// Requirement Coverage Tracker CLI for llero
// Usage: node utils/requirement-tracker.js <check|report> [--module=tool] [--output=json] [--update]

const fs = require('fs/promises');
const path = require('path');
const glob = require('glob');
const yaml = require('js-yaml');
const { parse } = require('comment-parser');
const { runCLI } = require('jest');

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

async function runJestForRequirements(requirementToTests) {
  // Collect all unique test files associated with the requirements found
  const testFiles = Array.from(new Set(Object.values(requirementToTests).flat().map(t => t.file)));
  
  if (testFiles.length === 0) {
    console.log("No test files found linked to requirements.");
    return {}; // No tests to run
  }

  console.log(`Running Jest for ${testFiles.length} test file(s)...`);

  // Convert Windows backslashes to forward slashes for Jest CLI
  const normalizedTestFiles = testFiles.map(f => f.split(path.sep).join('/'));

  // Run Jest programmatically for the specific files
  const jestConfig = {
    _: normalizedTestFiles,   // Run exactly these test files (absolute paths)
    runTestsByPath: true,     // Treat positional args as file paths
    runInBand: true,
    reporters: [],
    silent: true,
  };

  try {
    const { results } = await runCLI(jestConfig, [process.cwd()]);

    // Process results: Map requirement IDs to test statuses (passed, failed)
    const requirementStatus = {};
    if (results.numTotalTests === 0) {
        console.log("Jest ran, but found no tests within the specified files.");
        return {};
    }

    results.testResults.forEach(fileResult => {
      // Find which requirement IDs are associated with this test file
      const reqIdsForFile = Object.entries(requirementToTests)
        .filter(([reqId, tests]) => tests.some(t => t.file === fileResult.testFilePath))
        .map(([reqId]) => reqId);

      if (fileResult.numFailingTests > 0) {
        reqIdsForFile.forEach(reqId => {
          // If any test in the file fails, mark the requirement as FAILED
          // More granular mapping (test case to requirement) could be done if tags are per test case
          requirementStatus[reqId] = 'FAILED';
        });
      } else {
        reqIdsForFile.forEach(reqId => {
          // If the file passes AND the requirement isn't already marked as FAILED by another file
          if (requirementStatus[reqId] !== 'FAILED') {
            requirementStatus[reqId] = 'PASSED';
          }
        });
      }
    });

    return requirementStatus;
  } catch (error) {
    console.error("Error running Jest:", error);
    return {}; // Return empty results on error
  }
}

async function checkCommand({ module, output }) {
  const requirements = await loadRequirements(module);
  const reqToTests = await scanTestFiles(); // Map: { "REQ-ID": [{ file: "path/to/test.js" }] }

  // Run Jest for tests linked to requirements
  const jestResults = await runJestForRequirements(reqToTests); // Map: { "REQ-ID": "PASSED" | "FAILED" }

  const report = [];
  for (const [reqId, req] of Object.entries(requirements)) {
    const tests = reqToTests[reqId] || [];
    let status = 'UNCOVERED'; // Default status

    if (tests.length > 0) {
      // If tests exist, check Jest results for this requirement ID
      status = jestResults[reqId] || 'UNKNOWN'; // UNKNOWN if tests exist but Jest didn't report status (e.g., error)
      if (status === 'UNKNOWN') {
          console.warn(`Warning: Tests found for ${reqId}, but Jest status is unknown. Check Jest execution.`);
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

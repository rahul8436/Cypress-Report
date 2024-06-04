const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCommand(command) {
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
}

// Generate a unique run ID (e.g., timestamp)
const runId = new Date().toISOString().replace(/[:.]/g, '-');

// Define the directories
const resultsDir = path.join('cypress/results', `run-${runId}`);
const publicDir = path.join('public', `report-${runId}`);
const jsonOutput = path.join(resultsDir, 'index.json');

// Ensure the results directory exists
fs.mkdirSync(resultsDir, { recursive: true });
fs.mkdirSync(publicDir, { recursive: true });

// Run Cypress tests and generate the report
runCommand(`cypress run --reporter-options "reportDir=${resultsDir}"`);

// Merge JSON reports
runCommand(`mochawesome-merge ${resultsDir}/*.json > ${jsonOutput}`);

// Generate HTML report
runCommand(`marge ${jsonOutput} --reportDir ${publicDir} --assetsDir ${publicDir}/assets --reportPageTitle report.html`);

// Copy videos
runCommand(`cp -r cypress/videos ${publicDir}/videos`);

// Ensure the public directory for all reports exists
const allReportsDir = path.join('public', 'all-reports');
if (!fs.existsSync(allReportsDir)) {
  fs.mkdirSync(allReportsDir);
}

// Move the report directory to the all-reports directory
runCommand(`mv ${publicDir} ${allReportsDir}/`);

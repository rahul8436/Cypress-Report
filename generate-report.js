const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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
execSync(`cypress run --reporter-options "reportDir=${resultsDir}"`, {
  stdio: 'inherit',
});

// Merge JSON reports
execSync(`mochawesome-merge ${resultsDir}/*.json > ${jsonOutput}`, {
  stdio: 'inherit',
});

// Generate HTML report
execSync(
  `marge ${jsonOutput} --reportDir ${publicDir} --assetsDir ${publicDir}/assets --reportPageTitle report.html`,
  { stdio: 'inherit' }
);

// Copy videos
execSync(`cp -r cypress/videos ${publicDir}/videos`, { stdio: 'inherit' });

// Ensure the public directory for all reports exists
const allReportsDir = path.join('public', 'all-reports');
if (!fs.existsSync(allReportsDir)) {
  fs.mkdirSync(allReportsDir);
}

// Move the report directory to the all-reports directory
execSync(`mv ${publicDir} ${allReportsDir}/`);

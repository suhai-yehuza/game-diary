const fs = require('fs');
const path = require('path');

const reportPath = path.resolve(__dirname, '../coverage/lcov-report/index.html');
if (fs.existsSync(reportPath)) {
  console.log(`\nCoverage report generated successfully!`);
  console.log(`\nTo view the report, open this file in your browser:`);
  console.log(`\n${reportPath}\n`);
  console.log(
    `(You can right-click and choose 'Open With' → your browser, or drag and drop the file into your browser window.)\n`
  );
} else {
  console.log('\nCoverage report not found.\n');
}

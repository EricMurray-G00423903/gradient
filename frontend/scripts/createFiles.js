const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const fileType = args[0]; // "page" or "component"
const fileName = args[1];

if (!fileType || !fileName) {
  console.error('\x1b[31m%s\x1b[0m', 'Error: Please specify the type and name of the file'); // Red color for errors
  process.exit(1);
}

const basePath = path.resolve(__dirname, '..', 'src', fileType === 'page' ? 'Pages' : 'Components');
const filePath = path.join(basePath, `${fileName}.tsx`);
const testFilePath = path.join(basePath, `${fileName}.test.tsx`);

// Create the directory if it does not exist
if (!fs.existsSync(basePath)) {
  fs.mkdirSync(basePath, { recursive: true });
}

// Create the .tsx file
fs.writeFileSync(filePath, '// Your TSX code here\n');

// Create the .test.tsx file
fs.writeFileSync(testFilePath, '// Your test code here\n');

console.log('\x1b[32m%s\x1b[0m', `✔ Created ${fileName}.tsx`); // Green color for success messages
console.log('\x1b[32m%s\x1b[0m', `✔ Created ${fileName}.test.tsx`); // Green color for success messages

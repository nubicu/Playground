const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const vendor = path.join(root, 'vendor');
fs.mkdirSync(vendor, { recursive: true });

const files = [
  [require.resolve('pdf-lib/dist/pdf-lib.min.js'), 'pdf-lib.min.js'],
  [require.resolve('pdfjs-dist/legacy/build/pdf.min.js'), 'pdf.min.js'],
  [require.resolve('pdfjs-dist/legacy/build/pdf.worker.min.js'), 'pdf.worker.min.js']
];

for (const [from, name] of files) fs.copyFileSync(from, path.join(vendor, name));

const pdfParse = require('pdf-parse');
const fs = require('fs');

console.log('--- PDF PARSE DEBUG ---');
console.log('Type of pdfParse:', typeof pdfParse);
console.log('Keys of pdfParse:', Object.keys(pdfParse));

if (typeof pdfParse !== 'function') {
    console.log('pdfParse.default type:', typeof pdfParse.default);
    if (pdfParse.default) {
        console.log('pdfParse.default keys:', Object.keys(pdfParse.default));
    }
}

console.log('--- END DEBUG ---');

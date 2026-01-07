const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, 'Closed Sales (2).xlsx');
const outPath = path.join(__dirname, 'debug_output.txt');

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert to JSON array of arrays
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '' });

    let output = "--- Rows 0-100 ---\n";
    rows.slice(0, 100).forEach((row, i) => {
        output += `Row ${i}: ${JSON.stringify(row)}\n`;
    });

    fs.writeFileSync(outPath, output);
    console.log("Written to debug_output.txt");

} catch (e) {
    console.error("Error:", e);
}

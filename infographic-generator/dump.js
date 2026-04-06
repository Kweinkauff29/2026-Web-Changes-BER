const XLSX = require('xlsx');

function dumpFile(filePath) {
    try {
        const wb = XLSX.readFile(filePath);
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        console.log(`\n\n--- DUMPING: ${filePath} ---`);
        console.log(`Total rows: ${rows.length}`);
        
        let count = 0;
        for (let i = 0; i < Math.min(20, rows.length); i++) {
            console.log(`Row ${i}:`, rows[i]);
            count++;
        }
    } catch (e) {
        console.error(`Error reading ${filePath}: ${e.message}`);
    }
}

dumpFile('c:\\Users\\Kevin\\2026-Web-Changes-BER\\price.xlsx');

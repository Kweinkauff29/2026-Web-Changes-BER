const fs = require('fs');
const path = require('path');

const sharedStringsPath = path.join(__dirname, 'xlsx_extracted/xl/sharedStrings.xml');
const sheet1Path = path.join(__dirname, 'xlsx_extracted/xl/worksheets/sheet1.xml');
const outputPath = path.join(__dirname, 'contacts.json');

// Helper to extract content between tags
function extractTagContent(xml, tagName) {
    const regex = new RegExp(`<${tagName}[^>]*>(.*?)</${tagName}>`, 'gs');
    const matches = [];
    let match;
    while ((match = regex.exec(xml)) !== null) {
        matches.push(match[1]);
    }
    return matches;
}

// 1. Read Shared Strings (the actual text content)
// Structure: <sst ...><si><t>Text</t></si>...</sst>
console.log('Reading shared strings...');
const sharedStringsXml = fs.readFileSync(sharedStringsPath, 'utf8');
// Sometimes text is inside <t> or <t xml:space="preserve">
const sharedStrings = [];
const siRegex = /<si>(.*?)<\/si>/gs;
let siMatch;

while ((siMatch = siRegex.exec(sharedStringsXml)) !== null) {
    const siContent = siMatch[1];
    const tRegex = /<t[^>]*>(.*?)<\/t>/s; // Find the first <t> in the <si>
    const tMatch = tRegex.exec(siContent);
    if (tMatch) {
        sharedStrings.push(tMatch[1]);
    } else {
        sharedStrings.push(''); // Empty cell
    }
}
console.log(`Found ${sharedStrings.length} shared strings.`);

// 2. Read Sheet Data
// Structure: <row r="1"> <c r="A1" t="s"><v>0</v></c> ... </row>
// t="s" means value is index in sharedStrings
// r="A1" is cell reference
console.log('Reading sheet data...');
const sheetXml = fs.readFileSync(sheet1Path, 'utf8');

// Parse rows
const rows = [];
const rowRegex = /<row r="(\d+)"[^>]*>(.*?)<\/row>/gs;
let rowMatch;

while ((rowMatch = rowRegex.exec(sheetXml)) !== null) {
    const rowNum = parseInt(rowMatch[1], 10);
    const rowContent = rowMatch[2];
    const colRegex = /<c r="([A-Z]+)\d+"(?:[^>]*t="([a-z]+)")?[^>]*>(?:<v>(.*?)<\/v>)?<\/c>/gs;

    // NOTE: This simple regex approach for columns assumes column headers are single letters A-Z for now, 
    // based on typical small sheets. If columns go past Z (AA, AB...), we need better parsing, 
    // but the screenshot showed columns up to 'M' or so.

    // Let's build a row object indexed by column letter
    const rowData = {};
    let colMatch;
    while ((colMatch = colRegex.exec(rowContent)) !== null) {
        const colLetter = colMatch[1];
        const type = colMatch[2];
        const value = colMatch[3];

        let cellValue = value;
        if (type === 's' && value !== undefined) {
            cellValue = sharedStrings[parseInt(value, 10)];
        }

        rowData[colLetter] = cellValue;
    }
    rows.push({ rowNum, data: rowData });
}

console.log(`Found ${rows.length} rows.`);

// 3. Map Header
// Assume Row 1 is header
// Columns based on observed XML in previous turn:
// A: FirstName (index 0 in sst)
// B: LastName (index 1)
// C: CommonName (index 2)
// D: Organization (index 3)
// E: Email (index 4)
// ... and so on based on sst indices at the start of sharedStrings.xml

// To be safe, let's look at Row 1 data to establish the mapping
const headerRow = rows.find(r => r.rowNum === 1);
const columnMapping = {};
// Expected Headers based on sharedStrings.xml view: 
// FirstName, LastName, CommonName, Organization, Email, Role, JoinDate, DropDate, Disabled, Status, PriPhone, PriAddress, ...
// Let's map column letters to these values.

if (headerRow) {
    for (const [col, val] of Object.entries(headerRow.data)) {
        if (val) columnMapping[col] = val.trim();
    }
}
console.log('Column Headers:', columnMapping);


// 4. Transform to Array of Objects
const contacts = [];

// Skip header row (row 1)
const dataRows = rows.filter(r => r.rowNum > 1);

dataRows.forEach(row => {
    const contact = {};
    // Only add if we have some minimal data (e.g., LastName or Organization or Email)
    let hasData = false;

    for (const [colLetter, headerName] of Object.entries(columnMapping)) {
        let val = row.data[colLetter];
        // Clean up undefined or formatted weirdly
        if (val === undefined) val = "";

        // Very basic XML entity decoding if needed (e.g. &amp;)
        val = val.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'");

        contact[headerName] = val;
        if (val) hasData = true;
    }

    if (hasData) {
        contacts.push(contact);
    }
});

console.log(`Parsed ${contacts.length} contacts.`);

fs.writeFileSync(outputPath, JSON.stringify(contacts, null, 2));
console.log(`Wrote contacts to ${outputPath}`);

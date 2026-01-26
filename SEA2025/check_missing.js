
const fs = require('fs');

const fileContent = fs.readFileSync('/Users/kevinweinkauff/2026-Web-Changes-BER/SEA2025/organization-contacts.html', 'utf8');

// Regex to find contacts in the JSON structure
// Expecting: "FirstName": "X", "LastName": "Y"
// Note: The file might have them on separate lines.
// We can just extract all occurrences.

// A safer way: Extract the CONTACTS_DATA content block and parse it, but it might be malformatted json in html.
// Regex approach for names:
const firstNames = [];
const lastNames = [];
const fullNames = new Set();

const regex = /"FirstName":\s*"([^"]+)"[\s\S]*?"LastName":\s*"([^"]+)"/g;
let match;

// We need to match pairs close to each other.
// Let's assume standard formatting: FirstName then LastName within the same object.
// The file format seems consistent.

const rawData = fileContent.match(/const CONTACTS_DATA = \[([\s\S]*?)\];/);
if (rawData) {
    try {
        // It's a JS array, but might contain unquoted keys or comments? 
        // The file View showed valid JSON-like structure inside the array.
        // Let's try to eval it or JSON.parse it? No, eval is dangerous but this is local.
        // Let's just use strict JSON parsing if possible, or regex on the block.
        const block = rawData[1];
        const nameRegex = /"FirstName":\s*"([^"]*)",\s*"LastName":\s*"([^"]*)"/g;
        // Also handle reversed order or intervening lines if necessary, but view showed them adjacent usually.
        // Actually, view showed:
        // "FirstName": "Amy",
        // "LastName": "Alvarez-Betz",

        // So regex:
        const looseRegex = /"FirstName":\s*"([^"]+)",\s*[\r\n\s]*"LastName":\s*"([^"]+)"/g;

        while ((match = looseRegex.exec(block)) !== null) {
            let first = match[1].trim();
            let last = match[2].trim();
            fullNames.add(`${first} ${last}`.toLowerCase());
            // Also add "First Last" just in case of middle names in First
        }
    } catch (e) {
        console.log("Error parsing:", e);
    }
}

const targets = [
    "Amber Teeters",
    "Kevin Bartlett",
    "Jack Mancini",
    "Joe R Pavich",
    "Matthew Larmore",
    "Kevin Shelly",
    "Jason R Pavich",
    "Zachary Rosen",
    "Candace W Farmer",
    "Shane Mazurek",
    "Susan Heller",
    "J Alex King",
    "John Anderson Neal",
    "Corye Reiter",
    "Raimel Gonzalez Carril",
    "Matthew Stepan",
    "Jennifer Springer Rinden",
    "Jay Westerlund",
    "Arianna Jorrin",
    "Jill B Kushner",
    "Donna L Mason",
    "Astrid Hayes",
    "Angela D Guillette",
    "Lisa Ninchritz",
    "Kathryn Zangrilli",
    "Tyler Butcher",
    "Thereza Zager",
    "Adam G DeArmond",
    "Michael C Monge",
    "David T Urban",
    "Rachel Rodriguez",
    "Lindsey Moffat",
    "Shelly Olsen",
    "Allan R Hase",
    "Sylvia Maietta",
    "Joseph Pavich Sr",
    "Andrew Brinkoetter",
    "Mary Jo Selden"
];

const missing = [];

targets.forEach(target => {
    // Check direct match
    if (fullNames.has(target.toLowerCase())) return;

    // Check partials?
    // "Joe R Pavich" might be "Joe Pavich" or "Joseph Pavich"
    // "Candace W Farmer" might be "Candace Farmer"
    // "J Alex King" might be "J King" or "Alex King"

    // Let's normalize target: remove middle initials for check
    const normalized = target.replace(/ \w\.? /g, ' ').toLowerCase(); // remove middle initial
    if (fullNames.has(normalized)) return;

    // Remove text in parenthesis from target if any (none in list)

    // Check if "LastName" match exists in file to be safe?
    // Nah, just list as missing and I will manually verify/add.
    missing.push(target);
});

console.log("Missing Agents:");
missing.forEach(m => console.log(m));

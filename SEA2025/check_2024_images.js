const fs = require('fs');

const html2024 = fs.readFileSync('/Users/kevinweinkauff/2026-Web-Changes-BER/SEA2025/2024SEA.html', 'utf8');
const missing = [
    "Lisa Schroeder",
    "Susan Heller",
    "Jennifer Springer-Rinden",
    "Justin O'Hara",
    "Billie Jans",
    "Nanette Padgett LLC",
    "Elizabeth Baker",
    "Leslie Prinz",
    "Scott Hansen",
    "Stacey Reed",
    "Kathleen Felszer",
    "Christy Lominack"
];

console.log(`Checking ${missing.length} agents in 2024 page...`);

const found = [];
missing.forEach(name => {
    // Escape quotes
    const safeName = name.replace(/'/g, "\\'");
    // Find the <img> before the <h4>name</h4>
    const regex = new RegExp('<img[^>]*src="([^"]+)"[^>]*>[\\s\\S]*?<h4>' + safeName + '</h4>', 'i');
    const match = regex.exec(html2024);
    if (match) {
        console.log(`FOUND ${name} at: ${match[1]}`);
        found.push({ name, url: match[1] });
    } else {
        console.log(`MISSING ${name} in 2024`);
    }
});

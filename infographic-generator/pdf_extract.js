const fs = require('fs');
const pdf = require('pdf-parse');

async function extract() {
    let data = await pdf(fs.readFileSync('February 2026 BonitaEstero.pdf'));
    fs.writeFileSync('bonita.txt', data.text);

    let data2 = await pdf(fs.readFileSync('February 2026 NaplesFort Myers.pdf'));
    fs.writeFileSync('naples.txt', data2.text);
    console.log("Done");
}
extract();

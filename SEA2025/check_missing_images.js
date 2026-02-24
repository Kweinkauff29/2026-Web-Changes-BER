const fs = require('fs');
const https = require('https');

const html = fs.readFileSync('/Users/kevinweinkauff/2026-Web-Changes-BER/SEA2025/2025SEA.html', 'utf8');
const regex = /<img[^>]*src="(https:\/\/bonitaesterorealtors\.com\/wp-content\/uploads\/2026\/02\/[^"]+)"/g;

let match;
const urls = [];
while ((match = regex.exec(html)) !== null) {
    let url = match[1];
    urls.push(url);
}

console.log(`Checking ${urls.length} images...`);

async function checkUrl(url) {
    return new Promise((resolve) => {
        // We'll strip query parameters to get the actual file URL
        const cleanUrl = url.split('?')[0];
        https.request(cleanUrl, { method: 'HEAD' }, (res) => {
            if (res.statusCode === 404) {
                resolve({ url: cleanUrl, status: 'Missing' });
            } else if (res.statusCode === 200) {
                resolve({ url: cleanUrl, status: 'Found' });
            } else {
                resolve({ url: cleanUrl, status: res.statusCode });
            }
        }).on('error', (e) => {
            resolve({ url: cleanUrl, status: e.message });
        }).end();
    });
}

async function run() {
    const missing = [];
    const found = [];
    for (let i = 0; i < urls.length; i++) {
        const result = await checkUrl(urls[i]);
        if (result.status === 'Missing') {
            missing.push(result.url);
        } else if (result.status === 'Found') {
            found.push(result.url);
        } else {
            console.log(`Other status for ${result.url}: ${result.status}`);
        }
    }
    console.log(`\nTotal Missing: ${missing.length}`);
    missing.forEach(m => console.log(m));
}

run();

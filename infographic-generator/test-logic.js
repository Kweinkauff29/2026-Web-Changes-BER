const fs = require('fs');
// Mocking the document and browser environment lightly to test the logic
global.document = {
    getElementById: (id) => {
        if (id === 'month') return { value: 'March' };
        if (id === 'year') return { value: '2026' };
        return { value: '' };
    }
};

let uploadedFiles = {};
let historicalData = { naples: {}, fortmyers: {}, bonita: {} };
let data = { naples: {}, fortmyers: {}, bonita: {} };
const regions = ['naples', 'fortmyers', 'bonita'];

function parseDate(val) {
    if (!isNaN(val) && parseFloat(val) > 20000) {
        const d = new Date((parseFloat(val) - 25569) * 86400 * 1000);
        return { m: d.toLocaleString('default', { month: 'short' }), y: d.getFullYear() };
    }
    const d = new Date(val);
    if (d instanceof Date && !isNaN(d)) {
        return { m: d.toLocaleString('default', { month: 'short' }), y: d.getFullYear() };
    }
    return null;
}

function processSheet(type, rows, month, year) {
    if (rows.length < 2) return;
    const monAbbr = month.substring(0,3).toLowerCase();
    const regionData = { naples: {}, fortmyers: {}, bonita: {} };
    const initYear = (reg, yr) => {
        if (!regionData[reg][yr]) regionData[reg][yr] = { sum: 0, count: 0, values: [] };
    };

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length < 2) continue;
        const dateVal = row[0];
        const parsed = parseDate(dateVal);
        if (!parsed) continue;
        if (!parsed.m.toLowerCase().startsWith(monAbbr)) continue;
        
        const cityName = String(row[1] || '').toUpperCase();
        let region = null;
        if (cityName.includes('NAPLES') && !cityName.includes('MARCO')) region = 'naples';
        else if (cityName.includes('FORT MYERS')) region = 'fortmyers';
        else if (cityName.includes('BONITA') || cityName.includes('ESTERO')) region = 'bonita';
        
        if (!region) continue;
        
        let value = null;
        for (let j = row.length - 1; j >= 2; j--) {
            if (row[j] !== null && row[j] !== undefined && row[j] !== '') {
                value = parseFloat(String(row[j]).replace(/[,$%]/g, ''));
                if (!isNaN(value)) break;
            }
        }
        
        if (value !== null) {
            initYear(region, parsed.y);
            regionData[region][parsed.y].values.push(value);
            regionData[region][parsed.y].sum += value;
            regionData[region][parsed.y].count++;
        }
    }
    
    const isAdditive = ['closedSales', 'pendingSales', 'newListings', 'inventory'].includes(type);

    regions.forEach(r => {
        const getVal = (yr) => {
            const d = regionData[r][yr];
            if (!d || d.count === 0) return undefined;
            return isAdditive ? d.sum : (d.sum / d.count);
        };

        for (let i = 4; i >= 0; i--) {
            const histYr = year - i;
            const val = getVal(histYr);
            if (val !== undefined) {
                if (!historicalData[r][histYr]) historicalData[r][histYr] = {};
                if (type === 'price') {
                    historicalData[r][histYr][type] = '$' + Math.round(val).toLocaleString();
                } else {
                    historicalData[r][histYr][type] = Math.round(val).toLocaleString();
                }
            }
        }
    });
}

// Read CSV
const csv = fs.readFileSync('price.csv', 'utf8');
const rows = csv.split('\n').map(r => r.split(','));
processSheet('price', rows, 'March', 2026);

console.log(JSON.stringify(historicalData, null, 2));

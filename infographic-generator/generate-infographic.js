const fs = require('fs');

// Read the base64 template
const templateBase64 = fs.readFileSync('template_data_url.txt', 'utf8').trim();

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BER Infographic Generator</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap" rel="stylesheet">
    <script src="https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js"><\/script>
    <style>
        :root { --primary: #0ca7a4; --bg: #f0f4f8; --surface: #ffffff; --line: #e2e8f0; --text: #0f172a; }
        * { box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); margin: 0; padding: 24px; }
        .layout { display: flex; gap: 24px; max-width: 1600px; margin: 0 auto; }
        .sidebar { width: 380px; flex-shrink: 0; background: var(--surface); border-radius: 16px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); position: sticky; top: 24px; max-height: calc(100vh - 48px); overflow-y: auto; }
        .main { flex: 1; min-width: 0; }
        h1 { font-size: 22px; margin: 0 0 4px; }
        .subtitle { color: #64748b; font-size: 13px; margin: 0 0 20px; }
        .form-row { display: flex; gap: 12px; margin-bottom: 16px; }
        .form-group { flex: 1; }
        .form-group label { display: block; font-size: 11px; font-weight: 600; color: #64748b; margin-bottom: 4px; text-transform: uppercase; }
        .form-group input, .form-group select { width: 100%; padding: 10px 12px; border: 1px solid var(--line); border-radius: 8px; font-size: 14px; background: #f8fafc; }
        .dropzone { border: 2px dashed #cbd5e1; border-radius: 12px; padding: 28px 20px; text-align: center; cursor: pointer; transition: all 0.2s; margin-bottom: 16px; background: #f8fafc; }
        .dropzone:hover, .dropzone.dragover { border-color: var(--primary); background: #f0fdfa; }
        .file-status { margin-bottom: 20px; }
        .file-row { display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: #f1f5f9; border-radius: 8px; margin-bottom: 6px; font-size: 12px; }
        .file-row .dot { width: 8px; height: 8px; border-radius: 50%; }
        .file-row .dot.ok { background: #22c55e; }
        .file-row .dot.pending { background: #f59e0b; }
        .file-row .name { flex: 1; color: #475569; }
        .tabs { display: flex; gap: 6px; margin-bottom: 16px; }
        .tab { flex: 1; padding: 10px; border: none; background: #f1f5f9; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .tab.active { background: #0ea5e9; color: white; }
        .btn { width: 100%; padding: 14px; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .btn-primary { background: linear-gradient(135deg, #0ea5e9, #0284c7); color: white; margin-top: 16px; }
        .preview-card { background: var(--surface); border-radius: 16px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); }
        .preview-card h3 { margin: 0 0 12px; font-size: 16px; display: flex; align-items: center; gap: 8px; }
        .preview-card h3 .dot { width: 12px; height: 12px; border-radius: 50%; }
        .preview-card canvas { width: 100%; height: auto; border-radius: 8px; background: #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .preview-card .dl-btn { padding: 8px 20px; background: #334155; color: white; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; margin-top: 12px; }
        .manual-input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .manual-input-group label { font-size: 10px; font-weight:600; color:#64748b; }
        .manual-input-group input { width:100%; padding:6px; font-size:12px; border:1px solid #e2e8f0; border-radius:6px; }
    </style>
</head>
<body>
    <div class="layout">
        <aside class="sidebar">
            <h1>Infographic Generator</h1>
            <p class="subtitle">Upload Excel files to populate infographics</p>
            <div class="form-row">
                <div class="form-group">
                    <label>Month</label>
                    <select id="month" onchange="processAllFiles()">
                        <option>January</option><option>February</option><option>March</option><option>April</option>
                        <option>May</option><option>June</option><option>July</option><option>August</option>
                        <option>September</option><option>October</option><option selected>November</option><option>December</option>
                    </select>
                </div>
                <div class="form-group"><label>Year</label><input type="number" id="year" value="2025" onchange="processAllFiles()"></div>
            </div>
            <div class="dropzone" id="dropzone">
                <div style="font-size:36px;margin-bottom:8px">📊</div>
                <div style="font-size:13px;color:#64748b">Drop <strong>spreadsheets</strong> here<br>or click to browse</div>
                <input type="file" id="fileInput" multiple accept=".xlsx,.xls,.csv" style="display:none">
            </div>
            <div class="file-status" id="fileStatus"></div>
            <div style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;margin:20px 0 10px;padding-top:10px;border-top:1px solid #f1f5f9">Manual Adjustments</div>
            <div class="tabs" id="tabs"></div>
            <div id="manualInputs"></div>
            <button class="btn btn-primary" onclick="downloadAll()">⬇️ Download All 3 Images</button>
        </aside>
        <main class="main" id="previews"><div style="text-align:center;padding:40px;color:#64748b;font-size:14px">Initializing...</div></main>
    </div>

    <script>
        const TEMPLATE_BASE64 = '${templateBase64}';
        const regions = ['naples', 'fortmyers', 'bonita'];
        const regionConfig = {
            naples: { title: 'Naples Area Real Estate Activity', color: '#CC292B' }, // Red
            fortmyers: { title: 'Fort Myers Area Real Estate Activity', color: '#F5B21A' }, // Yellow/Orange
            bonita: { title: 'Bonita Springs-Estero MLS Real Estate Activity', color: '#3DB6E4' }, // Cyan/Blue
            bonita_only: { title: 'Bonita Springs Real Estate Activity', color: '#3DB6E4' },
            estero_only: { title: 'Estero Real Estate Activity', color: '#3DB6E4' }
        };

        let uploadedFiles = {};
        let historicalData = { naples: {}, fortmyers: {}, bonita: {}, bonita_only: {}, estero_only: {} };
        let templateImg = null;
        let logoImg = null;
        let templateLoaded = false;
        let data = {
            naples: { closedSales: '+14.5%', medianDays: '67', pendingSales: '+38.3%', newListings: '-9.4%', homesForSale: '+4.4%', invNew: '1,475', invSold: '530', price: '$530,000', priceChange: '(-7.4%)' },
            fortmyers: { closedSales: '+16.6%', medianDays: '53', pendingSales: '+27.9%', newListings: '-21.5%', homesForSale: '+3.3%', invNew: '1,035', invSold: '415', price: '$331,650', priceChange: '(-19.1%)' },
            bonita: { closedSales: '+39.3%', medianDays: '62', pendingSales: '+40.9%', newListings: '-7.4%', homesForSale: '+7.8%', invNew: '498', invSold: '195', price: '$500,000', priceChange: '(-7.0%)' },
            bonita_only: { closedSales: '-', medianDays: '-', pendingSales: '-', newListings: '-', homesForSale: '-', invNew: '-', invSold: '-', price: '-', priceChange: '-' },
            estero_only: { closedSales: '-', medianDays: '-', pendingSales: '-', newListings: '-', homesForSale: '-', invNew: '-', invSold: '-', price: '-', priceChange: '-' }
        };
        let activeTab = 'naples';

        let coordConfig = {
            closedSales: { x: 130, y: 276, fontSize: 58, label: 'Closed Sales' },
            medianDays: { x: 363, y: 191, fontSize: 117, label: 'Median Days' },
            pendingSales: { x: 622, y: 274, fontSize: 61, label: 'Pending Sales' },
            newListings: { x: 877, y: 274, fontSize: 63, label: 'New Listings' },
            invNew: { x: 132, y: 529, fontSize: 60, label: 'Inv New' },
            invSold: { x: 370, y: 528, fontSize: 57, label: 'Inv Sold' },
            price: { x: 848, y: 389, fontSize: 49, label: 'Price' },
            priceChange: { x: 861, y: 432, fontSize: 28, label: 'Price Change' },
            homesForSale: { x: 855, y: 505, fontSize: 64, label: 'Homes For Sale' },
            inventoryHeader: { x: 274, y: 337, fontSize: 19, label: 'Inventory Header' }
        };

        async function init() {
            const dropzone = document.getElementById('dropzone');
            const fileInput = document.getElementById('fileInput');
            dropzone.addEventListener('click', () => fileInput.click());
            dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('dragover'); });
            dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
            dropzone.addEventListener('drop', e => { e.preventDefault(); dropzone.classList.remove('dragover'); handleFiles(e.dataTransfer.files); });
            fileInput.addEventListener('change', e => handleFiles(e.target.files));
            
            try {
                templateImg = await loadImage(TEMPLATE_BASE64);
                logoImg = await loadImage('data:image/gif;base64,R0lGODlhpgUXAvf/AMLN5fn9/Jut1EFkrh1FnnqSxoWbyuX19OTk5HKLwv3+/t3j8Kzh3WHEvi2yqbzm5HvOyfn5+Tq2rrjl4tHu7BSonsPDxLXj4NPT09vb3N3y8c7W6rTB3zlcqkG5sVXAufr9/e75+NizeaW12CWupVx6ufL1+pHW0tXd7XHLxdbw7h2sovTp14yhzfnz6W2HwOH085nZ1bKys8vLzIzV0KLd2fT7+vX19YjTzs3t6unVtebq9DBVptSsbJKl0PLy8sTp5za1rBmqoLnG4WJ+u9u5hIXSzWWBvdHZ65OSlPr7/efr9cDo5fP1+ru7vODm8rzI4mJhZKSkpUW6s/L6+ltaXXNydKuqrKi42k29tu/y+OHGmXXMxq683E5us2tqbIOChXt6fKXe2kq8tfz8/CVMoaKy1+ru9jVZqCFJoO7t7iKtpPD6+ejo6ZWo0pXY00lqsZuanLG/3ixSpOr39vHz+bHi3zCyqWrIwVFwtOTLommEv23Jw1Z0tlG/t4uKjBurofz59WXGwOzw94mezNrh78rU6Jza1sbQ5tvy8Mjr6VjCu9jx78jS6Njf7uPo8yuxqCpQpD1grH3Pye3cwtLa61zDvILRzNTv7crs6ajf2yhOol7EvSmwp8bq556w1X/QyzK0qz+4sP7+/l5dYP38+vHjzn2Vx8XP5vbu4WZlaOfRrW5tcN6/jtavcVp3uO/gyH59f2hnap6dn/v28P37+IB/gnZ1d4aFh6+vsJaWmI6NjxWpn+j29Ryrovj5/Pv+/fz9/hepoB9Iny9Upff4/JCkzyBIn+Dz8jNYp/f8/Oz49/n6/Pb8+yCto1BvtOP19Pb3+p/c1ylQo+n39rfE4CNLoEZnryavpunt9Ui7tD23r+Tp82/KxFRztnjNx4GYyVrCu1d1t6y728fR5/7+/cDL5HaPxExsssfHyGfHwWBgYv79/NjX2NWtbtWub3Fwcuzr7O/v8N/f38DAwXh4epCQks/P0L6+v4iHiaCfobe2uFpZXBOonhtEnf///yH/C1hNUCBEYXRhWE1QPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgMTAuMC1jMDAwIDc5LmQyMGU0NjYzMCwgMjAyNS8xMi8wOS0wMjoxMToyMyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDI3LjUgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkUxNTZFMkVCM0YzQTExRjFBN0U1RUU3QTk1RUY0RUVGIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkUxNTZFMkVDM0YzQTExRjFBN0U1RUU3QTk1RUY0RUVGIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RTE1NkUyRTkzRjNBMTFGMUE3RTVFRTdBOTVFRjRFRUYiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RTE1NkUyRUEzRjNBMTFGMUE3RTVFRTdBOTVFRjRFRUYiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4B//79/Pv6+fj39vX08/Lx8O/u7ezr6uno5+bl5OPi4eDf3t3c29rZ2NfW1dTT0tHQz87NzMvKycjHxsXEw8LBwL++vby7urm4t7a1tLOysbCvrq2sq6qpqKempaSjoqGgn56dnJuamZiXlpWUk5KRkI+OjYyLiomIh4aFhIOCgYB/fn18e3p5eHd2dXRzcnFwb25tbGtqaWhnZmVkY2JhYF9eXVxbWllYV1ZVVFNSUVBPTk1MS0pJSEdGRURDQkFAPz49PDs6OTg3NjU0MzIxMC8uLSwrKikoJyYl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');
                templateLoaded = true;
                
                // Init Defaults based on image width
                const W = templateImg.width;
                const colW = W / 4;
                if (coordConfig.closedSales.x === null) coordConfig.closedSales.x = colW * 0.5;
                if (coordConfig.medianDays.x === null) coordConfig.medianDays.x = colW * 1.5;
                if (coordConfig.pendingSales.x === null) coordConfig.pendingSales.x = colW * 2.5;
                if (coordConfig.newListings.x === null) coordConfig.newListings.x = colW * 3.5;

                renderFileStatus(); renderTabs(); renderInputs(); renderCoordControls();
                await document.fonts.ready;
                renderPreviews(); renderAll();
            } catch(e) { console.error(e); }
        }

        function renderCoordControls() {
            const container = document.createElement('div');
            container.style.marginTop = '20px';
            container.style.borderTop = '1px solid #e2e8f0';
            container.style.paddingTop = '10px';
            container.innerHTML = '<div style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;margin-bottom:10px;">Transformation Controls</div>';
            
            const grid = document.createElement('div');
            grid.style.display = 'grid';
            grid.style.gap = '10px';
            
            Object.keys(coordConfig).forEach(key => {
                const conf = coordConfig[key];
                const row = document.createElement('div');
                row.style.background = '#f8fafc';
                row.style.padding = '8px';
                row.style.borderRadius = '6px';
                row.style.border = '1px solid #e2e8f0';
                
                // Escaped backticks and dollar signs for template literal inside template literal
                row.innerHTML = \`
                    <div style="font-size:10px;font-weight:600;margin-bottom:4px;color:#475569">\${conf.label}</div>
                    <div style="display:flex;gap:4px">
                        <input type="number" title="X" value="\${Math.round(conf.x)}" onchange="updateCoord('\${key}', 'x', this.value)" style="width:50px;font-size:10px;padding:2px">
                        <input type="number" title="Y" value="\${Math.round(conf.y)}" onchange="updateCoord('\${key}', 'y', this.value)" style="width:50px;font-size:10px;padding:2px">
                        <input type="number" title="Size" value="\${conf.fontSize}" onchange="updateCoord('\${key}', 'fontSize', this.value)" style="width:40px;font-size:10px;padding:2px">
                    </div>
                \`;
                grid.appendChild(row);
            });
            
            container.appendChild(grid);
            
            // Add Copy Button
            const btn = document.createElement('button');
            btn.textContent = 'Copy Config to Clipboard';
            btn.className = 'btn';
            btn.style.marginTop = '10px';
            btn.style.background = '#334155';
            btn.style.color = 'white';
            btn.style.padding = '8px';
            btn.onclick = () => {
                const clean = {};
                Object.keys(coordConfig).forEach(k => clean[k] = { x: Math.round(coordConfig[k].x), y: Math.round(coordConfig[k].y), fontSize: coordConfig[k].fontSize });
                navigator.clipboard.writeText(JSON.stringify(clean, null, 2));
                alert('Config copied!');
            };
            container.appendChild(btn);

            // Append to sidebar (after manual inputs)
             const sidebar = document.querySelector('.sidebar');
             sidebar.appendChild(container);
        }

        function updateCoord(key, prop, val) {
            coordConfig[key][prop] = parseFloat(val);
            renderAll();
        }

        function loadImage(src) { return new Promise((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = src; }); }

        function drawImageScaled(ctx, img, x, y, w, h) {
            let tempCanvas = document.createElement('canvas');
            let tempCtx = tempCanvas.getContext('2d');
            let curW = img.width;
            let curH = img.height;
            tempCanvas.width = curW;
            tempCanvas.height = curH;
            tempCtx.drawImage(img, 0, 0);
            while (curW * 0.5 > w) {
                let nextW = Math.round(curW * 0.5);
                let nextH = Math.round(curH * 0.5);
                let nextCanvas = document.createElement('canvas');
                nextCanvas.width = nextW;
                nextCanvas.height = nextH;
                let nextCtx = nextCanvas.getContext('2d');
                nextCtx.imageSmoothingEnabled = true;
                nextCtx.imageSmoothingQuality = 'high';
                nextCtx.drawImage(tempCanvas, 0, 0, curW, curH, 0, 0, nextW, nextH);
                tempCanvas = nextCanvas;
                curW = nextW;
                curH = nextH;
            }
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(tempCanvas, 0, 0, curW, curH, x, y, w, h);
        }

        function handleFiles(files) {
            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.onload = e => {
                    try {
                        const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
                        const sheet = wb.Sheets[wb.SheetNames[0]];
                        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                        let type = detectMetricType(file.name, rows);
                        if(type) { uploadedFiles[type] = { rows, fileName: file.name }; renderFileStatus(); processAllFiles(); }
                        else { askUserForType(file.name, rows); }
                    } catch(err) { alert('Error reading file: ' + file.name); }
                };
                reader.readAsArrayBuffer(file);
            });
        }

        function detectMetricType(filename, rows) {
            // Remove extension and normalize
            const name = filename.split('.')[0].toLowerCase().trim();
            
            // Strict matching for user's new naming convention (closedSales.xlsx -> closedSales)
            if (name === 'closedsales') return 'closedSales';
            if (name === 'mediandays') return 'medianDays';
            if (name === 'pendingsales') return 'pendingSales';
            if (name === 'newlistings') return 'newListings';
            if (name === 'inventory') return 'inventory';
            if (name === 'price') return 'price';
            
            // Robust fallback matching (e.g. "closedSales (1).xlsx" or "Closed Sales.xlsx")
            if (name.includes('closed') && name.includes('sales')) return 'closedSales';
            if (name.includes('median') && name.includes('days')) return 'medianDays';
            if (name.includes('pending') && name.includes('sales')) return 'pendingSales';
            if (name.includes('new') && name.includes('listing')) return 'newListings';
            if (name.includes('inventory')) return 'inventory';
            if (name.includes('price')) return 'price';
            
            return null;
        }

        function askUserForType(filename, rows) {
            const types = ['closedSales', 'medianDays', 'pendingSales', 'newListings', 'inventory', 'price'];
            const labels = ['Closed Sales', 'Median Days on Market', 'Pending Sales', 'New Listings', 'Inventory/Homes for Sale', 'Median Price'];
            const choice = prompt('What metric type is this file?\\n\\nFile: ' + filename.substring(0, 20) + '...\\n\\n' + labels.map((l,i) => (i+1) + '. ' + l).join('\\n') + '\\n\\nEnter number (1-6):');
            const idx = parseInt(choice) - 1;
            if (idx >= 0 && idx < types.length) { 
                uploadedFiles[types[idx]] = { rows, fileName: filename }; 
                renderFileStatus(); 
                processAllFiles(); 
            }
        }

        function processAllFiles() {
            const m = document.getElementById('month').value;
            const y = parseInt(document.getElementById('year').value);
            historicalData = { naples: {}, fortmyers: {}, bonita: {}, bonita_only: {}, estero_only: {} };
            Object.keys(uploadedFiles).forEach(t => processSheet(t, uploadedFiles[t].rows, m, y));
            renderInputs(); renderAll();
        }

        // NEW: Row-based data parsing (each row = one city + one date)
        function processSheet(type, rows, month, year) {
            if (rows.length < 2) return;
            
            const monAbbr = month.substring(0,3).toLowerCase();
            
            // Data structure: { region: { year: { sum: 0, count: 0, values: [] } } }
            const regionData = { naples: {}, fortmyers: {}, bonita: {}, bonita_only: {}, estero_only: {} };
            
            // Helper to init year obj
            const initYear = (reg, yr) => {
                if (!regionData[reg][yr]) regionData[reg][yr] = { sum: 0, count: 0, values: [] };
            };

            // Skip header row, process data rows
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                if (!row || row.length < 2) continue;
                
                // Column 0: Date (Excel serial or string)
                const dateVal = row[0];
                const parsed = parseDate(dateVal);
                if (!parsed) continue;
                
                // If the spreadsheet provides a month, filter on it.
                // If it only provides a year (e.g. 2022), ASSUME it corresponds to the month we're extracting.
                if (!parsed.isYearOnly) {
                    if (!parsed.m.toLowerCase().startsWith(monAbbr)) continue;
                }
                
                // Column 1: City/Series name
                const cityName = String(row[1] || '').toUpperCase();
                let region = null;
                let subRegion = null;
                if (cityName.includes('NAPLES') && !cityName.includes('MARCO')) region = 'naples';
                else if (cityName.includes('FORT MYERS')) region = 'fortmyers';
                else if (cityName.includes('BONITA')) { region = 'bonita'; subRegion = 'bonita_only'; }
                else if (cityName.includes('ESTERO')) { region = 'bonita'; subRegion = 'estero_only'; }
                
                if (!region) continue;
                
                // Find the value (last non-null column)
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
                    
                    if (subRegion) {
                        initYear(subRegion, parsed.y);
                        regionData[subRegion][parsed.y].values.push(value);
                        regionData[subRegion][parsed.y].sum += value;
                        regionData[subRegion][parsed.y].count++;
                    }
                }
            }
            
            // Determine aggregation method
            // Additive: Closed Sales, Pending Sales, New Listings, Inventory
            // Average: Median Days, Price
            const isAdditive = ['closedSales', 'pendingSales', 'newListings', 'inventory'].includes(type);

            // Calculate and apply to data
            const allRegions = ['naples', 'fortmyers', 'bonita', 'bonita_only', 'estero_only'];
            allRegions.forEach(r => {
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

                const curr = getVal(year);
                const prev = getVal(year - 1);
                
                if (curr === undefined) return;
                
                if (type === 'closedSales') {
                    if (prev) data[r].closedSales = fmtPct((curr - prev) / prev);
                    data[r].invSold = fmtNum(curr);
                }
                if (type === 'medianDays') {
                    data[r].medianDays = Math.round(curr).toString();
                }
                if (type === 'pendingSales' && prev) {
                    data[r].pendingSales = fmtPct((curr - prev) / prev);
                }
                if (type === 'newListings') {
                    if (prev) data[r].newListings = fmtPct((curr - prev) / prev);
                    data[r].invNew = fmtNum(curr);
                }
                if (type === 'inventory' && prev) {
                    // Inventory is additive (total homes for sale)
                    data[r].homesForSale = fmtPct((curr - prev) / prev);
                }
                if (type === 'price') {
                    data[r].price = '$' + Math.round(curr).toLocaleString();
                    if (prev) data[r].priceChange = '(' + fmtPct((curr - prev) / prev) + ')';
                }
            });
        }

        function parseDate(val) {
            if (val === null || val === undefined) return null;
            const strVal = String(val).trim();
            
            // 4-digit year format (e.g., 2022)
            if (/^\\d{4}$/.test(strVal)) {
                return { isYearOnly: true, y: parseInt(strVal) };
            }
            
            // MMM-YY or MMM-YYYY String Date format
            const monthRegex = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[-/\\s](\\d{2}|\\d{4})$/i;
            const mMatch = strVal.match(monthRegex);
            if (mMatch) {
                let y = parseInt(mMatch[2]);
                if (y < 100) y += 2000;
                return { m: mMatch[1].substring(0,3), y: y };
            }

            // Excel serial number
            if (!isNaN(val) && parseFloat(val) > 20000) {
                const d = new Date((parseFloat(val) - 25569) * 86400 * 1000);
                return { m: d.toLocaleString('default', { month: 'short' }), y: d.getFullYear() };
            }
            
            // Standard String date fallback
            const d = new Date(val);
            if (d instanceof Date && !isNaN(d)) {
                return { m: d.toLocaleString('default', { month: 'short' }), y: d.getFullYear() };
            }
            return null;
        }
        
        function fmtPct(v) { 
            const p = Math.round(v * 100); 
            return (p > 0 ? '+' : '') + p + '%'; 
        }
        
        function fmtNum(v) { 
            return Math.round(v).toLocaleString(); 
        }

        function renderFileStatus() {
            const div = document.getElementById('fileStatus');
            const types = ['closedSales', 'medianDays', 'pendingSales', 'newListings', 'inventory', 'price'];
            div.innerHTML = types.map(t => {
                const f = uploadedFiles[t];
                return '<div class="file-row"><div class="dot ' + (f ? 'ok' : 'pending') + '"></div><div class="name">' + t + '</div><div class="fname">' + (f ? f.fileName.substring(0, 15) + '...' : '-') + '</div></div>';
            }).join('');
        }
        function renderTabs() { 
            const tabContainer = document.getElementById('tabs');
            let html = regions.map(r => '<button class="tab '+(activeTab===r?'active':'')+'" onclick="setTab(\\''+r+'\\')">'+regionConfig[r].title.split(' ')[0]+'</button>').join(''); 
            html += '<button class="tab '+(activeTab===\'video\'?\'active\':\'\')+'" onclick="setTab(\\\'video\\\')">Video Info</button>';
            tabContainer.innerHTML = html;
        }
        function setTab(r) { 
            activeTab = r; 
            renderTabs(); 
            if (r === 'video') {
                renderVideoInfo();
            } else {
                renderInputs(); 
            }
        }
        function renderInputs() {
            const d = data[activeTab];
            const fields = ['closedSales', 'medianDays', 'pendingSales', 'newListings', 'homesForSale', 'invNew', 'invSold', 'price', 'priceChange'];
            document.getElementById('manualInputs').innerHTML = '<div class="manual-input-grid">' + fields.map(k => '<div class="manual-input-group"><label>'+k+'</label><input type="text" value="'+d[k]+'" onchange="updateData(\\''+activeTab+'\\',\\''+k+'\\',this.value)"></div>').join('') + '</div>';
        }

        function renderVideoInfo() {
            const mon = document.getElementById('month').value;
            const yr = document.getElementById('year').value;
            
            let html = \`
                <div style="font-size:12px; line-height:1.5; color:#334155;">
                    <p style="margin-bottom:12px; font-style:italic; color:#64748b;">Copy and paste these templates and raw data for your videos.</p>
            \`;

            const videoRegions = ['naples', 'fortmyers', 'bonita', 'bonita_only', 'estero_only'];
            videoRegions.forEach(r => {
                const d = data[r];
                const titleBase = regionConfig[r].title.split('-')[0].replace(' MLS', '').trim();
                const locName = r === 'fortmyers' ? 'Fort Myers & Fort Myers Beach' : r === 'bonita_only' ? 'Bonita Springs' : r === 'estero_only' ? 'Estero' : r.charAt(0).toUpperCase() + r.slice(1);
                const tagLoc = r === 'fortmyers' ? 'FORTMYERS' : r === 'bonita_only' ? 'BONITASPRINGS' : r === 'estero_only' ? 'ESTERO' : r.toUpperCase();
                
                const title = \`\${titleBase} Housing Market Update (\${mon} \${yr}) | Prices, Inventory & Supply\`;
                const desc = \`Southwest Florida real estate market update for \${mon} \${yr}. In this update, we break down the median sale price (\${d.price}), inventory (\${d.homesForSale} change), and \${d.invSold} closed sales for \${locName}, with year-over-year comparisons.\`;
                const tags = \`#SWFL #RealEstate #\${tagLoc} #MarketUpdate\`;
                let rawData = \`Closed Sales: \${d.closedSales}\\nMedian Days: \${d.medianDays}\\nPending Sales: \${d.pendingSales}\\nNew Listings: \${d.newListings}\\nInventory New: \${d.invNew}\\nInventory Sold: \${d.invSold}\\nMedian Price: \${d.price} \${d.priceChange}\\nHomes For Sale: \${d.homesForSale}\\n\\n--- 5-YEAR HISTORY ---\\n\`;
                const metricLabels = { price: 'Median Price', inventory: 'Homes for Sale', closedSales: 'Closed Sales' };
                ['price', 'inventory', 'closedSales'].forEach(histType => {
                    rawData += \`\${metricLabels[histType]}:\\n\`;
                    for (let i = 4; i >= 0; i--) {
                        const histYr = yr - i;
                        const val = historicalData[r][histYr] && historicalData[r][histYr][histType] ? historicalData[r][histYr][histType] : 'N/A';
                        rawData += \`  \${histYr}: \${val}\\n\`;
                    }
                });

                const panelHeading = r === 'bonita_only' ? 'BONITA SPRINGS (ONLY)' : r === 'estero_only' ? 'ESTERO (ONLY)' : r === 'fortmyers' ? 'FORT MYERS (CONSOLIDATED)' : r.toUpperCase();

                html += \`
                    <div style="background:#f1f5f9; padding:12px; border-radius:8px; margin-bottom:16px; border:1px solid #e2e8f0;">
                        <h4 style="margin:0 0 8px; color:#0f172a; text-transform:uppercase; font-size:11px; letter-spacing:0.5px;">\${panelHeading}</h4>
                        
                        <label style="font-size:9px; font-weight:700; color:#64748b; display:block; margin-bottom:2px;">RAW INFOGRAPHIC DATA</label>
                        <textarea readonly style="width:100%; font-size:11px; padding:6px; border:1px solid #cbd5e1; border-radius:4px; margin-bottom:8px; background:white; height:240px;">\${rawData}</textarea>

                        <label style="font-size:9px; font-weight:700; color:#64748b; display:block; margin-bottom:2px;">VIDEO TITLE</label>
                        <textarea readonly style="width:100%; font-size:11px; padding:6px; border:1px solid #cbd5e1; border-radius:4px; margin-bottom:8px; background:white; height:40px;">\${title}</textarea>
                        
                        <label style="font-size:9px; font-weight:700; color:#64748b; display:block; margin-bottom:2px;">DESCRIPTION</label>
                        <textarea readonly style="width:100%; font-size:11px; padding:6px; border:1px solid #cbd5e1; border-radius:4px; margin-bottom:8px; background:white; height:80px;">\${desc}</textarea>
                        
                        <label style="font-size:9px; font-weight:700; color:#64748b; display:block; margin-bottom:2px;">TAGS</label>
                        <input readonly type="text" value="\${tags}" style="width:100%; font-size:11px; padding:6px; border:1px solid #cbd5e1; border-radius:4px; background:white;">
                    </div>
                \`;
            });

            html += '</div>';
            document.getElementById('manualInputs').innerHTML = html;
        }
        function updateData(r,k,v) { data[r][k] = v; renderCanvas(r); }
        function renderPreviews() { document.getElementById('previews').innerHTML = regions.map(r => '<div class="preview-card"><h3><div class="dot" style="background:'+regionConfig[r].color+'"></div>'+regionConfig[r].title.split(' ')[0]+'</h3><canvas id="canvas-'+r+'"></canvas><div style="text-align:center"><button class="dl-btn" onclick="dl(\\''+r+'\\')">Download PNG</button></div></div>').join(''); }
        function renderAll() { regions.forEach(renderCanvas); }
        function downloadAll() {
            regions.forEach(r => dl(r));
        }

        function dl(r) { 
            const c = document.getElementById('canvas-'+r); 
            // Convert to data URL
            let url = c.toDataURL('image/png');
            // Hack: replace mime type to force download in some browsers
            url = url.replace('data:image/png', 'data:application/octet-stream');
            
            const l = document.createElement('a'); 
            const cityName = regionConfig[r].title.split(' ')[0]; 
            const month = document.getElementById('month').value;
            const year = document.getElementById('year').value;
            l.download = cityName + ' ' + month + ' ' + year + '.png';
            l.href = url;
            
            // Required for some browsers
            document.body.appendChild(l);
            l.click(); 
            document.body.removeChild(l);
        }

        function renderCanvas(region) {
            if (!templateLoaded) return;
            const canvas = document.getElementById('canvas-' + region);
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            const d = data[region];
            const cfg = regionConfig[region];
            const W = templateImg.width;
            const H = templateImg.height;
            canvas.width = W;
            canvas.height = H;

            ctx.drawImage(templateImg, 0, 0, W, H);

            // Clear the old logo
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(705, 5, 305, 67);

            // Draw the new logo
            if (logoImg) {
                const logoH = 55;
                const logoW = Math.round(logoH * (logoImg.width / logoImg.height));
                const logoX = W - 18 - logoW;
                const logoY = Math.round((72 - logoH) / 2);
                drawImageScaled(ctx, logoImg, logoX, logoY, logoW, logoH);
            }

            // Text Styles
            ctx.shadowColor = 'rgba(0,0,0,0.4)';
            ctx.shadowBlur = 6;
            ctx.shadowOffsetY = 2;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // 1. Title (No Shadow, Color set by region)
            ctx.save();
            ctx.shadowColor = 'transparent';
            ctx.textAlign = 'left';
            ctx.fillStyle = cfg.color;
            ctx.font = '900 28px Inter';
            ctx.fillText(cfg.title, 18, 32);
            
            // Subtitle
            const mon = document.getElementById('month').value;
            const yr = document.getElementById('year').value;
            ctx.fillStyle = '#4a4a4a';
            ctx.font = '500 13px Inter';
            ctx.fillText('Figures based upon a one-year comparison between ' + mon + ' ' + (parseInt(yr)-1) + ' to ' + mon + ' ' + yr, 18, 56);
            ctx.restore();

            // 2. Data Values (White with Shadow)
            ctx.fillStyle = '#FFFFFF';
            
            // Helper to get font
            const getFont = (f) => '900 ' + f + 'px Inter';

            // Closed Sales (Left)
            ctx.font = getFont(coordConfig.closedSales.fontSize);
            ctx.fillText(d.closedSales, coordConfig.closedSales.x, coordConfig.closedSales.y);

            // Median Days (2nd Col) - Calendar
            ctx.save();
            ctx.fillStyle = '#222222';
            ctx.shadowColor = 'transparent';
            ctx.font = getFont(coordConfig.medianDays.fontSize);
            ctx.fillText(d.medianDays, coordConfig.medianDays.x, coordConfig.medianDays.y);
            ctx.restore();

            // Pending Sales (3rd Col)
            ctx.font = getFont(coordConfig.pendingSales.fontSize);
            ctx.fillText(d.pendingSales, coordConfig.pendingSales.x, coordConfig.pendingSales.y);

            // New Listings (4th Col)
            ctx.font = getFont(coordConfig.newListings.fontSize);
            ctx.fillText(d.newListings, coordConfig.newListings.x, coordConfig.newListings.y);

            // --- Row 2 ---
            
            // Inventory Header Date
            ctx.save();
            ctx.shadowColor = 'transparent';
            ctx.textAlign = 'left';
            ctx.font = '700 ' + coordConfig.inventoryHeader.fontSize + 'px Inter';
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(mon + ' ' + yr, coordConfig.inventoryHeader.x, coordConfig.inventoryHeader.y);
            ctx.restore();

            // Inventory Signs (Bottom Left Block)
            // New Listings Sign (Left)
            ctx.font = getFont(coordConfig.invNew.fontSize);
            ctx.fillText(d.invNew, coordConfig.invNew.x, coordConfig.invNew.y);
            // Sold Sign (Right)
            ctx.font = getFont(coordConfig.invSold.fontSize);
            ctx.fillText(d.invSold, coordConfig.invSold.x, coordConfig.invSold.y);

            // Price (Bottom Right Block)
            // Median Price
            ctx.font = getFont(coordConfig.price.fontSize);
            ctx.fillText(d.price, coordConfig.price.x, coordConfig.price.y);
            
            // Price Change
            ctx.font = '700 ' + coordConfig.priceChange.fontSize + 'px Inter';
            ctx.fillText(d.priceChange, coordConfig.priceChange.x, coordConfig.priceChange.y);

            // Homes for Sale
            ctx.font = getFont(coordConfig.homesForSale.fontSize);
            ctx.fillText(d.homesForSale, coordConfig.homesForSale.x, coordConfig.homesForSale.y);
        }

        init();
    </script>
</body>
</html>`;

fs.writeFileSync('infographic-generator.html', htmlContent);

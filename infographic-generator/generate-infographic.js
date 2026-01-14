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
            bonita: { title: 'Bonita Springs-Estero MLS Real Estate Activity', color: '#3DB6E4' } // Cyan/Blue
        };

        let uploadedFiles = {};
        let templateImg = null;
        let templateLoaded = false;
        let data = {
            naples: { closedSales: '+14.5%', medianDays: '67', pendingSales: '+38.3%', newListings: '-9.4%', homesForSale: '+4.4%', invNew: '1,475', invSold: '530', price: '$530,000', priceChange: '(-7.4%)' },
            fortmyers: { closedSales: '+16.6%', medianDays: '53', pendingSales: '+27.9%', newListings: '-21.5%', homesForSale: '+3.3%', invNew: '1,035', invSold: '415', price: '$331,650', priceChange: '(-19.1%)' },
            bonita: { closedSales: '+39.3%', medianDays: '62', pendingSales: '+40.9%', newListings: '-7.4%', homesForSale: '+7.8%', invNew: '498', invSold: '195', price: '$500,000', priceChange: '(-7.0%)' }
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
            homesForSale: { x: 855, y: 505, fontSize: 64, label: 'Homes For Sale' }
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
            Object.keys(uploadedFiles).forEach(t => processSheet(t, uploadedFiles[t].rows, m, y));
            renderInputs(); renderAll();
        }

        // NEW: Row-based data parsing (each row = one city + one date)
        function processSheet(type, rows, month, year) {
            if (rows.length < 2) return;
            
            const monAbbr = month.substring(0,3).toLowerCase();
            
            // Data structure: { region: { year: { sum: 0, count: 0, values: [] } } }
            const regionData = { naples: {}, fortmyers: {}, bonita: {} };
            
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
                
                // Check if this row's month matches
                if (!parsed.m.toLowerCase().startsWith(monAbbr)) continue;
                
                // Column 1: City/Series name
                const cityName = String(row[1] || '').toUpperCase();
                let region = null;
                if (cityName.includes('NAPLES') && !cityName.includes('MARCO')) region = 'naples';
                else if (cityName.includes('FORT MYERS')) region = 'fortmyers';
                else if (cityName.includes('BONITA') || cityName.includes('ESTERO')) region = 'bonita';
                
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
                }
            }
            
            // Determine aggregation method
            // Additive: Closed Sales, Pending Sales, New Listings, Inventory
            // Average: Median Days, Price
            const isAdditive = ['closedSales', 'pendingSales', 'newListings', 'inventory'].includes(type);

            // Calculate and apply to data
            regions.forEach(r => {
                const getVal = (yr) => {
                    const d = regionData[r][yr];
                    if (!d || d.count === 0) return undefined;
                    return isAdditive ? d.sum : (d.sum / d.count);
                };

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
            // Excel serial number
            if (!isNaN(val) && parseFloat(val) > 20000) {
                const d = new Date((parseFloat(val) - 25569) * 86400 * 1000);
                return { m: d.toLocaleString('default', { month: 'short' }), y: d.getFullYear() };
            }
            // String date
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
        function renderTabs() { document.getElementById('tabs').innerHTML = regions.map(r => '<button class="tab '+(activeTab===r?'active':'')+'" onclick="setTab(\\''+r+'\\')">'+regionConfig[r].title.split(' ')[0]+'</button>').join(''); }
        function setTab(r) { activeTab = r; renderTabs(); renderInputs(); }
        function renderInputs() {
            const d = data[activeTab];
            const fields = ['closedSales', 'medianDays', 'pendingSales', 'newListings', 'homesForSale', 'invNew', 'invSold', 'price', 'priceChange'];
            document.getElementById('manualInputs').innerHTML = '<div class="manual-input-grid">' + fields.map(k => '<div class="manual-input-group"><label>'+k+'</label><input type="text" value="'+d[k]+'" onchange="updateData(\\''+activeTab+'\\',\\''+k+'\\',this.value)"></div>').join('') + '</div>';
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
            ctx.font = '700 16px Inter';
            ctx.fillStyle = '#FFFFFF';
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

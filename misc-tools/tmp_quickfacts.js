
// Helper to get month index from name
function getMonthIndex(name) {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return monthNames.indexOf(name) + 1;
}

function calculateQuickFacts() {
    try {
        const monthName = document.getElementById('selectMonth').value;
        const year = parseInt(document.getElementById('selectYear').value);
        const prevYear = year - 1;
        const monthIdx = getMonthIndex(monthName);

        const formatPct = (val) => {
            const s = val.toFixed(1) + '%';
            return val > 0 ? '+' + s : s;
        };

        // Helper to get value for ALL properties (SF + Condo)
        const getAllVal = (metricKey, y) => {
            return getMetricValue('all', metricKey, monthIdx, y);
        };

        // 1. Closed Sales
        const currClosed = getAllVal('closedSales', year);
        const prevClosed = getAllVal('closedSales', prevYear);
        const chgClosed = prevClosed ? ((currClosed - prevClosed) / prevClosed) * 100 : 0;

        // 2. Median Price (Weighted)
        const currMedian = getAllVal('medianPrice', year);
        const prevMedian = getAllVal('medianPrice', prevYear);
        const chgMedian = prevMedian ? ((currMedian - prevMedian) / prevMedian) * 100 : 0;

        // 3. Inventory
        const currInv = getAllVal('inventory', year);
        const prevInv = getAllVal('inventory', prevYear);
        const chgInv = prevInv ? ((currInv - prevInv) / prevInv) * 100 : 0;

        return {
            closedSales: formatPct(chgClosed),
            medianPrice: formatPct(chgMedian),
            activeListings: formatPct(chgInv)
        };
    } catch (e) {
        console.warn('Error in calculateQuickFacts', e);
        return { closedSales: 'N/A', medianPrice: 'N/A', activeListings: 'N/A' };
    }
}

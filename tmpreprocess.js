
// Update report triggers
function reprocessAllData() {
    // Since we now pull data on demand via getMetricValue, 
    // we just need to refresh the UI.
    if (document.getElementById('monthly-indicators-container').style.display !== 'none') {
        generateMonthlyIndicators();
    } else {
        updateReport();
    }
}

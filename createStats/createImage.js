
const fs = require('fs');

const makeinstallmentImage = require('./create/installment.js');
const makeDoughnutChart = require('./create/makeDoughnutChart.js');
const makeBarChart = require('./create/makeBarChart.js');
const makeRadarChart = require('./create/makeRadarChart.js');


function createImage(statsData) {

    const folderPath = `create/charts/${statsData.dataType}`;
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
        console.log(`Created ${folderPath} folder.`);
    }

    makeBarChart(statsData, "favoriteTags", 1050);
    makeBarChart(statsData, "releaseYears", 510);
    makeDoughnutChart(statsData, "typesImage");
    makeDoughnutChart(statsData, "sourcesImage");
    makeinstallmentImage(statsData);
    

    makeRadarChart(statsData, "favoriteTags", 510);

    const jsonData = JSON.stringify(statsData, null, 2);
    fs.writeFileSync(`${folderPath}/chartsData.json`, jsonData);
}

module.exports = createImage;

const fs = require('fs');

const makeinstallmentImage = require('./create/installment.js');
const makeDoughnutChart = require('./create/makeDoughnutChart.js');
const makeBarChart = require('./create/makeBarChart.js');
const makeRadarChart = require('./create/makeRadarChart.js');

const settings = require('./settings.json');

function createImage(statsData) {

    const folderPath = `create/charts/${statsData.dataType}`;
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
        console.log(`Created ${folderPath} folder.`);
    }

    const jsonData = JSON.stringify(statsData, null, 2);
    fs.writeFileSync(`${folderPath}/chartsData.json`, jsonData);


    // Creating of charts.

    makeinstallmentImage(statsData);
    makeRadarChart(statsData, "favoriteTags", 510);

    settings.charts.forEach(chart => {
        if (chart.dataAndIndex) {

            const dataKey = Object.keys(chart.dataAndIndex)[0];

            const testData = processStatsData(statsData[dataKey], chart);

            switch (chart.type) {
                case 'bar':
                    makeBarChart(testData, chart.name, chart.chartWidth, statsData.dataType);
                    break;
                case 'doughnut':
                    makeDoughnutChart(testData, chart.name, statsData.dataType);
                    break;
                default:
                    console.log(`Invalid chart type: ${chart.type}`);
             }
        } else {
            console.error(`dataAndIndex value not found for ${chart}`);
        }
    });

}

function processStatsData(statsData, chartSettings) {
    const { dataAndIndex, limit, bgColors } = chartSettings;

    const index = Object.values(dataAndIndex)[0];

    // Sorting based on the index. so in example for tags if index is 1 then it means installemnt.
    statsData.sort((a, b) => {
        const property = Object.keys(a)[index];
        return b[property] - a[property];
    });


    const labelKey = Object.keys(statsData[0])[0];
    let labels = statsData.map(data => {
        if (Object.keys(data).length === 1) {
            return Object.keys(data)[0]; // For like types where the label is the key.
        } else {
            return data[labelKey];
        }
    });


    let counts = statsData.map(data => data[Object.keys(data)[index]]);


    labels = labels.slice(0, limit);
    counts = counts.slice(0, limit);

    // Adding bgcolors with getrandomcolors if theres not enough bgcolors.

    let borderColors = [];
    if (!bgColors || bgColors.length < limit) {
        const missingColors = limit - (bgColors ? bgColors.length : 0);
        for (let i = 0; i < missingColors; i++) {
            const color = getRandomColor();
            const borderColor = color.replace('0.5', '1');
            borderColors.push(borderColor);
            bgColors.push(color);
        }
    } else {
        borderColors = bgColors.map(color => color.replace('0.5', '1'));
    }


    return { labels, counts, bgColors, borderColors };
}

function getRandomColor() {
    const minBrightness = 70;
    let r, g, b;
    let brightness;

    do {
        r = Math.floor(Math.random() * 206) + 50;
        g = Math.floor(Math.random() * 206) + 50;
        b = Math.floor(Math.random() * 206) + 50;

        brightness = (r * 299 + g * 587 + b * 114) / 1000;

    } while (brightness < minBrightness);

    return `rgba(${r}, ${g}, ${b}, 0.5)`;
}


module.exports = createImage;
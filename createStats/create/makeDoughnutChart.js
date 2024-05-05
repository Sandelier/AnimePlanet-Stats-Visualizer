const fs = require('fs');
const { createCanvas } = require('canvas');
const Chart = require('chart.js/auto');
const ChartDataLabels = require('chartjs-plugin-datalabels');



function getSourcesData(statsData) {
    const sourcePercentages = statsData.sourcePercentages;

    const total = Object.values(sourcePercentages).reduce((acc, source) => acc + source.count, 0);

    let labels = Object.entries(sourcePercentages).map(([sourceName, source]) => {
        const cleanSourceName = sourceName.startsWith("Based on a ") ? sourceName.replace("Based on a ", "") : sourceName;
        const amount = source.count;
        return `${cleanSourceName} (${amount})`;
    });



    let data = Object.values(sourcePercentages).map(source => source.count);

    labels = ["Based on a...", ...labels];
    data = [0, ...data];

    const bgColors = [
        'rgba(0, 0, 0, 0)',
        '#FF5733',
        '#FFD700',
        '#00FF00',
        '#4169E1',
        '#FF69B4',
        '#00FFFF',
        '#FF5733',
        '#00FF00'
    ];

    return { total, labels, data, bgColors };
}

function getTypesData(statsData) {
    const typesCounts = statsData.typesCounts;

    const total = typesCounts.reduce((acc, type) => acc + Object.values(type)[0], 0);
    const labels = typesCounts.map(type => {
        const typeName = Object.keys(type)[0];
        const amount = Object.values(type)[0];
        if (amount > 0) {
          return `${typeName} (${amount})`;
        } else {
            return null;
        }
    }).filter(label => label !== null);

    const data = typesCounts.map(type => Object.values(type)[0]);


    const bgColors = [
        '#FF5733',
        '#FFD700',
        '#00FF00',
        '#4169E1',
        '#FF69B4',
        '#00FFFF'
    ];

    return { total, labels, data, bgColors };
}



function makeDoughnutChart(statsData, imgName) {
    let total, labels, data, bgColors;

    if (imgName === "typesImage") {
        const typesData = getTypesData(statsData);
        total = typesData.total;
        labels = typesData.labels;
        data = typesData.data;
        bgColors = typesData.bgColors;
    } else {
        const sourcesData = getSourcesData(statsData);
        total = sourcesData.total;
        labels = sourcesData.labels;
        data = sourcesData.data;
        bgColors = sourcesData.bgColors;
    }

    const canvas = createCanvas(510, 246);
    const ctx = canvas.getContext('2d');

    const options = {
        responsive: false,
        animation: false,
        plugins: {
            datalabels: {
                formatter: (value, context) => {
                    const percentage = ((value / total) * 100).toFixed(2);
                    return `${percentage}%`;
                },
                display: (context) => {
                    const percentage = (context.dataset.data[context.dataIndex] / total) * 100;
                    return percentage >= 5;
                },
                color: 'black',
                font: {
                    size: 14
                }
            },
            legend: {
                position: 'left',
                labels: {
                    font: {
                        size: 14
                    },
                    usePointStyle: true,
                    padding: 10
                },
            },
        }
    };


    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: bgColors,
                borderWidth: 0,
                spacing: 5
            }]
        },
        options: options,
        plugins: [ChartDataLabels]
    });

    //return { canvas, name: name };

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(`create/charts/${statsData.dataType}/${imgName}.png`, buffer);
    console.log(`${imgName} image created successfully.`);
}

module.exports = makeDoughnutChart;
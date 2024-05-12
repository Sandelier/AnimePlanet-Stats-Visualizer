const fs = require('fs');
const { createCanvas } = require('canvas');
const Chart = require('chart.js/auto');
const ChartDataLabels = require('chartjs-plugin-datalabels');






function makeDoughnutChart(datas, imgName, dataType) { 

    const bgColors = datas.bgColors;
    const data = datas.counts;
    const total = data.reduce((acc, val) => acc + val, 0);
    const labels = datas.labels.map((label, index) => `${label} (${data[index]})`);

    const canvas = createCanvas(510, 246);
    const ctx = canvas.getContext('2d');

    Chart.defaults.color = 'white';

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
    fs.writeFileSync(`create/charts/${dataType}/${imgName}.png`, buffer);
    console.log(`${imgName} image created successfully.`);
}

module.exports = makeDoughnutChart;
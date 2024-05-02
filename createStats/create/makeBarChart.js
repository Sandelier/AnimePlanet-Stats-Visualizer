const fs = require('fs');
const { createCanvas } = require('canvas');
const Chart = require('chart.js/auto');

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

function getFavoriteTagsData(statsData) {
    const tagCounts = statsData.tagCounts.slice(0, 15);

    const labels = tagCounts.map(tag => tag.tag);
    const counts = tagCounts.map(tag => tag.occurrences);

    const backgroundColors = [];
    const borderColors = [];

    labels.forEach(() => {
        const randomColor = getRandomColor();
        backgroundColors.push(randomColor);
        borderColors.push(randomColor.replace('0.5', '1'));
    });

    const data = {
        labels: labels,
        datasets: [{
            label: 'Favorite Tags',
            data: counts,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 2
        }]
    };

    return data;
}

function getReleaseYearData(statsData) {
    const miniumValue = 5;
    const limit = 10;
    const filteredYearCounts = statsData.yearCounts.filter(year => Object.values(year)[0] >= miniumValue).slice(0, limit);

    const labels = filteredYearCounts.map(year => Object.keys(year)[0]);
    const counts = filteredYearCounts.map(year => Object.values(year)[0]);

    const backgroundColors = [];
    const borderColors = [];

    labels.forEach(() => {
        const randomColor = getRandomColor();
        backgroundColors.push(randomColor);
        borderColors.push(randomColor.replace('0.5', '1'));
    });

    const data = {
        labels: labels,
        datasets: [{
            label: 'Release Years',
            data: counts,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 2
        }]
    };

    return data;
}

function makeBarChart(statsData, imgName, canvasWidth) { 

    const canvas = createCanvas(canvasWidth, 246);
    const ctx = canvas.getContext('2d');


    let data;

    if (imgName === "favoriteTags") {
        data = getFavoriteTagsData(statsData);
    } else {
        data = getReleaseYearData(statsData);
    }

    // https://stackoverflow.com/a/69357906
    const plugin = {
        id: 'background',
        beforeDraw: (chart, args, opts) => {
          if (!opts.color) {
            return;
          }
      
          const { ctx } = chart;
      
          ctx.fillStyle = opts.color;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }

    Chart.register(plugin);

    Chart.defaults.color = 'white';

    const options = {
        responsive: false,
        animation: false,
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(255, 255, 255, 0.2)'
                },

                ticks: {
                    //stepSize: 5000,
                    maxTicksLimit: 20
                }
            }
        },
        plugins: {
            background: {
              color: '#1f1f1f'
            },

            legend: {
                display: false
            }
        }
    };

    const chart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: options
    }); 
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(`create/images/${imgName}.png`, buffer);
    console.log(`${imgName} image created successfully.`);
}

module.exports = makeBarChart;
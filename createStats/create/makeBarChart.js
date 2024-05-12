const fs = require('fs');
const { createCanvas } = require('canvas');
const Chart = require('chart.js/auto');


function makeBarChart(datas, imgName, canvasWidth, dataType) { 

    const bgColors = datas.bgColors;
    const data = datas.counts;
    const labels = datas.labels;

    const canvas = createCanvas(canvasWidth, 246);
    const ctx = canvas.getContext('2d');
    
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
        data: {
            labels: labels,
            datasets: [{
                label: imgName,
                data: data,
                backgroundColor: bgColors,
                borderColor: datas.borderColors,
                borderWidth: 2
            }]
        },
        options: options
    }); 

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(`create/charts/${dataType}/${imgName}.png`, buffer);
    console.log(`${imgName} image created successfully.`);
}

module.exports = makeBarChart;
const fs = require('fs');
const { createCanvas } = require('canvas');
const Chart = require('chart.js/auto');


function makeRadarChart(statsData, imgName, canvasWidth) {
    const canvas = createCanvas(canvasWidth, 246);
    const ctx = canvas.getContext('2d');

    const tagCounts = statsData.tagCounts.slice(0, 10);


    const labels = tagCounts.map(tag => tag.tag);
    const occurrences = tagCounts.map(tag => tag.occurrences);

    let installments = tagCounts.map(tag => tag.installment);

    // Normalizing installment values.
    const maxOccurrences = Math.max(...occurrences);

    const maxInstallments = Math.max(...installments);

    const normalizedInstallments = installments.map((installment, index) => {
        return installment / occurrences[index];
    });

    const scaleFactor = maxOccurrences / maxInstallments;
    installments = normalizedInstallments.map((installment, index) => {
        return installment * scaleFactor * occurrences[index];
    });



    Chart.defaults.font.family = 'Mulish';


    let secondLabelName;

     if (statsData.dataType == "manga") {
        secondLabelName = "Chapters";
     } else {
        secondLabelName = "Episodes";
     }

    const data = {
        labels: labels,
        datasets: [{
            label: 'Occurrences',
            data: occurrences,
            backgroundColor: 'rgba(255, 99, 132, 0.2)', 
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 2,
        },
        {
            label: secondLabelName,
            data: installments,
            backgroundColor: 'rgba(54, 162, 235, 0.2)', 
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 2,
        }]
    };

    const options = {
        responsive: false,
        animation: false,
        scales: {
            r: {
                min: 0,
                max: Math.max(...occurrences), 
                ticks: {
                    backdropColor: 'rgba(255, 255, 255, 0)',
                    //stepSize: 5000 
                    display: false
                    
                },
                grid: {
                    color: 'rgba(255, 255, 255, 1)'
                }
            }
        },
    };

    const chart = new Chart(ctx, {
        type: 'radar', 
        data: data,
        options: options
    });

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(`create/charts/${statsData.dataType}/${imgName}Radar.png`, buffer);
    console.log(`${imgName} image created successfully.`);
}

module.exports = makeRadarChart;
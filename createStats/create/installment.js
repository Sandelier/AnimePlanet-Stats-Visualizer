const fs = require('fs');
const { createCanvas } = require('canvas');


function calcEstimatedTime(chapterCount, averageChaptersPerDay, targetNumber) {
    const remainingChapters = targetNumber - chapterCount;

    const daysNeeded = remainingChapters / averageChaptersPerDay;

    if (daysNeeded >= 365) {
        return `${(daysNeeded / 365).toFixed(1)}y`;
    } else if (daysNeeded >= 30) {
        return `${(daysNeeded / 30).toFixed(1)}mo`;
    } else if (daysNeeded >= 1) {
        return `${daysNeeded.toFixed(1)}d`;
    } else {
        return `${(daysNeeded * 24).toFixed(1)}h`;
    }
}

// Might have to think of some better steps but for now i think it looks good.
function roundNumber(num) {
    if (num < 10000) {
        return Math.ceil(num / 5000) * 5000;
    }
    
    else if (num < 100000) {
        return Math.ceil(num / 50000) * 50000;
    }
    
    else {
        return Math.ceil(num / 500000) * 500000;
    }
}

function generateTicks(tickLimit, targetNumber) {
    let ticks = [];
    
    const increment = targetNumber / tickLimit;
    
    ticks.push(0);
    
    for (let i = 1; i < tickLimit; i++) {
        const previousValue = ticks[i - 1];
        const nextValue = previousValue + increment;
        ticks.push(nextValue);
    }
    
    ticks.push(targetNumber);
    
    return ticks;
}

function makeinstallmentImage(statsData) {
    const canvas = createCanvas(1050, 170);
    const ctx = canvas.getContext('2d');


    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Background.

    ctx.fillStyle = '#282828'; 
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Drawing the progress bar.

    const progressBarTotalWidth = 600;
    const progressBarHeight = 16;

    const chapterPercentage = statsData.chapterCount / roundNumber(statsData.chapterCount);
    const progressWidth = progressBarTotalWidth * chapterPercentage;

    const progressBarY = (canvasHeight - progressBarHeight) / 2;

    const progressBarX = (canvasWidth - progressBarTotalWidth) / 2;

    let roundness = 8;

    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.roundRect(progressBarX, progressBarY, progressBarTotalWidth, progressBarHeight, [roundness, roundness, roundness, roundness]);
    ctx.fill();

    // Red
    ctx.fillStyle = '#d93d48';
    ctx.beginPath();
    ctx.roundRect(progressBarX, progressBarY, progressWidth, progressBarHeight, [roundness, roundness, roundness, roundness]);
    ctx.fill();

    // Progress bar ticks.

    const ticksArray = generateTicks(10, roundNumber(statsData.chapterCount));
    const tickLocY = progressBarY + progressBarHeight + 25;

    ticksArray.forEach(tick => {
        const percentage = (tick / roundNumber(statsData.chapterCount)) * 100;
        let tickText = tick.toString();
        if (tick >= 1000 && tick < 1000000) {
            tickText = (tick / 1000).toFixed(0) + 'k';
        } else if (tick >= 1000000) {
            tickText = (tick / 1000000).toFixed(0) + 'm';
        }
    
        const textWidth = ctx.measureText(tickText).width;
    
        const tickLocX = (percentage / 100) * progressBarTotalWidth - textWidth / 2 + progressBarX;

        ctx.font = '15px Mulish';
        ctx.fillStyle = '#FFFFFF'; 
        ctx.fillText(tickText, tickLocX, tickLocY);



        ctx.beginPath();

        // https://stackoverflow.com/a/45789011
        const tickHeight = ctx.measureText(tickText).actualBoundingBoxAscent + ctx.measureText(tickText).actualBoundingBoxDescent;

        ctx.moveTo((percentage / 100) * progressBarTotalWidth + progressBarX, tickLocY - tickHeight);

        ctx.lineTo((percentage / 100) * progressBarTotalWidth + progressBarX, (progressBarY + progressBarHeight));

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';

        ctx.lineWidth = 1;

        ctx.stroke();
    });



    // Drawing the estimated time.
    const estText = `est. ${calcEstimatedTime(statsData.chapterCount, statsData.averageChaptersPerDay, roundNumber(statsData.chapterCount))}`;
    const estTextX = (progressBarTotalWidth + canvasWidth) / 2 + 25;
    const estTextY = progressBarY + progressBarHeight - 4; 

    ctx.fillStyle = '#FFFFFF'; 
    ctx.font = '15px Mulish';
    ctx.fillText(estText, estTextX, estTextY);

    // Top text Chapters Read

    let topText = 'Chapters Read';
    let bottomText = `Avg. ${statsData.averageChaptersPerDay} ch per day`;

    if (statsData.dataType == "anime") {
        topText = 'Episodes watched';
        bottomText = `Avg. ${statsData.averageChaptersPerDay} ep per day`;
    }


    
    ctx.font = '25px Oswald';

    const topTextWidth = ctx.measureText(topText).width; 
    const topTextX = (canvasWidth - topTextWidth) / 2;
    const topTextY = progressBarY + progressBarHeight - 40;

    ctx.fillStyle = '#FFFFFF'; 
    ctx.fillText(topText, topTextX, topTextY);

    // Bottom text avg ch per day

    ctx.font = '15px Mulish';

    const bottomTextWidth = ctx.measureText(bottomText).width; 
    const bottomTextX = (canvasWidth - bottomTextWidth) / 2;
    const bottomTextY = progressBarY + progressBarHeight + 60;

    ctx.fillStyle = '#FFFFFF'; 
    ctx.fillText(bottomText, bottomTextX, bottomTextY);


    const buffer = canvas.toBuffer('image/png');

    if (statsData.dataType == "anime") {
        topText = 'Episodes watched';
        bottomText = `Avg. ${statsData.averageChaptersPerDay} ep per day`;
    }

    let imageName;
    if (statsData.dataType == "manga") {
        imageName = "chaptersRead";
    } else {
        imageName = "episodesWatched";
    }

    fs.writeFileSync(`create/charts/${statsData.dataType}/${imageName}.png`, buffer);
    console.log(`Chapters read image created successfully.`);
}

module.exports = makeinstallmentImage;
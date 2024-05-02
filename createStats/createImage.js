
const fs = require('fs');

const makeChaptersReadImage = require('./create/chaptersRead.js');
const makeDoughnutChart = require('./create/makeDoughnutChart.js');
const makeBarChart = require('./create/makeBarChart.js');


function createImage(statsData) {
    makeBarChart(statsData, "favoriteTags", 1050);
    makeBarChart(statsData, "releaseYears", 510);
    makeDoughnutChart(statsData, "typesImage");
    makeDoughnutChart(statsData, "sourcesImage");
    makeChaptersReadImage(statsData);
}

module.exports = createImage;
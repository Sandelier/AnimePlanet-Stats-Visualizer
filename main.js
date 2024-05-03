const readline = require('readline');
const extractData = require('./scrapeData.js');
const processData = require('./createStats/statsProcessing.js');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


console.clear();

console.log('\nAnimePlanet-Stats-Visualizer');
console.log('The program is in progress but hopefully you still enjoy it :p \n');

rl.question('Enter your animeplanet username: ', async (username) => {
  try {
    console.log('Starting to scrape.');
    await extractData(username);

    console.log("Processing data...");
    processData();

    rl.close();
  } catch (error) {
    console.error('An error occurred:', error);
    rl.close();
  }
});
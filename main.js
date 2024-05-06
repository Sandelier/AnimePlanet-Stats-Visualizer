const readline = require('readline');
const fs = require('fs');
const extractData = require('./scrapeData.js');
const processData = require('./createStats/statsProcessing.js');

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});


console.clear();

console.log('\nAnimePlanet-Stats-Visualizer');
console.log('The program is in progress but hopefully you still enjoy it :p \n');

rl.question('Enter your username: ', (username) => {
    askType();

    function askType() {
        rl.question('Type "anime" or "manga": ', async (type) => {
            if (type.toLowerCase() === 'anime' || type.toLowerCase() === 'manga') {
                askSkipScraping(type);
            } else {
                console.log('Invalid input. Type "anime" or "manga".');
                askType();
            }
        });
    }

    function askSkipScraping(type) {
        rl.question('Do you want to skip scraping? (y/n): ', async (skip) => {
            try {
				const skipScraping = skip.toLowerCase() === 'y' ? true : false;

				
				if (skipScraping) {
                    const jsonData = fs.readFileSync('dataJson.json', 'utf8');
                    if (jsonData) {
                        const parsedData = JSON.parse(jsonData);
                        if (parsedData.length > 0) {
                            const dataType = parsedData[0].dataType;
                            if (dataType !== type.toLowerCase()) {
                                throw new Error(`Data type in JSON (${dataType}) doesn't match the provided type (${type.toLowerCase()}).`);
                            }
                        }
                    }
                }

                console.log('Starting to scrape.');
                await extractData(username, type, skipScraping);

                console.log("Processing data...");
                processData();

                rl.close();
            } catch (error) {
                console.error('An error occurred:', error);
                rl.close();
            }
        });
    }
});
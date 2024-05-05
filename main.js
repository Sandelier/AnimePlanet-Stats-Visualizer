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

rl.question('Enter your username: ', (username) => {

	askType();

	function askType() {
		rl.question('Type "anime" or "manga": ', async (type) => {
			if (type.toLowerCase() === 'anime' || type.toLowerCase() === 'manga') {
				try {
					console.log('Starting to scrape.');
					await extractData(username, type);

					console.log("Processing data...");
					processData();

					rl.close();
				} catch (error) {
					console.error('An error occurred:', error);
					rl.close();
				}
			} else {
				console.log('Invalid input. Type "anime" or "manga".');
				askType();
			}
		});
	}
});
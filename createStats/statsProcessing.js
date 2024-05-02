const fs = require('fs');
const createImage = require('./createImage');

fs.readFile('../dataJson.json', 'utf8', (err, data) => {
	if (err) {
		console.error('Error reading file:', err);
		return;
	}

	try {
		const jsonData = JSON.parse(data);
		let chapterCount = 0;
		let volumeCount = 0;
		const totalEntries = jsonData.length;
		let tagCounts = {};
		let yearCounts = {};
		let serializerCount = {};
		let statusCounts = {};
		let sources = {};
		let accountJoinDate;

		let types = {
			"Light Novels": 0,
			"Web Novels": 0,
			"Manhua": 0,
			"Manhwa": 0,
			"Manga": 0,
			"Chinese Novels": 0,
			"Korean Novels": 0,
			"Novels": 0
		};


		jsonData.forEach(entry => {

			if (entry.joinedDate) {
				accountJoinDate = parseDate(entry.joinedDate);
				return;
			}

			// Chapters
			if (entry.isChapter === true) {
				chapterCount += parseInt(entry.chaptersRead);
			} else {
				volumeCount += parseInt(entry.chaptersRead);
			}

			// Tags
			const tags = entry.tags;
			let isBasedOnSomething = false;
			let isTypeFound = false;

			tags.forEach(tag => {
				// Have to figure out something for volumes since this also calculates volume.
				if (!tagCounts[tag]) {
					tagCounts[tag] = {
						chaptersRead: 0,
						count: 0
					};
				}

				tagCounts[tag].chaptersRead += parseInt(entry.chaptersRead);
				tagCounts[tag].count++;

				// Sources
				if (tag.startsWith("Based on a")) {
					isBasedOnSomething = true;
					if (!sources[tag]) {
						sources[tag] = 0;
					}
					sources[tag]++;

					delete tagCounts[tag];
				}

				// Types
				if (tag in types) {
					types[tag]++;
					isTypeFound = true;

					delete tagCounts[tag];
				}
			});

			// If not based on something we will count it as orginal.
			if (!isBasedOnSomething) {
				if (!sources["Original"]) {
					sources["Original"] = 0;
				}
				sources["Original"]++;
			}

			// If no type found we will count it as manga
			if (!isTypeFound) {
				types["Manga"]++;
			}

			// year
			const year = entry.year;
			if (year) {
				if (!yearCounts[year]) {
					yearCounts[year] = 0;
				}
				yearCounts[year]++;
			}

			// serializer
			const serializer = entry.serializer;
			if (serializer) {
				if (!serializerCount[serializer]) {
					serializerCount[serializer] = 0;
				}
				serializerCount[serializer]++;
			}

			// Status
			const status = entry.status;
			if (status) {
				if (!statusCounts[status]) {
					statusCounts[status] = 0;
				}
				statusCounts[status]++;
			}
		});

		// Tag and year and serializer rearraigment.
		const tagCountsArray = Object.entries(tagCounts).map(([tag, data]) => ({
			tag,
			chaptersRead: data.chaptersRead,
			occurrences: data.count
		}));

		tagCountsArray.sort((a, b) => b.occurrences - a.occurrences);

		const yearCountsArray = processCounts(yearCounts);
		const serializerCountsArray = processCounts(serializerCount);
		const typesCountArray = processCounts(types);

		const statusPercentages = calculateCountsAndPercentages(statusCounts, totalEntries);

		const sourcePercentages = calculateCountsAndPercentages(sources, totalEntries);


		// average chapters per day
		const currentDate = new Date();
		const daysElapsed = differenceInDays(accountJoinDate, currentDate);
		const averageChaptersPerDay = (chapterCount / daysElapsed).toFixed(2);


		// Time taken to read.

		// Modify this to what you think you will take to read per chapter in average. 
		// Animeplanet calculation is something like 5 minute per chapter which is way too long for me atleast.
		// Volume calculation is pretty tough since every manga has so different amounth of chapters per volume.

		const minutesPerChapter = 1.2; 
		//const minutesPerVolume = minutesPerChapter * 5; 

		const timeTakenForChapters = chapterCount * minutesPerChapter;
		//const timeTakenForVolumes = volumeCount * minutesPerVolume;

		//const timeTaken = timeTakenForChapters + timeTakenForVolumes;
		const timeTaken = timeTakenForChapters;



		const statsData = {
			totalEntries: totalEntries,
			chapterCount: chapterCount,
			volumeCount: volumeCount,
			tagCounts: tagCountsArray,
			yearCounts: yearCountsArray,
			serializerCounts: serializerCountsArray,
			typesCounts: typesCountArray,
			statusPercentages: statusPercentages,
			sourcePercentages: sourcePercentages,
			averageChaptersPerDay: averageChaptersPerDay,
			timeTaken: {
				minutes: timeTaken,
				//calculation: {
				//	ch: minutesPerChapter,
				//	vol: minutesPerVolume
				//}
			}
		};

		createImage(statsData);

	} catch (error) {
		console.error('Error parsing JSON:', error);
	}
});


function processCounts(counts) {
	return Object.entries(counts)
		.map(([key, value]) => ({
			[key]: value
		}))
		.sort((a, b) => Object.values(b)[0] - Object.values(a)[0]);
}

function calculateCountsAndPercentages(data, totalObjects) {
	const keys = Object.keys(data);
	const sortedKeys = keys.sort((a, b) => data[b] - data[a]);

	const sortedData = {};
	sortedKeys.forEach(key => {
		const count = data[key];
		const percentage = (count / totalObjects) * 100;
		sortedData[key] = {
			count,
			percentage: percentage.toFixed(2)
		};
	});

	return sortedData;
}


// Used for average chapters per day.
function differenceInDays(date1, date2) {
	const diffInTime = date2.getTime() - date1.getTime();
	const diffInDays = diffInTime / (1000 * 3600 * 24);
	return Math.round(diffInDays);
}


function parseDate(dateString) {

	const monthAbbreviations = [
		"Jan", "Feb", "Mar", "Apr", "May", "Jun",
		"Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
	];

	var parts = dateString.split(' ');
	var month = parts[0];
	var day = parseInt(parts[1].replace(',', ''));
	var year = parseInt(parts[2]);
	return new Date(year, monthAbbreviations.indexOf(month), day);
}
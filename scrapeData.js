const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const https = require('https');

async function fetchHTML(url, filePath) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(url);

    const totalPages = await page.$$eval('ul.nav li:not(.prev):not(.next)', elements => elements.length); 


    let currentPage = 1;
    let combinedHTML = '';

    // userStats is used for getting joining date.
    const userStatsHTML = await page.$eval('ul.userStats li', element => element.outerHTML);
    combinedHTML += userStatsHTML;

    
    // Downloading the image
    const imageSrc = await page.$eval('img#user-avatar', element => element.src);
    const imageNameWithQuery = path.basename(imageSrc);
    const imageName = imageNameWithQuery.split('?')[0];

    userAvatarImage = imageName;

    const imagePath = path.join(__dirname, 'createStats', 'create', 'images', imageName);
    const imageWriter = fs.createWriteStream(imagePath);

    const request = https.get(imageSrc, response => {
        response.pipe(imageWriter);
        response.on('end', () => {
            console.log('Image downloaded successfully');
        });
    });


    while (true) {
        await page.waitForSelector(`ul.nav li.selected`);
        const selectedPage = await page.$eval('ul.nav li.selected', element => element.textContent.trim());

        if (parseInt(selectedPage) === currentPage) {
            const childrenHTML = await page.$eval('ul.cardDeck.cardGrid', element => {
                return Array.from(element.children).map(child => child.outerHTML).join('');
            });
            combinedHTML += childrenHTML;
            if (currentPage === totalPages) break;
        }

        await page.waitForSelector('ul.nav li.next');
        const nextButton = await page.$('ul.nav li.next a');
        if (!nextButton) break;

        await page.click('ul.nav li.next a');
        currentPage++;
    }

    await browser.close();

    fs.writeFileSync(filePath, combinedHTML);

    return filePath;
}

async function extractDataFromFile(filePath) {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(fileContents);

    const tooltipElements = $('li.card');
    const jsonData = [];

    
    let joinedDate = '';

    const joinedElement = $('li:contains("Joined")');
    if (joinedElement.length > 0) {
        joinedDate = joinedElement.text().trim().replace('Joined ', '');
    }


    tooltipElements.each((index, element) => {
        const title = $(element).find('a.tooltip').attr('title');
        const doc = cheerio.load(title);

        const yearElement = doc('.iconYear');
        const tagsElements = doc('.tags li');
        const chaptersElement = doc('.iconVol');
        const serializerElement = chaptersElement.next().attr('class') ? null : chaptersElement.next().text().trim();

        if (serializerElement == "1985") {
            console.log(chaptersElement.parent().html());
        }
        
        const status1Element = doc('.myListBar .status1');
        let chaptersRead;

        // if its read state we can get the chapters straight from the total chapters.
        if (status1Element.length > 0) {
            chaptersRead = chaptersElement.text().trim();
        } else {
            const statusElements = ['status2', 'status5', 'status3'];
            for (const status of statusElements) {

                const statusElement = doc(`.myListBar .${status}`);

                if (statusElement.length > 0) {

                    // had to filter out everything expect text nodes since it was retrieving the rating also.
                    chaptersRead = statusElement.parent().contents().filter(function() {
                        return this.nodeType === 3;
                    }).text().trim().split(' - ')[1];

                    break;
                }
            }
        }

        // Well for now atleast we dont need any that dosent have chapters.
        if (chaptersRead == null || chaptersRead == undefined) {
            return;
        }

        // If its one shot.
        if (chaptersRead.toLowerCase().includes('one')) {
            chaptersRead = "1 chs";
        }


        let isChapter = false;
        if (chaptersRead) {
            const numbers = chaptersRead.match(/\d+/g);
            let chapters = 0;

            if (chaptersRead.includes('Vol:') && chaptersRead.includes('Ch:')) {
                chapters = parseInt(numbers[1]);
                isChapter = true;
            } else if (chaptersRead.includes('chs')) {
                chapters = parseInt(numbers[0]);
                isChapter = true;
            } else if (chaptersRead.includes('vols')) {
                chapters = parseInt(numbers[0]);
                isChapter = false;
            } else if (chaptersRead.includes('Vol:')) {
                chapters = parseInt(numbers[0]);
                isChapter = false;
            } else if (chaptersRead.includes('Ch:')) {
                chapters = parseInt(numbers[0]);
                isChapter = true;
            }

            chaptersRead = chapters.toString();
        }

        const year = yearElement.text().trim().split(' - ')[0];
        
        const tags = tagsElements.toArray().map(tag => $(tag).text().trim());



        let statusElement = doc('.myListBar').find('[class*=status]');

        let status;
        if (statusElement.length > 0) {
            status = statusElement.attr('class').split(' ').find(className => className.includes('status'));
        }

        // Creating JSON object
        const jsonObject = {
            year: year !== '' ? year : undefined,
            tags: tags.length > 0 ? tags : undefined,
            serializer: serializerElement !== null ? serializerElement : undefined,
            status: status,
            chaptersRead: chaptersRead !== '' ? chaptersRead : undefined,
            isChapter: isChapter
        };

        jsonData.push(jsonObject);
    });

    jsonData.unshift({ joinedDate, username, userAvatarImage });

    return jsonData;
}

let userAvatarImage = '';
const username = "Sandelier"
const url = `https://www.anime-planet.com/users/${username}/manga?per_page=560`;
const filePath = 'output.html';

fetchHTML(url, filePath)
   .then(async (savedFilePath) => {
       console.log('HTML data saved to:', savedFilePath);
       const extractedData = await extractDataFromFile(savedFilePath);
       const jsonData = JSON.stringify(extractedData, null, 2);
       fs.writeFileSync('dataJson.json', jsonData);
       console.log('JSON data saved to dataJson.json');
   })
   .catch(error => {
       console.error('Error fetching HTML:', error);
   });


//extractDataFromFile(filePath)
//    .then(async (extractedData) => {
//        const jsonData = JSON.stringify(extractedData, null, 2);
//        fs.writeFileSync('dataJson.json', jsonData);
//        console.log('JSON data saved to dataJson.json');
//    })
//    .catch(error => {
//        console.error('Error fetching HTML:', error);
//    });
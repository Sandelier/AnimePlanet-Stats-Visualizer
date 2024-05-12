const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const https = require('https');

async function fetchHTML(url, filePath) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(url);

    const currentURL = page.url();

    if (currentURL.startsWith("https://www.anime-planet.com/search.php?")) {
        await browser.close();
        throw new Error(`Unknown username. ${username}`);
    }

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

    const imagesFolderPath = path.join(__dirname, 'createStats', 'create', 'charts');

    if (!fs.existsSync(imagesFolderPath)) {
        fs.mkdirSync(imagesFolderPath, { recursive: true });
    }

    const imagePath = path.join(imagesFolderPath, imageName);
    const imageWriter = fs.createWriteStream(imagePath);

    const request = https.get(imageSrc, response => {
        response.pipe(imageWriter);
        response.on('end', () => {
            console.log('Image downloaded successfully');
        });
    });


    while (true) {
        try {
            await page.waitForSelector(`ul.nav li.selected`, { timeout: 1000 });
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

        } catch (error) {
            // Just an quick fix for now when the list dosent have an next page.
            const childrenHTML = await page.$eval('ul.cardDeck.cardGrid', element => {
                return Array.from(element.children).map(child => child.outerHTML).join('');
            });
            combinedHTML += childrenHTML;
            break;
        }
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

        let chaptersElement;

        if (dataType == "anime") {
            chaptersElement = doc('.type');
        } else {
            chaptersElement = doc('.iconVol');
        }
        const serializerElement = chaptersElement.next().attr('class') ? null : chaptersElement.next().text().trim();

        const rating = doc('.entryBar .ttRating').text().trim();
        const userRating = doc('.myListBar .ttRating').text().trim();
        
        const status1Element = doc('.myListBar .status1');
        let installment;

        let type;


        // if its read state we can get the chapters straight from the total chapters.
        if (status1Element.length > 0) {

            if (dataType == "anime") {
                const typeAndEp = chaptersElement.text();

                const regex = /(\d+)\s*(?:eps|ep|episodes?)/i;
    
                const match = regex.exec(typeAndEp);

                installment = parseInt(match[1], 10); 
                type = typeAndEp.split('(')[0].trim();

            } else {
                installment = chaptersElement.text().trim();
            }
        } else {
            const statusElements = ['status2', 'status5', 'status3'];
            for (const status of statusElements) {

                const statusElement = doc(`.myListBar .${status}`);

                if (statusElement.length > 0) {
                    // had to filter out everything expect text nodes since it was retrieving the rating also.
                    installment = statusElement.parent().contents().filter(function() {
                        return this.nodeType === 3;
                    }).text().trim().split(' - ')[1];

                    if (dataType == "anime" && installment != undefined) {
                        installment = installment.split("/")[0];
                    }

                    break;
                }
            }
        }

        // Well for now atleast we dont need any that dosent have chapters.
        if (installment == null || installment == undefined) {
            return;
        }

        // If its one shot.
        if (dataType == "manga" && installment.toLowerCase().includes('one')) {
            installment = "1 chs";
        }


        let isChapter = false;
        if (installment && dataType == "manga") {
            const numbers = installment.match(/\d+/g);
            let chapters = 0;

            if (installment.includes('Vol:') && installment.includes('Ch:')) {
                chapters = parseInt(numbers[1]);
                isChapter = true;
            } else if (installment.includes('chs')) {
                chapters = parseInt(numbers[0]);
                isChapter = true;
            } else if (installment.includes('vols')) {
                chapters = parseInt(numbers[0]);
                isChapter = false;
            } else if (installment.includes('Vol:')) {
                chapters = parseInt(numbers[0]);
                isChapter = false;
            } else if (installment.includes('Ch:')) {
                chapters = parseInt(numbers[0]);
                isChapter = true;
            }

            installment = chapters.toString();
        } else if (dataType == "anime") {
            // just for now. gonna change it later on.
            isChapter = true;
        }

        const year = yearElement.text().trim().split(' - ')[0];
        
        const tags = tagsElements.toArray().map(tag => $(tag).text().trim());



        let statusElement = doc('.myListBar').find('[class*=status]');

        let status;
        if (statusElement.length > 0) {
            status = statusElement.attr('class').split(' ').find(className => className.includes('status'));
        }

        const jsonObject = {
            year: year !== '' ? year : undefined,
            tags: tags.length > 0 ? tags : undefined,
            serializer: serializerElement !== null ? serializerElement : undefined,
            rating: rating !== '' ? rating : undefined,
            userRating: userRating !== '' ? userRating : undefined,
            status: status,
            installment: installment !== '' ? installment : undefined,
            isChapter: isChapter,
            type: type !== '' ? type : undefined,
        };

        jsonData.push(jsonObject);
    });


    jsonData.unshift({ joinedDate, username, userAvatarImage, dataType });

    return jsonData;
}

let userAvatarImage = '';
let username;
let url;
let dataType;
const filePath = 'output.html';

async function extractData(user, type, skipScraping = false) {
    username = user;
    dataType = type;
    url = `https://www.anime-planet.com/users/${username}/${dataType}?per_page=560`;

    if (username.length < 1) {
        throw Error('Invalid username.');
    }

    try {

        let savedFilePath = "output.html"
        if (skipScraping == false) {
            savedFilePath = await fetchHTML(url, filePath);
            console.log('HTML data saved to:', savedFilePath);
        }

        const extractedData = await extractDataFromFile(savedFilePath);
        const jsonData = JSON.stringify(extractedData, null, 2);
        fs.writeFileSync('dataJson.json', jsonData);
        console.log('JSON data saved to dataJson.json');
    } catch (error) {
        throw Error(error);
    }
};


module.exports = extractData;
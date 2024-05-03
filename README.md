

# AnimePlanet Stats Visualizer
Well, I wanted to get some statistics on the different mangas that I have read, and since animeplanet does not really give you any statistics, I made some that were easily available. I made it with manga in mind, but maybe later on I could make it work with anime as well.

If you find this project useful, it would be appreciated if you added the github project somewhere in the bio if you decide to use some of the graphs in your bio.

## Usage
To use the program, you need to first download all the dependencies, and then you can run the "main.js" file that is in the root directory, which will go and scrape all the data from mangas that are in your profile. When you're done with that, it goes and makes the graphs into "createStats/create/images.".

To change the colors of each block, you would have to modify the codes in "chaptersRead.js,"  "makeBarChart.js," or "makeDoughnutChart.js" yourself. I am thinking of making a setting file where you can easily set options to your liking.

## Important

If you want to use the same fonts as AnimePlanet uses, then you need to install the fonts located in `creteStats/create/fonts.rar` into your computer. And well, the reason why you need to do it this way is because it seems the "node-canvas" can't seem to be able to use the "registerFont" method; instead, it's only able to find the font if it's installed on the machine.

## Dependencies

- **npm install canvas**
- **npm install chart.js**
- **npm install chartjs-plugin-datalabels**
- **npm install cheerio**
- **npm install jsdom**
- **npm install puppeteer**


## Tested on

- **Node.js - v20.3.1**
- **canvas - v2.11.2**
- **chart.js - v4.4.2**
- **chartjs-plugin-datalabels - v2.2.0**
- **cheerio - v1.0.0-rc.12**
- **jsdom - v24.0.0**
- **puppeteer - v22.7.1**


## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

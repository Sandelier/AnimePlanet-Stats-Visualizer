
# AnimePlanet Stats Visualizer
Well, I wanted to get some statistics on the different mangas that I have read, and since animeplanet does not really give you any statistics, I made some that were easily available.

If you find this project useful and you added graphs to your bio, it would be appreciated if you added the github repository link somewhere in your bio. It's not a must tho.

![Showcase](showcase/showcase1.png)

## Limitations
The program only gets the information of each manga from the toolbar that is shown, so basically the serializer, tags, chapters, status, and date since to receive more information like the number of total reads of individual manga or authors, etc, are only available on the manga's own page and are not loaded on the manga's own page and are not loaded in your manga list, which means it would take a lot longer to retrieve the data of each manga + there would be rate-limiting problems, and anyway, I wouldn't really want to do it since it could negatively affect animeplanet.

## Usage
To use the program, you need to first download all the dependencies, and then you can run the "main.js" file that is in the root directory, which will go and scrape all the data from mangas that are in your profile. When you're done with that, it goes and makes the graphs into "createStats/create/images".

To change the colors of each block, you would have to modify the codes in "installment.js",  "makeBarChart.js", or "makeDoughnutChart.js" yourself. I am thinking of making a setting file where you can easily set options to your liking.

If you want to use the graphs on your animeplanet bio, then you need to upload the images to some image-sharing website, for example, Imgur.
If you want to make it so that you don't need to update your animeplanet bio every time with a new link, you would have to use a service that keeps the same link to the image even if you modify it.

## Important

If you want to use the same fonts as AnimePlanet uses, then you need to install the fonts located in `createStats/create/fonts.rar` into your computer. And well, the reason why you need to do it this way is because it seems the "node-canvas" can't seem to be able to use the "registerFont" method instead, it's only able to find the font if it's installed on the machine.

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

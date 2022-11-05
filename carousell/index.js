require('dotenv').config()
const puppeteer = require("puppeteer-core")
const chromium = require("@sparticuz/chromium")
const axios = require('axios')
// const fs = require('fs')
// const utils = require('../utils')
const s3 = require('../aws/s3')

let searchSize = 30


exports.getTokens = async () => {
    let csrfToken = ""
    let cookie = ""
    const browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
    });

    try {
        const page = await browser.newPage();

        await page.setViewport({ width: 1280, height: 720 });

        // Block images, videos, fonts from downloading
        await page.setRequestInterception(true);
        page.on('request', (interceptedRequest) => {
            const blockResources = ['stylesheet', 'image', 'media', 'font'];
            if (blockResources.includes(interceptedRequest.resourceType())) {
                interceptedRequest.abort();
            } else {
                if (interceptedRequest.headers()['csrf-token']) {
                    const headers = interceptedRequest.headers()
                    csrfToken = headers['csrf-token']
                    cookie = headers['cookie']
                }
                interceptedRequest.continue();
            }
        });
        await page.setUserAgent(
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36'
        );
        await page.goto('https://www.carousell.com/', { timeout: 0 });

    } catch (err) {
        console.error(err.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }

    return {
        csrfToken: csrfToken,
        cookie: cookie,
    };
};

exports.getListings = async (tokens, chatId, search) => {

    let filters = [{
        fieldName: "price",
    }]
    let prefill = {
        "prefill_sort_by": "3"
    }
    let jsonData = {}

    const searchString = search.searchString
    const fileName = chatId + "_" + searchString + ".json"
    const path = "data/" + fileName
    const params = {
        Bucket: 'carousell-scraper-bucket',
        Key: path
    };

    jsonData = await s3.readFile(params)
    // jsonData = utils.readData(fileName)

    if (search.priceRange) {
        const min = search.priceRange.min ? search.priceRange.min : null
        const max = search.priceRange.max ? search.priceRange.max : null
        const rangedFloat = {}
        if (min) {
            rangedFloat['start'] = { value: min }
            prefill['prefill_price_start'] = min
        }
        if (max) {
            rangedFloat['end'] = { value: max }
            prefill['prefill_price_end'] = max
        }
        filters[0][rangedFloat] = rangedFloat
    }

    const options = {
        method: 'POST',
        url: 'https://www.carousell.sg/ds/filter/cf/4.0/search/',
        params: { _path: '/cf/4.0/search/' },
        headers: {
            'content-type': 'application/json',
            'csrf-token': tokens.csrfToken,
            'Cookie': tokens.cookie,
        },
        data: {
            bestMatchEnabled: true,
            canChangeKeyword: true,
            count: searchSize,
            countryCode: 'SG',
            countryId: '1880251',
            filters: filters,
            includeEducationBanner: true,
            includeSuggestions: true,
            locale: 'en',
            prefill: prefill,
            query: searchString,
            sortParam: {
                fieldName: '3'
            }
        }
    };


    return await axios.request(options).then(async (res) => {
        let data = res.data.data.results
        const processedData = processListings(jsonData, data)
        const params = {
            Bucket: 'carousell-scraper-bucket',
            Key: path,
            Body: JSON.stringify(processedData.updatedJsonData),
            ContentEncoding: 'base64',
            ContentType: 'application/json',
        };
        await s3.writeFile(params)
        return processedData.result
    }).catch((err) => {
        console.log("in catch")
        console.error(err.message);
        return []
    });


}

const processListings = (jsonData, data) => {
    const updatedJsonData = jsonData
    const result = []
    for (const listing of data) {
        const listingCard = listing.listingCard
        const id = listingCard.id
        const title = listingCard.title
        const price = listingCard.price
        let epoch = listingCard.aboveFold[0].timestampContent.seconds.low
        let date = new Date(1970)
        date.setSeconds(epoch + 28800)
        date = date.toUTCString()
        if (!(id in jsonData)) {
            console.log("Not found: " + id)
            result.push({
                id: id,
                title: title,
                price: price,
                date: date,
                url: "https://www.carousell.sg/p/" + id
            })
            updatedJsonData[id] = 0
        }
    }
    return { result: result, updatedJsonData: updatedJsonData }
}
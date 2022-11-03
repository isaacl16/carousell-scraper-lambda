const carousell = require('./carousell');
const messaging = require('./messaging');
const async = require('async');
const aws = require('./aws/s3')

const params = {
    Bucket: "carousell-scraper-bucket",
    Key: "config.json"
};

exports.handler = async function (event) {
    const usersConfig = await aws.readFile(params)
    const tokens = await carousell.getTokens();
    const searchCollection = []
    console.log("Users config: " + usersConfig)
    for (user of usersConfig) {
        const chatId = user.chatId
        for (search of user.searchList) {
            const searchObject = search
            searchObject["chatId"] = chatId
            searchCollection.push(searchObject)
        }
    }
    await async.forEach(searchCollection, async (search, callback) => {
        const chatId = search.chatId
        const listings = await carousell.getListings(tokens, chatId, search);
        if (listings.length > 0) {
            console.log(listings)
            await messaging.telegram(listings, chatId)
        }
    }).then(() => {
        console.log("All tasks complete!")
    }).catch((err) => {
        console.log(err)
    })
}

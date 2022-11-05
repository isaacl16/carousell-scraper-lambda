const carousell = require('./carousell');
const messaging = require('./messaging');
const async = require('async');
const s3 = require('./aws/s3')
const ssm = require('./aws/ssm')

const params = {
    Bucket: "carousell-scraper-bucket",
    Key: "config.json"
};

exports.handler = async function (event) {
    const usersConfig = await s3.readFile(params)
    const telebotToken = await ssm.fetchParameterStore()
    if (usersConfig && telebotToken) {
        const carousellTokens = await carousell.getTokens();
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
            const listings = await carousell.getListings(carousellTokens, chatId, search);
            if (listings.length > 0) {
                console.log(listings)
                await messaging.telegram(listings, chatId, telebotToken)
            }
        }).then(() => {
            console.log("All tasks complete!")
        }).catch((err) => {
            console.log(err)
        })
    }
}


const TelegramBot = require('node-telegram-bot-api')

exports.telegram = async (data, chatId, token) => {
    const listings = data
    const bot = new TelegramBot(token)
    console.log("Sending to telegram chatId: " + chatId)
    for (const listing of listings) {
        await bot.sendMessage(chatId, listing.title + '\n' + listing.price + "\n" + listing.date + "\n" + listing.url).then(() => {
            console.log("Sent: " + listing.id)
        }).catch((err) => {
            console.error(err)
        })
    }
    console.log("Sending complete: " + chatId)

}
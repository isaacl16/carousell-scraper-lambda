const TelegramBot = require('node-telegram-bot-api')
const token = process.env.TELEGRAM_BOT_TOKEN


exports.telegram = async (data, chatId) => {
    const listings = data
    const bot = new TelegramBot(token)
    console.log("Sending to telegram chatId: " + chatId)
    for (const listing of listings) {
        await bot.sendMessage(chatId, listing.title + '\n' + listing.price + "\n" + listing.date + "\n" + listing.url).then(() => {
            console.log({ listing } + " sent")
        }).catch((err) => {
            console.log(err)
        })
    }
    console.log("Sending complete: " + chatId)
}
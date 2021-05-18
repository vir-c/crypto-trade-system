export const config = {
    db: {
        mongoDB: {
            uri: process.env.MONGODB_URI || '',
            pwd: process.env.MONGODB_PWD,
            user: process.env.MONGODB_USER,
            database: process.env.MONGODB_NAME,
        },
    },
    exchange: {
        binance: {
            apiKey: process.env.BINANCE_API_KEY,
            secretKey: process.env.BINANCE_SECRET_KEY,
        },
    },
    blacklistSymbols: ['USDCUSDT', 'BNBUSDT', 'BUSDUSDT', 'EURUSDT', 'GBPUSDT'],
    telegram: {
        botURL: 'https://api.telegram.org/bot' + process.env.TELEGRAM_BOT_TOKEN + '/sendMessage',
        chatId: process.env.TELEGRAM_CHAT_ID,
    },
    trade: {
        value: 50, //value of each buy transaction
    },
    alertSchedule: '0 */2 * * *', // send alert every 2 hours,
}

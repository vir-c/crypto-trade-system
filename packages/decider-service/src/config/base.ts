export const config = {
    db: {
        mongoDB: {
            uri: process.env.MONGODB_URI,
            pwd: process.env.MONGODB_PWD,
            user: process.env.MONGODB_USER,
            database: process.env.MONGODB_NAME,
        },
    },
    cronSchedule: '2,12,22,32,42,52 * * * *', // https://crontab.guru/ “At minute 2, 12, 22, 32, 42, and 52.”
}

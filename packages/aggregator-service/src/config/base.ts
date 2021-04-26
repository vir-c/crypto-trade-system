export const config = {
    db: {
        mongoDB: {
            uri: process.env.MONGODB_URI,
            pwd: process.env.MONGODB_PWD,
            user: process.env.MONGODB_USER,
            database: process.env.MONGODB_NAME,
        },
    },
    cronSchedule: '1,11,21,31,41,51 * * * *', // https://crontab.guru/ “At minute 1, 11, 21, 31, 41, and 51.”
}

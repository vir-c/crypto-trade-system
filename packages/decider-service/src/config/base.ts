export const config = {
    db: {
        mongoDB: {
            uri: process.env.MONGODB_URI,
            pwd: process.env.MONGODB_PWD,
            user: process.env.MONGODB_USER,
            database: process.env.MONGODB_NAME,
        },
    },
}

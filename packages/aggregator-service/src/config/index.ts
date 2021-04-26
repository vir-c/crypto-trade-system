import { config as conf } from './base'

if (process.env.APP_ENV != 'prod') {
    require('./local')
}

conf.db.mongoDB.uri = conf.db.mongoDB.uri
    .replace('<password>', conf.db.mongoDB.pwd)
    .replace('<database>', conf.db.mongoDB.database)

export const config = conf

import { config as conf } from './base'

conf.db.mongoDB.uri = conf.db.mongoDB.uri
    .replace('<password>', conf.db.mongoDB.pwd)
    .replace('<database>', conf.db.mongoDB.database)

export const config = conf

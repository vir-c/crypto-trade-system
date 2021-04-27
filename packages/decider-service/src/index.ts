import './env'
import { Log } from '../../../shared/node'
import { main } from './main'
import { config } from './config'
import db from './db'

function run() {
    try {
        //connect to mongodb
        db.connect({ db: config.db.mongoDB.uri })
        main()
    } catch (error) {
        Log.error(error, 'Failed to execute app... ')
    }
}

run()

import './env'
import { Log } from '../../../shared/node'
import { config } from './config'
import db from './db'
import cron from 'node-cron'
import { main } from './main'

async function run() {
    try {
        //connect to mongodb
        db.connect({ db: config.db.mongoDB.uri })

        //create cron job to save ticker price
        cron.schedule(config.cronSchedule, main)
    } catch (error) {
        Log.error(error, 'Failed to execute app... ')
    }
}

run()

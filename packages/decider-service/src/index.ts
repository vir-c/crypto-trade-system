import '../../../shared/node/env'
import { config } from './config'
import { Log, telegram } from '../../../shared/node'
import { main } from './main'
import db from './db'
import { PerfHistory } from './db/models/perfHistory'
import { symbolPerfHistory } from './algo/historical-performace'
import ipc from './ipc'
import cron from 'node-cron'
import alert from './alert'
import binance from './exchange/binance'

async function run() {
    try {
        //connect to mongodb
        db.connect({ db: config.db.mongoDB.uri })

        // get lotsize details for precision
        binance.getInfo()

        //cache performace history
        const perfDocument: PerfHistory = await db.controller.perfHistory.get()
        if (perfDocument) {
            perfDocument.perfHistory.map((el) => symbolPerfHistory.updatePerf(el.symbol, el.pl))
        }

        //on message from aggregator service execute main
        ipc.executeOnMessage(main)
        //schedule alerting
        cron.schedule(config.alertSchedule, alert.dailyPL, {
            timezone: 'Asia/Kolkata',
        })
    } catch (error) {
        const errorStr = Log.error(error, 'Failed to execute app... ')
        alert.error(errorStr)
    }
}

run()

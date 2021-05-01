import './env'
import { Log } from '../../../shared/node'
import { main } from './main'
import { config } from './config'
import cron from 'node-cron'
import db from './db'
import { IPerfHistory, PerfHistory, SymbolPerf } from './db/models/perfHistory'
import { symbolPerfHistory } from './algo/historical-performace'
import ipc from './ipc'

async function run() {
    try {
        //connect to mongodb
        db.connect({ db: config.db.mongoDB.uri })

        const perfDocument: PerfHistory = await db.controller.perfHistory.get()

        perfDocument.perfHistory.map((el) => symbolPerfHistory.updatePerf(el.symbol, el.pl))

        //on message from aggregator service execute main
        ipc.executeOnMessage(main)
    } catch (error) {
        Log.error(error, 'Failed to execute app... ')
    }
}

run()

import { Log } from '../../../shared/node'
import algo from './algo'
import db from './db'

export async function main() {
    try {
        const tickers = await db.controller.ticker.getTickers(96)
        algo.getGoodTrades(tickers)
    } catch (error) {
        const dateTime = new Date().toString()
        Log.error(error, `Failed to execute main at ${dateTime}... `)
    }
}

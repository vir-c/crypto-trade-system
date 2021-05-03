import { BinanceExchange, ExchangeAdaptor } from './exchange'
import * as R from 'ramda'
import { PriceData } from './exchange/exchange.interface'
import { Log } from '../../../shared/node'
import db from './db'
import ipc from './ipc'

const binanceExchange = new BinanceExchange()
const exchangeAdaptor = new ExchangeAdaptor(binanceExchange)

export async function main() {
    try {
        // get price list from exchange
        const priceListUSDT = await exchangeAdaptor.getTickers()
        console.log(priceListUSDT.map((item)=>item.avgPrice5min? item.avgPrice5min : 'LOL'))

        // //add results to db
        // await db.controller.ticker.addTicker({
        //     exchange: 'binance',
        //     priceList: priceListUSDT,
        // })

        // console.log('Ticker added successful for ', new Date().toUTCString())

        // //message decider service
        // ipc.relayToDeciderService()
    } catch (error) {
        const dateTime = new Date().toString()
        Log.error(error, `Failed to execute main at ${dateTime}... `)
    }
}

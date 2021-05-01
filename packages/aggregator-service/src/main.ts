import { BinanceExchange, ExchangeAdaptor } from './exchange'
import * as R from 'ramda'
import { PriceData } from './exchange/exchange.interface'
import { Log } from '../../../shared/node'
import db from './db'
import ipc from './ipc'

const binanceExchange = new BinanceExchange()
const exchangeAdaptor = new ExchangeAdaptor(binanceExchange)
const isUSDT = (x: PriceData) => x.symbol.toUpperCase().substr(-4) === 'USDT'
const filterUSDTPairs = R.filter(isUSDT)

export async function main() {
    try {
        // get price list from exchange
        const priceList = await exchangeAdaptor.getTickers()

        //filter USDT pairs
        const priceListUSD = filterUSDTPairs(priceList)

        //add results to db
        await db.controller.ticker.addTicker({
            exchange: 'binance',
            priceList: priceListUSD,
        })

        console.log('Ticker added successful for ', new Date().toUTCString())

        //message decider service
        ipc.relayToDeciderService()
    } catch (error) {
        const dateTime = new Date().toString()
        Log.error(error, `Failed to execute main at ${dateTime}... `)
    }
}

import { BinanceExchange, ExchangeAdaptor } from './exchange'
import * as R from 'ramda'
import { TickerData } from './exchange/exchange.interface'
import { Log } from '../../../shared/node'

const binanceExchange = new BinanceExchange()
const exchangeAdaptor = new ExchangeAdaptor(binanceExchange)
const isUSDT = (x: TickerData) => x.symbol.toUpperCase().includes('USDT')
const filterUSDTPairs = R.filter(isUSDT)

export async function main() {
    try {
        // get price list from exchange
        const priceList = await exchangeAdaptor.getTickers()

        //filter USDT pairs
        const priceListUSD = filterUSDTPairs(priceList)

        //add results to db

        //notify decision-maker package
    } catch (error) {
        const dateTime = new Date().toString()
        Log.error(error, `Failed to execute main at ${dateTime}... `)
    }
}

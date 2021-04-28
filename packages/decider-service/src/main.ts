import { Log } from '../../../shared/node'
import { getGoodTrades, shouldSellAsset } from './algo'
import db from './db'
import { makeTrades } from './exchange/mock'

export async function main() {
    try {
        const [tickers, currentHoldings] = await Promise.all([
            db.controller.ticker.getTickers(96),
            db.controller.holdings.currentHoldings(),
        ])

        const sellSymbols = currentHoldings?.assets.filter((sym) => shouldSellAsset(tickers, sym)) || []

        const buyTrades = getGoodTrades(tickers, currentHoldings ? currentHoldings.assets : [])

        //always maintain only 5 assets in holdings
        const holdingsSize = currentHoldings?.assets?.length || 0
        const buySize = 5 - holdingsSize + sellSymbols.length
        const buySymbols = buyTrades.slice(0, buySize).map((i) => i.symbol)

        if (buySymbols.length || sellSymbols.length) {
            await makeTrades(sellSymbols, buySymbols, tickers[0])
        }
    } catch (error) {
        const dateTime = new Date().toString()
        Log.error(error, `Failed to execute main at ${dateTime}... `)
    }
}

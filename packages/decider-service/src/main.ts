import { Log } from '../../../shared/node'
import { createWMAStrategy, getGoodTrades, shouldSellAsset } from './algo'
import db from './db'
import { makeTrades, updateHoldings } from './exchange/mock'

const buyWMAStrategy = createWMAStrategy(12, 84)
const sellWMAStrategy = createWMAStrategy(12, 84)

export async function main() {
    try {
        const [tickers, currentHoldings] = await Promise.all([
            db.controller.ticker.getTickers(96),
            db.controller.holdings.currentHoldings(),
        ])

        const currentAssets = currentHoldings ? currentHoldings.assets : []

        const sellSymbols = currentAssets.filter((sym) => shouldSellAsset(tickers, sym, sellWMAStrategy)) || []

        const top10Symbols = getGoodTrades(tickers, buyWMAStrategy)

        //ignore symbols that are held
        const buyTrades = top10Symbols.filter((i) => !currentAssets.includes(i.symbol))

        //always maintain only 5 assets in holdings
        const buySize = 5 - currentAssets.length + sellSymbols.length
        const buySymbols = buyTrades.slice(0, buySize).map((i) => i.symbol)

        if (buySymbols.length || sellSymbols.length) {
            const pl = await makeTrades(sellSymbols, buySymbols, tickers[0])

            const holdSymbols = [...buySymbols, ...currentAssets.filter((s) => !sellSymbols.includes(s))]

            updateHoldings(holdSymbols, pl + (currentHoldings?.totalPL || 0))

            console.log(
                `Bought: ${buySymbols} and Sold ${sellSymbols} at Profil/Loss ${pl}, current holdings are ${holdSymbols}`
            )
        }
    } catch (error) {
        const dateTime = new Date().toString()
        Log.error(error, `Failed to execute main at ${dateTime}... `)
    }
}

import { Log } from '../../../shared/node'
import alert from './alert'
import { algoStrategy, getGoodTrades, shouldSellAsset } from './algo'
import { symbolPerfHistory } from './algo/historical-performace'
import db from './db'
import { makeTrades, updateHoldings } from './exchange/trade'

//from backtesting
const buyAlgoStrategy = algoStrategy.ema(18, 84)
const sellAlgoStrategy = algoStrategy.ema(9, 30)

export async function main() {
    try {
        const [tickers, currentHoldings] = await Promise.all([
            db.controller.ticker.getTickers(96),
            db.controller.holdings.currentHoldings(),
        ])

        const currentAssets = currentHoldings ? currentHoldings.assets : []

        const sellSymbols = currentAssets.filter((sym) => shouldSellAsset(tickers, sym, sellAlgoStrategy)) || []

        const topBuySymbols = getGoodTrades(tickers, buyAlgoStrategy)

        //ignore symbols that are held
        const buyTrades = topBuySymbols.filter((i) => !currentAssets.includes(i.symbol))

        //always maintain only 5 assets in holdings
        const buySize = 5 - currentAssets.length + sellSymbols.length

        //get buysymbols with good performace history
        const buySymbols = symbolPerfHistory.sortByPerf(buyTrades.map((i) => i.symbol)).slice(0, buySize)

        if (buySymbols.length || sellSymbols.length) {
            const { earnings, boughtSymbols, soldSymbols } = await makeTrades(sellSymbols, buySymbols)

            const holdSymbols = [...boughtSymbols, ...currentAssets.filter((s) => !soldSymbols.includes(s))]

            updateHoldings(holdSymbols, earnings + (currentHoldings?.totalPL || 0))

            console.log(
                `Bought: ${buySymbols} and Sold ${
                    sellSymbols.length ? sellSymbols + ' at Profil/Loss: ' + earnings : ''
                }, current holdings are ${holdSymbols}`
            )
        }
    } catch (error) {
        const dateTime = new Date().toString()
        const errorStr = Log.error(error, `Failed to execute main at ${dateTime}... `)
        alert.error(errorStr)
    }
}

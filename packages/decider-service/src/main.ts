import { Log } from '../../../shared/node'
import alert from './alert'
import { getGoodTrades, shouldSellAsset, ALGO_STRATEGY } from './algo'
import { symbolPerfHistory } from './algo/historical-performace'
import marketTrend from './algo/market-trend'
import db from './db'
import { makeTrades, updateHoldings } from './exchange/trade'

//from backtesting
const buyAlgoStrategy = ALGO_STRATEGY.MACD_EMA
const sellAlgoStrategy = ALGO_STRATEGY.MACD

export async function main() {
    try {
        const [tickers, currentHoldings] = await Promise.all([
            db.controller.ticker.getTickers(120),
            db.controller.holdings.currentHoldings(),
        ])

        const currentAssets = currentHoldings ? currentHoldings.assets : []

        const sellSymbols = currentAssets.filter((sym) => shouldSellAsset(tickers, sym, sellAlgoStrategy)) || []

        const topBuySymbols = getGoodTrades(tickers, buyAlgoStrategy)

        //ignore symbols that are held and ignore symbols that satisfy sell criteria
        const buyTrades = topBuySymbols.filter((s) => !currentAssets.includes(s))

        //get holding size from market trend
        const holdingsLimit = marketTrend.getHoldingsSize(tickers)

        //dynamically adjust bucket size
        const buySize = holdingsLimit - currentAssets.length + sellSymbols.length

        //get buysymbols with good performace history
        const buySymbols = buySize > 0 ? symbolPerfHistory.sortByPerf(buyTrades).slice(0, buySize) : []

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

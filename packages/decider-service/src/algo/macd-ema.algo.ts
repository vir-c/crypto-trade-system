import { compose, map, slice, sort } from 'ramda'
import { ITicker } from '../db/models'
import { getPriceListForSymbol, getTopNSymbols } from './helpers'
import * as macdAlgo from './macd.algo'
import * as emaAlgo from './ema.algo'
import { config } from '../config'

type symbolStrength = { symbol: string; strength: number }

/**
 * returns 15 symbols that have strong updward indication according to WMA algo
 * @param tickers
 * @param assets list of symbols that are currently held
 * @returns
 */
function getGoodTrades(tickers: ITicker[]): string[] {
    // get top symbols by dollar volume
    const topSymbols: string[] = getTopNSymbols(tickers[0].priceList, 60)

    const symbolRatingList: symbolStrength[] = []
    for (let sym of topSymbols) {
        try {
            if (
                sym.slice(-6) === 'UPUSDT' ||
                sym.slice(-8) === 'DOWNUSDT' ||
                config.blacklistSymbols.includes(sym)
            ) {
                continue
            }

            const symbolPriceList = getPriceListForSymbol(tickers, sym)
            const buySignalStrength = macdAlgo.isBuySignal(symbolPriceList)
            //const rsiSignal = rsiAlgo.isBuySignal(symbolPriceList)

            if (!(typeof buySignalStrength == 'boolean')) {
                symbolRatingList.push({
                    symbol: sym,
                    strength: buySignalStrength,
                })
            }
        } catch {
            //ignore error
        }
    }

    //get top 10 performing symbols
    const topPerformers = compose(
        map((s: symbolStrength) => s.symbol),
        slice(0, 18),
        sort((a: symbolStrength, b: symbolStrength) => a.strength - b.strength)
    )(symbolRatingList)

    return topPerformers
}

/**
 *
 * @param tickers
 * @param symbol
 * @returns {boolean}
 */
function shouldSellAsset(tickers: ITicker[], symbol: string) {
    return emaAlgo.shouldSellAsset(tickers, symbol)
}

export { getGoodTrades, shouldSellAsset }

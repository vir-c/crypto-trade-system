import { compose, map, slice, sort } from 'ramda'
import { RSI } from 'technicalindicators'
import { ITicker } from '../db/models'
import { getPriceListForSymbol, getTopNSymbols } from './helpers'

const PERIOD = 24

const isBuySignal = (input: number[]): boolean | number => {
    const optimalInput = input.slice(0, PERIOD + 1)

    const rsi = RSI.calculate({
        period: PERIOD,
        values: optimalInput,
        reversedInput: true,
    })[0]

    if (rsi < 45) {
        return rsi
    }
    return false
}

const isSellSignal = (input: number[]): boolean => {
    const optimalInput = input.slice(0, PERIOD)

    const rsi = RSI.calculate({
        period: PERIOD,
        values: optimalInput,
        reversedInput: true,
    })[0]

    return rsi > 70
}

type symbolStrength = { symbol: string; strength: number }

/**
 * returns 15 symbols that have strong updward indication according to WMA algo
 * @param tickers
 * @param assets list of symbols that are currently held
 * @returns
 */
function getGoodTrades(tickers: ITicker[]): string[] {
    // get top50 symbols by dollar volume
    const top50Symbols: string[] = getTopNSymbols(tickers[0].priceList, 60)

    //for each symbol get ema percentage change
    const symbolRatingList: symbolStrength[] = []
    for (let sym of top50Symbols) {
        try {
            const symbolPriceList = getPriceListForSymbol(tickers, sym)
            const buySignalStrength = isBuySignal(symbolPriceList)
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
        sort((a: symbolStrength, b: symbolStrength) => -1 * (a.strength - b.strength))
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
    const symbolPriceList = getPriceListForSymbol(tickers, symbol)
    return isSellSignal(symbolPriceList)
}

export { getGoodTrades, shouldSellAsset, isBuySignal, isSellSignal }

import { compose, map, slice, sort } from 'ramda'
import { SMA, MACD } from 'technicalindicators'
import { ITicker } from '../db/models'
import { getAvgRateOfChange, getPriceListForSymbol, getTopNSymbols, getPercentchange } from './helpers'

const FAST_PERIOD = 18
const SLOW_PERIOD = 90
const SIGNAL_PERIOD = 18

const isBuySignal = (input: number[]): boolean | number => {
    const optimalInput = input.slice(0, SLOW_PERIOD + SIGNAL_PERIOD)

    const val = MACD.calculate({
        fastPeriod: FAST_PERIOD,
        slowPeriod: SLOW_PERIOD,
        signalPeriod: SIGNAL_PERIOD,
        SimpleMAOscillator: false,
        SimpleMASignal: false,
        values: optimalInput,
        reversedInput: true,
    })

    const macds = val.filter((v) => v.MACD).map((v) => v.MACD)

    const macd = val[0]
    const chngPercent = getPercentchange(macd.signal, macd.MACD)
    const avgRateOfChange = getAvgRateOfChange(macds)

    if (
        macd.MACD > macd.signal &&
        chngPercent > -5 &&
        chngPercent < 5 &&
        avgRateOfChange > 0.33 &&
        avgRateOfChange < 2
    ) {
        return macd.MACD / macd.signal
    }
    return false
}

const isSellSignal = (input: number[]): boolean => {
    const optimalInput = input.slice(0, SLOW_PERIOD + SIGNAL_PERIOD)

    const macd = MACD.calculate({
        fastPeriod: FAST_PERIOD,
        slowPeriod: SLOW_PERIOD,
        signalPeriod: SIGNAL_PERIOD,
        SimpleMAOscillator: false,
        SimpleMASignal: false,
        values: optimalInput,
        reversedInput: true,
    })[0]

    return macd.MACD - macd.signal < 0
}

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

    //for each symbol get ema percentage change
    const symbolRatingList: symbolStrength[] = []
    for (let sym of topSymbols) {
        try {
            if (sym.slice(-6) === 'UPUSDT' || sym.slice(-8) === 'DOWNUSDT') continue
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
    const symbolPriceList = getPriceListForSymbol(tickers, symbol)
    return isSellSignal(symbolPriceList)
}

export { getGoodTrades, shouldSellAsset, isBuySignal, isSellSignal }

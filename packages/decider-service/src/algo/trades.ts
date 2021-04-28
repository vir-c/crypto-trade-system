import * as R from 'ramda'
import { ITicker } from '../db/models'
import { IPrice } from '../db/models/price'
import emaAlgo from './ema.algo'

type symbolEMAChange = { symbol: string; wmaChange: number }

/** helper functions */

const sortByVolume = (a: IPrice, b: IPrice) => b.volume * b.lastPrice - a.volume * a.lastPrice
const getTop40 = R.compose(R.slice(0, 40), R.sort(sortByVolume))
const percentchange = (base: number, now: number) => ((now - base) / base) * 100

// get weights array
const w12 = emaAlgo.getWeights(12)
const w96 = emaAlgo.getWeights(96)

/**
 * calculates WMA changes between 12 (2 hours) and 96 (16 hours)
 * @param {number[]} priceList
 * @returns {number}
 */
function calWMAChange(priceList: number[]): number {
    //ema for 2 hrs
    const ema12 = emaAlgo.getWMA(priceList, w12)
    const ema96 = emaAlgo.getWMA(priceList, w96)
    return percentchange(ema96, ema12)
}

/**
 * calculates WMA change for a given asset symbol
 */
function assetEMAChange(tickers: ITicker[], sym: string): number {
    const symbolPriceList = tickers.map((t) => t.priceList.find((p) => p.symbol == sym).lastPrice)
    return calWMAChange(symbolPriceList)
}

/**
 * returns top 40 symbols by dollar trade volume
 */
function getTop40Symbols(priceList: IPrice[]) {
    return R.compose(
        R.map((x) => x['symbol']),
        getTop40
    )(priceList)
}

/**
 * returns 5 symbols that have strong updward indication according to WMA algo
 * @param tickers
 * @param assets list of symbols that are currently held
 * @returns
 */
function getGoodTrades(tickers: ITicker[], assets: string[]): symbolEMAChange[] {
    // get top40 symbols by dollar volume
    const top40Symbols: string[] = getTop40Symbols(tickers[0].priceList)

    //ignore symbols that are held
    const topSymbols = top40Symbols.filter((s) => !assets.includes(s))

    //for each symbol get ema percentage change
    const symbolEMAChangeList: symbolEMAChange[] = []
    for (let sym of topSymbols) {
        symbolEMAChangeList.push({ symbol: sym, wmaChange: assetEMAChange(tickers, sym) })
    }

    //filter trades that have wmaChange greater than 2%
    const filterEMAChangeList = R.filter((a: symbolEMAChange) => a.wmaChange > 2)(symbolEMAChangeList)

    //get top 5 performing symbols
    const top5Performers = (R.compose(
        R.slice(0, 5),
        R.sort((a: symbolEMAChange, b: symbolEMAChange) => b.wmaChange - a.wmaChange)
    )(filterEMAChangeList) as unknown) as symbolEMAChange[]

    return top5Performers
}

/**
 *
 * @param tickers
 * @param symbol
 * @returns {boolean}
 */
function shouldSellAsset(tickers: ITicker[], symbol: string) {
    return assetEMAChange(tickers, symbol) < -1.5
}

export { getGoodTrades, shouldSellAsset }

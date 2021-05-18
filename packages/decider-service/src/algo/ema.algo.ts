import { map, range, compose, reduce, sum, zipWith, __, slice, sort, filter } from 'ramda'
import { ITicker } from '../db/models'
import { IPrice } from '../db/models/price'
import { getPriceListForSymbol, getTopNSymbols, getPercentchange } from './helpers'
import smartbounds from './smartbounds'

/*
For 6
[
  0.21869995029546582,
  0.1913624565085326,
  0.17009996134091787,
  0.15308996520682608,
  0.13917269564256918,
  0.1275749710056884
]
*/

const getWMAWeightFn = (n) => (x) => 1 / (n * 4 + x)

//ema
const getEMAWeightFn = (n) => (x) => (2 / (n + 1)) * Math.pow(1 - 2 / (n + 1), x)

const getNWeightsForEMA = (n) => compose(map(getEMAWeightFn(n)), range(0))(n)
const getNWeightsForWMA = (n) => compose(map(getWMAWeightFn(n)), range(0))(n)
const divideBy = (s) => (x) => x / s //https://ramdajs.com/docs/#divide
const multiply = (x, y) => x * y

//normalize array
const norm = (w) => map(compose(divideBy, sum)(w))(w)

function getWeights(size: number, getWeightsN: (n: number) => number[]): number[] {
    return compose(norm, getWeightsN)(size)
}

/**
 * calculates weighted moving average with given weights
 * @param nums number array to calculate EMA for
 * @param ws weight to consider
 * @returns weighted moving average
 */
function getWMA(nums: number[], ws: number[]): number {
    return sum(zipWith(multiply, nums, ws))
}

export type AlgoStrategy = (priceList: number[]) => number

/**
 * creates a strategy for a given weight function
 */
function createAlgoStrategy(weightFn: (n: any) => number[]) {
    return (periodShort: number, periodLong: number, periodMed?: number): AlgoStrategy => {
        const wShort = getWeights(periodShort, weightFn)
        const wLong = getWeights(periodLong, weightFn)
        const wMed = periodMed ? getWeights(periodMed, weightFn) : null

        return (priceList: number[]) => {
            const emaShort = getWMA(priceList, wShort)
            const emaLong = getWMA(priceList, wLong)

            if (!periodMed) return getPercentchange(emaLong, emaShort)
            else {
                const emaMed = getWMA(priceList, wMed)
                return 0.6 * getPercentchange(emaMed, emaShort) + 0.4 * getPercentchange(emaLong, emaShort)
            }
        }
    }
}

/**
 * calculates WMA change for a given asset symbol
 */
function assetEMAChange(priceList: number[], wmaStrategy: AlgoStrategy): number {
    return wmaStrategy(priceList)
}

const algoStrategy = {
    ema: createAlgoStrategy(getNWeightsForEMA),
    wma: createAlgoStrategy(getNWeightsForWMA),
}

const buyAlgoStrategy = algoStrategy.ema(24, 96)
const sellAlgoStrategy = algoStrategy.ema(12, 30)

type symbolEMAChange = { symbol: string; wmaChange: number }

const isSellSignal = (symbolPriceList: number[]): boolean => {
    return assetEMAChange(symbolPriceList, sellAlgoStrategy) < 0.5
}

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
    const symbolEMAChangeList: symbolEMAChange[] = []
    for (let sym of top50Symbols) {
        try {
            const symbolPriceList = getPriceListForSymbol(tickers, sym)
            symbolEMAChangeList.push({ symbol: sym, wmaChange: assetEMAChange(symbolPriceList, buyAlgoStrategy) })
        } catch {
            //ignore error
        }
    }

    //ratio of market for which 24 change is greater than zero
    const marketDistribution =
        tickers[0].priceList.reduce((count, item) => (item.priceChangePercent > 0 ? ++count : count), 0) /
        tickers[0].priceList.length

    //get smart bounds based on market distribution
    const [lowerBound, upperBound] = smartbounds.getSmartBounds(marketDistribution)

    //filter trades that have wmaChange with bounds
    const filterEMAChangeList = filter(
        (a: symbolEMAChange) => a.wmaChange > lowerBound && a.wmaChange < upperBound
    )(symbolEMAChangeList)

    //get top 10 performing symbols
    const topPerformers = compose(
        map((s: symbolEMAChange) => s.symbol),
        slice(0, 18),
        sort((a: symbolEMAChange, b: symbolEMAChange) => a.wmaChange - b.wmaChange)
    )(filterEMAChangeList)

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
    return assetEMAChange(symbolPriceList, sellAlgoStrategy) < 0.5
}

export { getGoodTrades, shouldSellAsset, isSellSignal }

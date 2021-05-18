/** helper functions */

import { compose, map, slice, sort } from 'ramda'
import { ITicker } from '../db/models'
import { IPrice } from '../db/models/price'

const sortByVolume = (a: IPrice, b: IPrice) => b.volume * b.avgPrice5min - a.volume * a.avgPrice5min

const getTop = (n) => compose(slice(0, n), sort(sortByVolume))

/**
 * returns top 50 symbols by dollar trade volume
 */
export const getTopNSymbols = (priceList: IPrice[], count: number) => {
    const getTopN = getTop(count)
    return compose(
        map((x) => x['symbol']),
        getTopN
    )(priceList)
}

export const getPriceListForSymbol = (tickers: ITicker[], symbol: string) => {
    try {
        return tickers.map((t) => t.priceList.find((p) => p.symbol == symbol).avgPrice5min)
    } catch (error) {
        throw error
    }
}

export const getAvgRateOfChange = (nums: number[]) => {
    let sum = 0
    for (let i = 0; i < nums.length - 1; i++) {
        sum += nums[i + 1] - nums[i]
    }
    return sum / nums[0]
}

export const getPercentchange = (base: number, now: number) => ((now - base) / base) * 100

export const createPriceMap = (ticker: ITicker) => {
    const priceMap = new Map()
    ticker.priceList.map((pd) => priceMap.set(pd.symbol, pd.avgPrice5min))

    return (symbol) => priceMap.get(symbol)
}

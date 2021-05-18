/**
 * Market indicator tells whether the market is trending upwards or downwards
 *
 */

import { ITicker } from '../db/models'
import { createPriceMap, getPercentchange } from './helpers'

const getMarketTrend = (tickers: ITicker[]) => {
    const tickerNowPrice = createPriceMap(tickers[0])
    const ticker3HourPrice = createPriceMap(tickers[17])

    let totalCount = 0,
        posCount = 0
    for (let item of tickers[0].priceList) {
        const priceNow = tickerNowPrice(item.symbol)
        const price3hour = ticker3HourPrice(item.symbol)
        if (typeof price3hour == 'number') {
            const priceChng = getPercentchange(price3hour, priceNow)

            //only consider change greater or less than 0.2%
            if (priceChng < 0.2 || priceChng > 0.2) {
                totalCount++
                priceChng > 0.2 ? ++posCount : ''
            }
        }
    }

    return posCount / totalCount
}

const getHoldingsSize = (tickers: ITicker[]): number => {
    const val = getMarketTrend(tickers)

    if (val < 0.3) return 0
    if (val < 0.4) return 2
    if (val < 0.5) return 4
    if (val < 0.6) return 5
    if (val < 0.7) return 6
    if (val < 0.8) return 7
    else return 5
}

export default {
    getHoldingsSize,
}

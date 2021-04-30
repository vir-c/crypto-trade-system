import * as R from 'ramda'
import { ITicker } from '../db/models'
import { IPrice } from '../db/models/price'
import { assetEMAChange, AlgoStrategy } from './ema.algo'

type symbolEMAChange = { symbol: string; wmaChange: number }

/** helper functions */

const sortByVolume = (a: IPrice, b: IPrice) => b.volume * b.lastPrice - a.volume * a.lastPrice
const getTop40 = R.compose(R.slice(0, 40), R.sort(sortByVolume))

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
 * returns 15 symbols that have strong updward indication according to WMA algo
 * @param tickers
 * @param assets list of symbols that are currently held
 * @returns
 */
function getGoodTrades(tickers: ITicker[], AlgoStrategy: AlgoStrategy): symbolEMAChange[] {
    // get top40 symbols by dollar volume
    const top40Symbols: string[] = getTop40Symbols(tickers[0].priceList)

    //for each symbol get ema percentage change
    const symbolEMAChangeList: symbolEMAChange[] = []
    for (let sym of top40Symbols) {
        const symbolPriceList = getPriceListForSymbol(tickers, sym)
        symbolEMAChangeList.push({ symbol: sym, wmaChange: assetEMAChange(symbolPriceList, AlgoStrategy) })
    }

    //filter trades that have wmaChange greater than 2%
    const filterEMAChangeList = R.filter((a: symbolEMAChange) => a.wmaChange > 0.5 && a.wmaChange < 2.5)(
        symbolEMAChangeList
    )

    //get top 10 performing symbols
    const top10Performers = (R.compose(
        R.slice(0, 15),
        R.sort((a: symbolEMAChange, b: symbolEMAChange) => b.wmaChange - a.wmaChange)
    )(filterEMAChangeList) as unknown) as symbolEMAChange[]

    return top10Performers
}

/**
 *
 * @param tickers
 * @param symbol
 * @returns {boolean}
 */
function shouldSellAsset(tickers: ITicker[], symbol: string, wmaStrategy: AlgoStrategy) {
    const symbolPriceList = getPriceListForSymbol(tickers, symbol)
    return assetEMAChange(symbolPriceList, wmaStrategy) < 0.5
}

function getPriceListForSymbol(tickers: ITicker[], symbol: string) {
    return tickers.map((t) => t.priceList.find((p) => p.symbol == symbol).lastPrice)
}

export { getGoodTrades, shouldSellAsset }

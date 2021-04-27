import * as R from 'ramda'
import { ITicker } from '../db/models'
import { IPrice } from '../db/models/price'
import emaAlgo from './ema.algo'

type symbolEMAChange = { symbol: string; wmaChange: number }

const sortByVolume = (a: IPrice, b: IPrice) => b.volume * b.lastPrice - a.volume * a.lastPrice
const getTop40 = R.compose(R.slice(0, 40), R.sort(sortByVolume))

// get weights array
const w12 = emaAlgo.getWeights(12)
const w96 = emaAlgo.getWeights(96)

const percentchange = (base: number, now: number) => ((now - base) / base) * 100

function getEMAChange(priceList: number[]) {
    //ema for 2 hrs
    const ema12 = emaAlgo.getWMA(priceList, w12)
    const ema96 = emaAlgo.getWMA(priceList, w96)
    return percentchange(ema96, ema12)
}

function getTop40Symbols(priceList: IPrice[]) {
    return R.compose(
        R.map((x) => x['symbol']),
        getTop40
    )(priceList)
}

function getGoodTrades(tickers: ITicker[]) {
    // get top40 symbols by dollar volume
    const top40Symbols: string[] = getTop40Symbols(tickers[0].priceList)

    //for each symbol get ema percentage change
    const symbolEMAChange: symbolEMAChange[] = []
    for (let sym of top40Symbols) {
        const symbolPriceList = tickers.map((t) => t.priceList.find((p) => p.symbol == sym).lastPrice)
        symbolEMAChange.push({ symbol: sym, wmaChange: getEMAChange(symbolPriceList) })
    }

    const top5Performers = R.compose(
        R.slice(0, 5),
        R.sort((a: symbolEMAChange, b: symbolEMAChange) => b.wmaChange - a.wmaChange)
    )(symbolEMAChange)

    console.log(top5Performers)
}

export default {
    getGoodTrades,
}

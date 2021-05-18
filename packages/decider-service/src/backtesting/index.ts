import { getGoodTrades, shouldSellAsset, ALGO_STRATEGY } from '../algo'
import { symbolPerfHistory } from '../algo/historical-performace'
import marketTrend from '../algo/market-trend'
import { config } from '../config'
import { ITicker } from '../db/models'
import utils from './utils'

type Asset = { symbol: string; price: number }
type Holdings = { assets: Asset[]; totalPL: number }

let buyCount = 0,
    sellCount = 0

async function backtest() {
    //export data
    //mongoexport --uri mongodb+srv://<username>:<password>@atlas-cluster-url.mongodb.net/<db-name> --collection <collection-name> --out <path-to-export>

    //read all inputs and create tickers array
    let tickers = await utils.getTickers('./src/backtesting/tickers.txt')

    //sort by time
    tickers = tickers.reverse() //.sort((a, b) => a.date.getTime() - b.date.getTime())
    console.log(tickers.length)

    //from backtesting
    const buyAlgoStrategy = ALGO_STRATEGY.MACD_EMA
    const sellAlgoStrategy = ALGO_STRATEGY.MACD

    const totalPL = runTest(tickers, buyAlgoStrategy, sellAlgoStrategy, 120)

    console.log('Buy Trades: ' + buyCount + ' Sell Trades: ' + sellCount)
    console.log(totalPL)

    //symbolPerfHistory.printPerfHistory()
    // buyCount = 0
    // sellCount = 0
    //     }
    // }
}

function runTest(
    tickers: ITicker[],
    buyStrategy: ALGO_STRATEGY,
    sellStrategy: ALGO_STRATEGY,
    size: number
): number {
    //mock holdings
    const currholdings = mockHoldings()
    symbolPerfHistory.clear()

    for (let i = 1500; i >= 0; i--) {
        const currTickers = tickers.slice(i, i + size)
        //console.log(currTickers[0].date)
        mockTrades(currTickers, currholdings, buyStrategy, sellStrategy)
        //console.log(currholdings.getHoldings().totalPL)
        //console.log(currTickers[0].date, currTickers[currTickers.length - 1].date)
    }
    const getLastPrice = createLastPriceMap(tickers[0])

    return currholdings.getHoldings().totalPL + currholdings.getHoldings().assets.reduce((sum, sym)=>{
        sum += ((getLastPrice(sym.symbol)/sym.price) -1)*100
        return sum
    }, 0)
}

function getAssets(symbols: string[], currentAssets: Asset[], getLastPrice): Asset[] {
    const assets: Asset[] = []
    for (let sym of symbols) {
        const asset = currentAssets.find((asset) => asset.symbol == sym)
        if (asset) {
            assets.push(asset)
        } else {
            assets.push({ symbol: sym, price: getLastPrice(sym) })
        }
    }
    return assets
}

function createLastPriceMap(ticker: ITicker) {
    const priceMap = new Map()
    ticker.priceList.map((pd) => priceMap.set(pd.symbol, pd.avgPrice5min))

    return (symbol) => priceMap.get(symbol)
}

function mockHoldings() {
    const holdings: Holdings = { assets: [], totalPL: 0 }

    const getHoldings = () => holdings
    const updateHoldings = (assets, pl) => {
        holdings.totalPL = pl
        holdings.assets = assets
    }

    return {
        getHoldings,
        updateHoldings,
    }
}

function mockTrades(tickers: ITicker[], currholdings, buyStrategy, sellStrategy) {
    const getLastPrice = createLastPriceMap(tickers[0])
    const currentAssets = currholdings.getHoldings().assets
    const currentSymbols = currentAssets.map((asset) => asset.symbol)

    const sellSymbols = currentSymbols.filter((sym) => shouldSellAsset(tickers, sym, sellStrategy)) || []

    const topSymbols = getGoodTrades(tickers, buyStrategy).filter((s)=>!config.blacklistSymbols.includes(s))


    //ignore symbols that are held
    const buyTrades = topSymbols.filter((s) => !currentSymbols.includes(s))

    //market trend
    const holdingsLimit = marketTrend.getHoldingsSize(tickers)
    
    //always maintain only 5 assets in holdings
    const buySize = holdingsLimit - currholdings.getHoldings().assets.length + sellSymbols.length

    //const buySymbols = symbolPerfHistory.sortByPerf(buyTrades.map((i) => i.symbol)).slice(0, buySize)
    const buySymbols = buySize > 0 ? buyTrades.slice(0, buySize) : []

    if (buySymbols.length || sellSymbols.length) {
        const holdSymbols = [...buySymbols, ...currentSymbols.filter((s) => !sellSymbols.includes(s))]
        const newAssets = getAssets(holdSymbols, currentAssets, getLastPrice)
        const pl = calculateProfit(sellSymbols, currentAssets, getLastPrice)
        const time = tickers[0].date['$date']
        const buySymbolPrice = buySymbols.map((s) => getLastPrice(s))
        const sellSymbolPrice = sellSymbols.map((s) => getLastPrice(s))
        console.log(
            `Buy:${buySymbols} ${buySymbolPrice}   Sell: ${sellSymbols} ${sellSymbolPrice} at ${pl} ${time}`
        )
        buyCount += buySymbols.length
        sellCount += sellSymbols.length
        currholdings.updateHoldings(newAssets, pl + currholdings.getHoldings().totalPL)
    }
}

function calculateProfit(sellSymbols: string[], currentAssets: Asset[], getLastPrice): number {
    return sellSymbols.reduce((sum, symbol) => {
        const buyPrice = currentAssets.find((a) => a.symbol == symbol).price
        const pl = (getLastPrice(symbol) / buyPrice - 1) * 100
        //update symbols perf history
        //symbolPerfHistory.updatePerf(symbol, pl)
        return sum + pl
    }, 0)
}

backtest()

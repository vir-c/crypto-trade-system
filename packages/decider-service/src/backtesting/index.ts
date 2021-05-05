import { algoStrategy, getGoodTrades, shouldSellAsset, AlgoStrategy } from '../algo'
import { symbolPerfHistory } from '../algo/historical-performace'
import { ITicker } from '../db/models'
import utils from './utils'

type Asset = { symbol: string; price: number }
type Holdings = { assets: Asset[]; totalPL: number }

let buyCount = 0,
    sellCount = 0

async function backtest() {
    //expo
    //mongoexport --uri mongodb+srv://<username>:<password>@atlas-cluster-url.mongodb.net/<db-name> --collection <collection-name> --out <path-to-export>
    //read all inputs and create tickers array
    let tickers = await utils.getTickers('./src/backtesting/tickers.txt')
    //sort by time
    tickers = tickers.reverse() //.sort((a, b) => a.date.getTime() - b.date.getTime())
    console.log(tickers.length)
    // for (let i = 1; i <= 3; i++) {
    //     for (let j = 6; j <= 18; j = j + 2) {
    //         const ws = [i * 6, j * 6]
    const ws = [24, 96]
    const buyAlgoStrategy = algoStrategy.ema(24, 96)
    const sellAlgoStrategy = algoStrategy.wma(9, 30)
    // const buyAlgoStrategy = algoStrategy.ema(18, 84)
    // const sellAlgoStrategy = algoStrategy.ema(9, 30)

    const totalPL = runTest(tickers, buyAlgoStrategy, sellAlgoStrategy, ws[1])
    console.log(totalPL, ws[0], ws[1], ws[1] / 2)
    console.log('Buy Trades: ' + buyCount + ' Sell Trades: ' + sellCount)
    //symbolPerfHistory.printPerfHistory()
    // buyCount = 0
    // sellCount = 0
    //     }
    // }
}

function runTest(tickers: ITicker[], buyStrategy: AlgoStrategy, sellStrategy: AlgoStrategy, size: number): number {
    //mock holdings
    const currholdings = mockHoldings()
    symbolPerfHistory.clear()

    for (let i = 1000; i >= 0; i--) {
        const currTickers = tickers.slice(i, i + size)
        //console.log(currTickers[0].date)
        mockSchdeuledTrade(currTickers, currholdings, buyStrategy, sellStrategy)
        //console.log(currholdings.getHoldings().totalPL)
        //console.log(currTickers[0].date, currTickers[currTickers.length - 1].date)
    }

    return currholdings.getHoldings().totalPL
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
    ticker.priceList.map((pd) => priceMap.set(pd.symbol, pd.lastPrice))

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

function mockSchdeuledTrade(tickers: ITicker[], currholdings, buyStrategy, sellStrategy) {
    const getLastPrice = createLastPriceMap(tickers[0])
    const currentAssets = currholdings.getHoldings().assets
    const currentSymbols = currentAssets.map((asset) => asset.symbol)

    const sellSymbols = currentSymbols.filter((symbol) => shouldSellAsset(tickers, symbol, sellStrategy)) || []
    const top15Symbols = getGoodTrades(tickers, buyStrategy).filter(
        (s) => !shouldSellAsset(tickers, s.symbol, sellStrategy)
    )

    //ignore symbols that are held
    const buyTrades = top15Symbols.filter((i) => !currentSymbols.includes(i.symbol))

    //always maintain only 5 assets in holdings
    const buySize = 5 - currholdings.getHoldings().assets.length + sellSymbols.length
    //const buySymbols = symbolPerfHistory.sortByPerf(buyTrades.map((i) => i.symbol)).slice(0, buySize)
    const buySymbols = symbolPerfHistory.sortByPerf(buyTrades.map((i) => i.symbol)).slice(0, buySize)

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
        symbolPerfHistory.updatePerf(symbol, pl)
        return sum + pl
    }, 0)
}

backtest()

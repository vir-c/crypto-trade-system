import { pluck, sum } from 'ramda'
import { symbolName } from 'typescript'
import { symbolPerfHistory } from '../algo/historical-performace'
import db from '../db'
import { ITicker, TradeType } from '../db/models'

/**
 * sells an asset
 * @param symbol
 * @returns {number} profit loss for the transaction
 */
async function sellAsset(symbol: string, lastPrice: number): Promise<{ symbol: string; pl: number }> {
    //get quantity for the asset
    const tradeData = await db.controller.trades.getLastAssetTrade(symbol)

    const pl = (lastPrice - tradeData.price) * tradeData.quantity

    await db.controller.trades.addTrade({
        symbol: symbol,
        date: new Date(),
        price: lastPrice,
        tradeType: TradeType.SELL,
        tradeValue: lastPrice * tradeData.quantity,
        quantity: tradeData.quantity,
        profitOrLoss: pl,
    })

    return { symbol, pl }
}

/**
 * buy an asset
 * @param symbol
 */
async function buyAsset(symbol: string, lastPrice: number): Promise<number> {
    //get quantity for the asset
    const buyQuantity = 100 / lastPrice

    await db.controller.trades.addTrade({
        symbol: symbol,
        date: new Date(),
        price: lastPrice,
        tradeType: TradeType.BUY,
        tradeValue: 100,
        quantity: buyQuantity,
    })
    return 0
}

function createLastPriceMap(ticker: ITicker) {
    const priceMap = new Map()
    ticker.priceList.map((pd) => priceMap.set(pd.symbol, pd.lastPrice))

    return (symbol) => priceMap.get(symbol)
}

/**
 *
 * @param sellAssets symbols to be sold
 * @param buyAssets symbols to be bought
 */
async function makeTrades(sellAssets: string[], buyAssets: string[], lastTicker: ITicker) {
    const getLastPrice = createLastPriceMap(lastTicker)

    const sellTransactions = await Promise.all(sellAssets.map((symbol) => sellAsset(symbol, getLastPrice(symbol))))
    const buyTransactions = await Promise.all(buyAssets.map((symbol) => buyAsset(symbol, getLastPrice(symbol))))

    //for sell transations, update performance history and get earnings
    const earnings = sellTransactions.reduce((sum, el) => {
        sum += el.pl
        symbolPerfHistory.updatePerf(el.symbol, el.pl)
        return sum
    }, 0)

    await db.controller.perfHistory.update(sellTransactions)

    return earnings
}

/**
 *  updates current holdings data
 */
async function updateHoldings(assets: string[], pl: number) {
    await db.controller.holdings.addHoldings({
        assets: assets,
        totalPL: pl,
    })
}

export { makeTrades, updateHoldings }

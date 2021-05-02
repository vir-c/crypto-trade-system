import { symbolPerfHistory } from '../algo/historical-performace'
import db from '../db'
import { TradeType } from '../db/models'
import binance from './binance'

/**
 * sells an asset
 * @param symbol
 * @returns {number} profit loss for the transaction
 */
async function sellAsset(symbol: string): Promise<{ symbol: string; pl: number }> {
    //get quantity for the asset
    const tradeData = await db.controller.trades.getLastAssetTrade(symbol)

    const orderInfo = await binance.sellAsset(symbol, tradeData.quantity)

    const pl = (orderInfo.price - tradeData.price) * orderInfo.quantity

    await db.controller.trades.addTrade({
        symbol: symbol,
        date: new Date(orderInfo.timestamp),
        price: orderInfo.price,
        tradeType: TradeType.SELL,
        tradeValue: orderInfo.price * orderInfo.quantity,
        quantity: orderInfo.quantity,
        profitOrLoss: pl,
    })

    return { symbol, pl }
}

/**
 * buy an asset
 * @param symbol
 */
async function buyAsset(symbol: string): Promise<number> {
    const orderInfo = await binance.buyAsset(symbol)

    await db.controller.trades.addTrade({
        symbol: symbol,
        date: new Date(orderInfo.timestamp),
        price: orderInfo.price,
        tradeType: TradeType.BUY,
        tradeValue: 20,
        quantity: orderInfo.quantity,
    })
    return 0
}

// function createLastPriceMap(ticker: ITicker) {
//     const priceMap = new Map()
//     ticker.priceList.map((pd) => priceMap.set(pd.symbol, pd.lastPrice))

//     return (symbol) => priceMap.get(symbol)
// }

/**
 *
 * @param sellAssets symbols to be sold
 * @param buyAssets symbols to be bought
 */
async function makeTrades(sellAssets: string[], buyAssets: string[]) {
    const sellTransactions = await Promise.all(sellAssets.map((symbol) => sellAsset(symbol)))
    const buyTransactions = await Promise.all(buyAssets.map((symbol) => buyAsset(symbol)))

    //for sell transations, update performance history and get earnings
    const earnings = sellTransactions.reduce((sum, el) => {
        sum += el.pl
        symbolPerfHistory.updatePerf(el.symbol, el.pl)
        return sum
    }, 0)

    await db.controller.perfHistory.update(symbolPerfHistory.getAll())

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

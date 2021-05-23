import { all } from 'ramda'
import { Log } from '../../../../shared/node'
import alert from '../alert'
import { symbolPerfHistory } from '../algo/historical-performace'
import { config } from '../config/base'
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

    const pl = orderInfo.price * orderInfo.quantity - tradeData.quantity * tradeData.price

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
async function buyAsset(symbol: string): Promise<string> {
    const orderInfo = await binance.buyAsset(symbol)

    await db.controller.trades.addTrade({
        symbol: symbol,
        date: new Date(orderInfo.timestamp),
        price: orderInfo.price,
        tradeType: TradeType.BUY,
        tradeValue: config.trade.value,
        quantity: orderInfo.quantity,
    })
    return symbol
}

// function createLastPriceMap(ticker: ITicker) {
//     const priceMap = new Map()
//     ticker.priceList.map((pd) => priceMap.set(pd.symbol, pd.lastPrice))

//     return (symbol) => priceMap.get(symbol)
// }

type MakTradeRes = { soldSymbols: string[]; boughtSymbols: string[]; earnings: number }

/**
 *
 * @param sellAssets symbols to be sold
 * @param buyAssets symbols to be bought
 */
async function makeTrades(sellAssets: string[], buyAssets: string[]): Promise<MakTradeRes> {
    const sellTransactions = await Promise.allSettled(sellAssets.map((symbol) => sellAsset(symbol)))
    const buyTransactions = await Promise.allSettled(buyAssets.map((symbol) => buyAsset(symbol)))

    const soldSymbols = [],
        sellTrsctnErrors = []
    let earnings = 0
    sellTransactions.map((item) => {
        if (item.status === 'fulfilled') {
            //for sell transations, update performance history and get earnings
            symbolPerfHistory.updatePerf(item.value.symbol, item.value.pl)
            earnings += item.value.pl
            soldSymbols.push(item.value.symbol)
        } else {
            sellTransactions.push(item.reason)
        }
    })

    const buyTrsctnErrors = [],
        boughtSymbols = []

    buyTransactions.map((item) => {
        if (item.status == 'fulfilled') {
            boughtSymbols.push(item.value)
        } else {
            buyTrsctnErrors.push(item.reason)
        }
    })

    if (sellTrsctnErrors.length > 0 || buyTrsctnErrors.length > 0) {
        const allErrors = Log.error([sellTrsctnErrors, buyTrsctnErrors])
        alert.error(allErrors)
    }

    await db.controller.perfHistory.update(symbolPerfHistory.getAll())

    return { soldSymbols, boughtSymbols, earnings }
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

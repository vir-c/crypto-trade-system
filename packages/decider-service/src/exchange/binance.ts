import axios from 'axios'
import Binance, { Order } from 'binance-api-node'
import { config } from '../config'
import db from '../db'

// Authenticated client, can make signed calls
const binance = Binance({
    apiKey: config.exchange.binance.apiKey,
    apiSecret: config.exchange.binance.secretKey,
})

type orderInfo = { price: number; quantity: number; timestamp: number }

const calculatePrecision = (num: string) => {
    let i = 0
    while (num[i] != '1') i++
    return i
}

const isUSDT = (symbol) => symbol.toUpperCase().substr(-4) === 'USDT'

const symbolPrecisionMap = new Map()
const getInfo = async () => {
    const { data } = await axios.get('https://www.binance.com/api/v1/exchangeInfo')

    data.symbols
        .filter((item) => isUSDT(item.symbol))
        .map((item) => {
            const lotSize = item.filters.find((filter) => filter.filterType == 'LOT_SIZE')
            symbolPrecisionMap.set(item.symbol, calculatePrecision(lotSize.stepSize))
        })
}

const corretToStepSize = (symbol, num: number): string => {
    const precision = symbolPrecisionMap.get(symbol)
    const numStr = num.toString()
    return numStr.slice(0, numStr.indexOf('.') + precision)
}

const buyAsset = async (symbol: string): Promise<orderInfo> => {
    const order = await binance.order({
        symbol: symbol,
        side: 'BUY',
        quoteOrderQty: config.trade.value.toString(),
        type: 'MARKET',
    })

    return getOrderInfo(order)
}

const sellAsset = async (symbol: string, quantity: number): Promise<orderInfo> => {
    const order = await binance.order({
        symbol: symbol,
        side: 'SELL',
        quantity: corretToStepSize(symbol, quantity),
        type: 'MARKET',
    })

    return getOrderInfo(order)
}

const getOrderInfo = (order: Order): orderInfo => {
    const { quantity, totalQty, pq } = order.fills.reduce(
        (orderInfo, fill) => {
            orderInfo.quantity += parseFloat(fill.qty) - parseFloat(fill.commission)
            orderInfo.totalQty += parseFloat(fill.qty)
            orderInfo.pq += parseFloat(fill.price) * parseFloat(fill.qty)

            return orderInfo
        },
        { quantity: 0, totalQty: 0, pq: 0 }
    )

    return { quantity, price: pq / totalQty, timestamp: order.transactTime }
}

const getPrices = () => {
    return binance.prices()
}

const getAccountValue = async (): Promise<number> => {
    const [prices, accountInfo] = await Promise.all([getPrices(), binance.accountInfo()])
    return accountInfo.balances.reduce((value, item) => {
        if (item.asset === 'USDT') value += parseFloat(item.free) + parseFloat(item.locked)
        else {
            value += prices[item.asset + 'USDT']
                ? parseFloat(prices[item.asset + 'USDT']) * (parseFloat(item.free) + parseFloat(item.locked))
                : 0
        }

        return value
    }, 0)
}

export default {
    buyAsset,
    sellAsset,
    getInfo,
    getPrices,
    getAccountValue,
}

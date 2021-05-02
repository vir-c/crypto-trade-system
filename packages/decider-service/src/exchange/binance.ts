import Binance, { Order } from 'binance-api-node'
import { parse } from 'dotenv/types'
import { config } from '../config'

// Authenticated client, can make signed calls
const binance = Binance({
    apiKey: config.exchange.binance.apiKey,
    apiSecret: config.exchange.binance.secretKey,
})

type orderInfo = { price: number; quantity: number; timestamp: number }

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
        quantity: quantity.toString(),
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

export default {
    buyAsset,
    sellAsset,
}

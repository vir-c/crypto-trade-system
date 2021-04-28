import { CreateQuery } from 'mongoose'
import { ITrade, TradeModel } from '../models'

async function addTrade(trade: CreateQuery<ITrade>): Promise<ITrade> {
    return TradeModel.create(trade)
        .then((data) => {
            return data
        })
        .catch((error: Error) => {
            throw error
        })
}

async function getLastAssetTrade(symbol: string): Promise<ITrade> {
    return TradeModel.find({ symbol: symbol })
        .sort({ $natural: -1 })
        .limit(1)
        .then((data) => {
            return data[0]
        })
        .catch((error: Error) => {
            throw error
        })
}

export default {
    addTrade,
    getLastAssetTrade,
}

import { CreateQuery } from 'mongoose'
import { ITicker, TickerModel } from '../models'

async function addTicker(ticker: CreateQuery<ITicker>): Promise<ITicker> {
    return TickerModel.create(ticker)
        .then((data: ITicker) => {
            return data
        })
        .catch((error: Error) => {
            throw error
        })
}

export default {
    addTicker,
}

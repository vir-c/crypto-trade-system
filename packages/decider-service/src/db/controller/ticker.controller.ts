import { ITicker, TickerModel } from '../models'

async function getTickers(n: number): Promise<Array<ITicker>> {
    return TickerModel.find()
        .sort({ $natural: -1 })
        .limit(n)
        .then((data: Array<ITicker>) => {
            return data
        })
        .catch((error: Error) => {
            throw error
        })
}

export default {
    getTickers,
}

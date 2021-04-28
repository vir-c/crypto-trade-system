import { CreateQuery } from 'mongoose'
import { Holdings, HoldingsModel, IHoldings } from '../models'

async function addHoldings(holdings: CreateQuery<IHoldings>): Promise<Holdings> {
    return HoldingsModel.create(holdings)
        .then((data) => {
            return data
        })
        .catch((error: Error) => {
            throw error
        })
}

async function currentHoldings(): Promise<Holdings> {
    return HoldingsModel.find()
        .limit(1)
        .sort({ $natural: -1 })
        .then((data: IHoldings[]) => {
            return data[0]
        })
        .catch((error: Error) => {
            throw error
        })
}

export default {
    addHoldings,
    currentHoldings,
}

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

/**
 *
 * @param date ISODate
 * @returns {Promise<string>} Profit/Loss in last 12 hours and current holdings
 */
async function getPL(date: Date): Promise<{ holdings: string; pl: number }> {
    return HoldingsModel.find({ date: { $gt: date } })
        .sort({ $natural: -1 })
        .then((data: IHoldings[]) => {
            if (!data.length) return { holdings: '', pl: 0 }

            const currHoldings = data[0].assets.length ? data[0].assets.join(', ').slice(0, -1) : ''
            const pl = data[0].totalPL - data[data.length - 1].totalPL

            return { holdings: currHoldings, pl: pl }
        })
}

export default {
    addHoldings,
    currentHoldings,
    getPL,
}

import { IExchange, PriceData } from '../../exchange.interface'
import axios from 'axios'
import util from 'util'
import promisepool from '@supercharge/promise-pool'
import { filter } from 'ramda'

const config = {
    base: 'https://api.binance.com',
    endpoints: {
        ticker24hr: '/api/v3/ticker/24hr',
        avgPrice5min: '/api/v3/avgPrice',
    },
}

const isUSDT = (x: PriceData) => x.symbol.toUpperCase().substr(-4) === 'USDT'
const filterUSDTPairs = filter(isUSDT)

export class Binance implements IExchange {
    async getTickers() {
        try {
            const { data }: { data: [PriceData] } = await axios.get(config.base + config.endpoints.ticker24hr)
            //filter USDT pairs
            const priceListUSDT = filterUSDTPairs(data)
            const { results, errors } = await promisepool.for(priceListUSDT).process(async (item) => {
                const { data }: { data: { mins: number; price: string } } = await axios.get(
                    config.base + config.endpoints.avgPrice5min + `?symbol=` + item.symbol
                )
                if (data.mins == 5) item.avgPrice5min = parseFloat(data.price)
                item.avgPrice24hr = parseFloat(item['weightedAvgPrice'])
            })

            if (errors) {
                console.log(errors)
            }

            return priceListUSDT
        } catch (error) {
            console.log('Failed to fetch ticker data for Binance...', util.inspect(error, { depth: null }))
        }
    }
}

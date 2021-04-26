import { IExchange, PriceData } from '../../exchange.interface'
import axios from 'axios'
import util from 'util'

const config = {
    base: 'https://api.binance.com',
    endpoints: {
        ticker24hr: '/api/v3/ticker/24hr',
    },
}

export class Binance implements IExchange {
    async getTickers() {
        try {
            const { data }: { data: [PriceData] } = await axios.get(config.base + config.endpoints.ticker24hr)
            return data
        } catch (error) {
            console.log('Failed to fetch ticker data for Binance...', util.inspect(error, { depth: null }))
        }
    }
}

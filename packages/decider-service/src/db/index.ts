import connect from './connect'
import ticker from '../db/controller/ticker.controller'
import holdings from '../db/controller/holdings.controller'
import trades from '../db/controller/trades.controller'
import perfHistory from '../db/controller/perfHistory.controller'

export default {
    connect: connect,
    controller: {
        ticker,
        trades,
        holdings,
        perfHistory,
    },
}

import { telegram } from '../../../shared/node'
import { config } from './config'
import db from './db'

const error = (message: string) => {
    const alertMsg = ` __*Error Encountered*__        ${message}`
    telegram.sendMessage(config.telegram.botURL, config.telegram.chatId, alertMsg)
}

const dailyPL = async () => {
    const dateTime12HrsBefore = new Date(new Date(new Date().getTime() - 12 * 60 * 60 * 1000))

    const { holdings, pl } = await db.controller.holdings.getPL(dateTime12HrsBefore)

    const message = ` 
    __*Daily PL:*__ ${getTime()}
    
    Last 12 hrs info
    
    Profit/Loss: ${pl}
    current holdings: ${holdings}

    `
    telegram.sendMessage(config.telegram.botURL, config.telegram.chatId, message)
}

const getTime = () => {
    const dateInfo = new Date().toString().split(':')
    return dateInfo[0] + ':' + dateInfo[1]
}

export default {
    error,
    dailyPL,
}

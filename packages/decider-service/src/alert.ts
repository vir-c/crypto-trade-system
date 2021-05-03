import { telegram } from '../../../shared/node'
import { config } from './config'
import db from './db'
import binance from './exchange/binance'

const error = (message: string) => {
    const alertMsg = ` __*Error Encountered*__        ${message}`
    telegram.sendMessage(config.telegram.botURL, config.telegram.chatId, alertMsg)
}

const dailyPL = async () => {
    const dateTime12HrsBefore = new Date(new Date(new Date().getTime() - 3 * 60 * 60 * 1000))

    const { holdings, pl } = await db.controller.holdings.getPL(dateTime12HrsBefore)
    const accountValue = await binance.getAccountValue()

    const message = ` 
    __*Info Alert:*__  ${getTime()}
    
    Profit/Loss: ${pl}
    current holdings: ${holdings}
    Account Value: ${accountValue}
    `
        .replace(/\./g, '\\.') //fix telegram markdown parse issue
        .replace(/\-/g, '\\-')

    telegram.sendMessage(config.telegram.botURL, config.telegram.chatId, message, true)
}

const getTime = () => {
    const dateInfo = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }).split(':')
    return dateInfo[0] + ':' + dateInfo[1]
}

export default {
    error,
    dailyPL,
}

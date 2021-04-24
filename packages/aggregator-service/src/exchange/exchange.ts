/**
 * Adapator to get ticker from different exchanges
 */
import { IExchange } from './exchange.interface'

export class ExchangeAdaptor {
  private exchange: IExchange

  constructor(exchange: IExchange) {
    this.exchange = exchange
  }

  setExchange(exchange: IExchange) {
    this.exchange = exchange
  }

  getTickers(): ReturnType<IExchange['getTickers']> {
    return this.exchange.getTickers()
  }
}

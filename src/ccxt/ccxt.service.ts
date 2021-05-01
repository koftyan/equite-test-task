import { Injectable } from '@nestjs/common';
import * as ccxt from 'ccxt';

export interface IPrices {
  [symbol: string]: {
    [date: string]: number;
  };
}

@Injectable()
export class CcxtService {
  private _binance: ccxt.Exchange;
  private _bybit: ccxt.Exchange;
  private _bitmex: ccxt.Exchange;
  constructor() {
    const commonOptions = { enableRateLimit: true };
    this._binance = new ccxt.binance(commonOptions);
    this._bitmex = new ccxt.bitmex(commonOptions);
    this._bybit = new ccxt.bybit(commonOptions);
  }
  async getPrices(
    exchange: string,
    symbols: string[],
    dates: string[],
  ): Promise<IPrices> {
    await this[exchange].loadMarkets();
    const prices: IPrices = {};
    if (this[exchange].has.fetchOHLCV) {
      for (const symbol of symbols) {
        const candles = await this.fetchCandlesForDates(
          exchange,
          symbol,
          dates,
        );
        prices[symbol] = candles;
      }
    }
    return prices;
  }
  async fetchCandlesForDates(
    exchange: string,
    symbol: string,
    dates: string[],
  ) {
    const isValidSymbol = this[exchange].symbols.includes(symbol);
    if (!isValidSymbol) return 'Invalid symbol';
    if (dates.length === 0) return {};
    // Преобразуем даты из ISO8601 стандарта в Unix timestamp
    // Сортируем их в порядке возрастания
    const unixDates = dates.map((d: string) => new Date(d).getTime()).sort();
    const candles = await this.fetchOHLCV(exchange, symbol, '1d', unixDates[0]);
    const filteredCandles = candles.filter((c) => unixDates.includes(c[0]));
    let datePriceObject = filteredCandles.reduce((acc, cur) => {
      const date = dates.find((d) => new Date(d).getTime() === cur[0]);
      acc[date] = cur[1];
      return acc;
    }, {});
    // Если первой даты нет
    if (filteredCandles.length === 0) {
      datePriceObject = await this.fetchCandlesForDates(
        exchange,
        symbol,
        dates.slice(1),
      );
    }
    // Если получили данные не для всех дат
    if (
      filteredCandles.length !== 0 &&
      filteredCandles.length < unixDates.length
    ) {
      const receivedDates = filteredCandles.map((c) => c[0]);
      const datesToReceive = dates.filter(
        (d) => !receivedDates.includes(new Date(d).getTime()),
      );
      datePriceObject = {
        ...datePriceObject,
        ...(await this.fetchCandlesForDates(exchange, symbol, datesToReceive)),
      };
    }
    return datePriceObject;
  }
  async fetchOHLCV(
    exchange: string,
    symbol: string,
    timeframe = '1d',
    since = undefined,
    limit = undefined,
    params = {},
  ) {
    const exchangeInstance = this[exchange];
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    await sleep(exchangeInstance.rateLimit);
    return exchangeInstance.fetchOHLCV(symbol, timeframe, since, limit, params);
  }
  get binance(): ccxt.Exchange {
    return this._binance;
  }
  get bitmex(): ccxt.Exchange {
    return this._bitmex;
  }
  get bybit(): ccxt.Exchange {
    return this._bybit;
  }
}

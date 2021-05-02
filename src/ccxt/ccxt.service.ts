import { Injectable } from '@nestjs/common';
import * as ccxt from 'ccxt';

export interface IPrices {
  [symbol: string]: {
    [date: string]: number | string;
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
  /**
   * Получает цены для перечисленных торговых пар в указанные даты
   * @param exchange Название биржи
   * @param symbols Массив с торговыми парами
   * @param dates Массив дат
   * @returns Объект, где для каждой торговой пары сопоставлен объект
   *  с датами в качестве ключа и ценами в качестве значения
   */
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
          symbol.trim(),
          dates,
        );
        prices[symbol] = candles;
      }
    }
    return prices;
  }
  /**
   * Получает цены для одной торговой пары в указанные даты
   * @param exchange Название биржи
   * @param symbol Название конкретной торговой пары
   * @param dates Массив дат
   * @returns Объект { дата => цена } - если цены для дат присутствуют
   * Строку 'Invalid symbol' если наименование торговой пары отсутствует на бирже
   */
  async fetchCandlesForDates(
    exchange: string,
    symbol: string,
    dates: string[],
  ): Promise<any> {
    const isValidSymbol = this[exchange].symbols.includes(symbol);
    if (!isValidSymbol) return 'Invalid symbol';
    if (dates.length === 0) return {}; // Для пустого массива дат - выход из рекурсии
    // Преобразуем даты из ISO8601 стандарта в Unix timestamp
    // Сортируем их в порядке возрастания
    const unixDates = dates.map((d: string) => new Date(d).getTime()).sort();
    // Получаем свечки начиная с ранней даты
    const candles = await this.fetchOHLCV(exchange, symbol, '1d', unixDates[0]);
    // Отсавляем только те свечи, которые относятся к требуемым датам
    const filteredCandles = candles.filter((c) => unixDates.includes(c[0]));
    // Формируем конечный объект
    let datePriceObject = filteredCandles.reduce((acc, cur) => {
      const date = dates.find((d) => new Date(d).getTime() === cur[0]);
      acc[date] = cur[1];
      return acc;
    }, {});
    // Если первой даты нет, то рекурсивно повторяем попытку
    // но передаем массив дат без первой даты
    if (filteredCandles.length === 0) {
      datePriceObject = await this.fetchCandlesForDates(
        exchange,
        symbol,
        dates.slice(1),
      );
    }
    // Если получили данные, но не для всех дат
    if (
      filteredCandles.length !== 0 &&
      filteredCandles.length < unixDates.length
    ) {
      // Формируем массив дат, для которых данные уже есть
      const receivedDates = filteredCandles.map((c) => c[0]);
      // Выясняем даты, для которых необходимо получить данные
      const datesToReceive = dates.filter(
        (d) => !receivedDates.includes(new Date(d).getTime()),
      );
      // Склеиваем полученные данные с новыми
      datePriceObject = {
        ...datePriceObject,
        ...(await this.fetchCandlesForDates(exchange, symbol, datesToReceive)),
      };
    }
    return datePriceObject;
  }
  /**
   * Получить свечи для заданной биржи, выждав необходимый таймаут
   * @param exchange Название биржи
   * @param symbol Торговая пара
   * @param timeframe Диапазон
   * @param since Начальная дата
   * @param limit Лимит
   * @param params ДОполнительные параметры
   * @returns Массив со свечами
   */
  async fetchOHLCV(
    exchange: string,
    symbol: string,
    timeframe = '1d',
    since = undefined,
    limit = undefined,
    params = {},
  ): Promise<number[][]> {
    const exchangeInstance = this[exchange];
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    await sleep(exchangeInstance.rateLimit);
    return exchangeInstance.fetchOHLCV(symbol, timeframe, since, limit, params);
  }
  // Геттеры для инстансов бирж
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

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PriceModule } from '../src/price/price.module';
import { PriceController } from '../src/price/price.controller';
import { PriceService } from '../src/price/price.service';
import { CcxtService } from '../src/ccxt/ccxt.service';

describe('PriceController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PriceModule],
      controllers: [PriceController],
      providers: [PriceService, CcxtService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });
  afterEach(async () => {
    await app.close();
  });

  const validBinanceUrl =
    '/price?exchange=binance&symbols[]=BTC/USDT&dates[]=2020-02-01';
  it(`${validBinanceUrl} (GET) returns price for one symbol and given date`, async () => {
    const { body } = await request(app.getHttpServer())
      .get(validBinanceUrl)
      .expect(200);
    expect(body).toHaveProperty('BTC/USDT');
    expect(body['BTC/USDT']).toHaveProperty('2020-02-01');
    expect(body['BTC/USDT']['2020-02-01']).toEqual(9351.71);
  });
  const validBybitUrl =
    '/price?exchange=bybit&symbols[]=BTC/USDT&dates[]=2021-03-01';
  it(`${validBybitUrl} (GET) returns price for one symbol and given date`, async () => {
    const { body } = await request(app.getHttpServer())
      .get(validBybitUrl)
      .expect(200);
    expect(body).toHaveProperty('BTC/USDT');
    expect(body['BTC/USDT']).toHaveProperty('2021-03-01');
    expect(body['BTC/USDT']['2021-03-01']).toEqual(45156);
  });
  const validBitmexUrl =
    '/price?exchange=bitmex&symbols[]=BTC/USD&dates[]=2020-02-01';
  it(`${validBitmexUrl} (GET) returns price for one symbol and given date`, async () => {
    const { body } = await request(app.getHttpServer())
      .get(validBitmexUrl)
      .expect(200);
    expect(body).toHaveProperty('BTC/USD');
    expect(body['BTC/USD']).toHaveProperty('2020-02-01');
    expect(body['BTC/USD']['2020-02-01']).toEqual(9339.5);
  });
  const validUrlWithManySymbolsAndManyDates =
    '/price?exchange=binance&symbols[]=BTC/USDT&symbols[]=ETH/BTC&dates[]=2020-02-01&dates[]=2020-04-01';
  it(`${validUrlWithManySymbolsAndManyDates} (GET) returns price for one symbol and given date`, async () => {
    const { body } = await request(app.getHttpServer())
      .get(validUrlWithManySymbolsAndManyDates)
      .expect(200);
    expect(body).toHaveProperty('BTC/USDT');
    expect(body['BTC/USDT']).toHaveProperty('2020-02-01');
    expect(body['BTC/USDT']).toHaveProperty('2020-04-01');
    expect(body['BTC/USDT']['2020-02-01']).toEqual(9351.71);
    expect(body['BTC/USDT']['2020-04-01']).toEqual(6412.14);
    expect(body).toHaveProperty('ETH/BTC');
    expect(body['ETH/BTC']).toHaveProperty('2020-02-01');
    expect(body['ETH/BTC']).toHaveProperty('2020-04-01');
    expect(body['ETH/BTC']['2020-02-01']).toEqual(0.019244);
    expect(body['ETH/BTC']['2020-04-01']).toEqual(0.020706);
  });
  const validUrlWithGaps =
    '/price?exchange=binance&symbols[]=BTC/USDT&symbols[]=TWT/USDT&dates[]=2020-02-04';
  it(`${validUrlWithGaps} (GET) returns price for one symbol and given date`, async () => {
    const { body } = await request(app.getHttpServer())
      .get(validUrlWithGaps)
      .expect(200);
    expect(body).toHaveProperty('BTC/USDT');
    expect(body['BTC/USDT']).toHaveProperty('2020-02-04');
    expect(body['BTC/USDT']['2020-02-04']).toEqual(9291.35);
    expect(body).toHaveProperty('TWT/USDT');
    expect(body['TWT/USDT']).toEqual({});
  });
  const urlWithInvalidDate =
    '/price?exchange=binance&symbols[]=BTC/USDT&dates[]=2020-02-32';
  it(`${urlWithInvalidDate} (GET) returns price for one symbol and given date`, async () => {
    const { body } = await request(app.getHttpServer())
      .get(urlWithInvalidDate)
      .expect(400);
    expect(body.message[0]).toEqual(
      'each value in dates must be a valid ISO 8601 date string',
    );
  });
  const urlWithInvalidSymbol =
    '/price?exchange=binance&symbols[]=NONE/NONE&dates[]=2020-02-01';
  it(`${urlWithInvalidSymbol} (GET) returns price for one symbol and given date`, async () => {
    const { body } = await request(app.getHttpServer())
      .get(urlWithInvalidSymbol)
      .expect(200);
    expect(body).toHaveProperty('NONE/NONE');
    expect(body['NONE/NONE']).toEqual('Invalid symbol');
  });
  const noParamsUrl = '/price';
  it(`${noParamsUrl} (GET) fails with no params`, async () => {
    const { body } = await request(app.getHttpServer())
      .get(noParamsUrl)
      .expect(400);
    expect(body.message.length).toEqual(5);
    expect(body.message[0]).toBe(
      'exchange must be one of the following values: binance, bitmex, bybit',
    );
    expect(body.message[1]).toBe('each value in symbols must be a string');
    expect(body.message[2]).toBe('symbols must be an array');
    expect(body.message[3]).toBe(
      'each value in dates must be a valid ISO 8601 date string',
    );
    expect(body.message[4]).toBe('dates must be an array');
  });
  const onlyExchangeUrl = '/price?exchange=abc';
  it(`${onlyExchangeUrl} (GET) fails if exchange name wrong`, async () => {
    const { body } = await request(app.getHttpServer())
      .get(onlyExchangeUrl)
      .expect(400);
    expect(body.message.length).toEqual(5);
    expect(body.message[0]).toBe(
      'exchange must be one of the following values: binance, bitmex, bybit',
    );
    expect(body.message[1]).toBe('each value in symbols must be a string');
    expect(body.message[2]).toBe('symbols must be an array');
    expect(body.message[3]).toBe(
      'each value in dates must be a valid ISO 8601 date string',
    );
    expect(body.message[4]).toBe('dates must be an array');
  });
  const noDatesUrl = '/price?exchange=binance&symbols[]=BTC/USDT';
  it(`${noDatesUrl} (GET) fails if no dates provided`, async () => {
    const { body } = await request(app.getHttpServer())
      .get(noDatesUrl)
      .expect(400);
    expect(body.message.length).toEqual(2);
    expect(body.message[0]).toBe(
      'each value in dates must be a valid ISO 8601 date string',
    );
    expect(body.message[1]).toBe('dates must be an array');
  });
  const noSymbolsUrl = '/price?exchange=abc&dates[]=2020-02-01';
  it(`${noSymbolsUrl} (GET) fails if no symbols provided`, async () => {
    const { body } = await request(app.getHttpServer())
      .get(noSymbolsUrl)
      .expect(400);
    expect(body.message.length).toEqual(3);
    expect(body.message[1]).toBe('each value in symbols must be a string');
    expect(body.message[2]).toBe('symbols must be an array');
  });
});

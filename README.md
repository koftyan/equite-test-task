

## Установка

```bash
$ npm install
```

## Запуск

```bash
# development
$ npm run start
```
## Описание
Запрос по пути вида:

```http://localhost:3000/price?exchange=binance&symbols[]=BTC/USDT&symbols[]=ADA/USDT&dates[]=2020-02-01&dates[]=2021-01-01```

возвращает json вида:

```json
{
  "BTC/USDT":{
    "2020-02-01":9351.71,
    "2021-01-01":28923.63
  },
  "ADA/USDT":{
    "2020-02-01":0.0539,
    "2021-01-01":0.18134
  }
}
```
Если для указанных дат цена на бирже отсутствует, то для торговой пары возвращается пустой объект
```json
{"BTC/USDT":{"2020-02-04":9291.35},"TWT/USDT":{}}
```
Если дата введена некорректно, то вернется ошибка
```json
{"statusCode":400,"message":["each value in dates must be a valid ISO 8601 date string"],"error":"Bad Request"}
```
Если торговая пара отсутсвует на бирже, то для нее вернется строка 'Invalid symbol'
```json
{"BTC/USD":{"2020-02-04":9282},"TWT/USDT":"Invalid symbol"}
```
Если один из параметров не передан, то вернется ошибка, например:
```json
{"statusCode":400,"message":["each value in dates must be a valid ISO 8601 date string","dates must be an array"],"error":"Bad Request"}
```
Другие варианты описаны в Е2Е тестах
## Визуализация данных
При переходе по адресу 
```
http://localhost:3000/
```
открывается страница с возможностью отобразить график изменения цены для заданных параметров.
## Е2Е тесты

```bash
# e2e tests
$ npm run test:e2e
```
Тестами покрыты следующие варианты:
- `/price?exchange=binance&symbols[]=BTC/USDT&dates[]=2020-02-01`
- `/price?exchange=bybit&symbols[]=BTC/USDT&dates[]=2021-03-01`
- `/price?exchange=bitmex&symbols[]=BTC/USD&dates[]=2020-02-01`
- `/price?exchange=binance&symbols[]=BTC/USDT&symbols[]=ETH/BTC&dates[]=2020-02-01&dates[]=2020-04-01`
- `/price?exchange=binance&symbols[]=BTC/USDT&symbols[]=TWT/USDT&dates[]=2020-02-04`
- `/price?exchange=binance&symbols[]=BTC/USDT&dates[]=2020-02-32`
- `/price?exchange=binance&symbols[]=NONE/NONE&dates[]=2020-02-01`
- `/price`
- `/price?exchange=abc`
- `/price?exchange=binance&symbols[]=BTC/USDT`
- `/price?exchange=abc&dates[]=2020-02-01`
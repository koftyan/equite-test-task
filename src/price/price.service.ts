import { Injectable } from '@nestjs/common';
import { CcxtService } from 'src/ccxt/ccxt.service';

@Injectable()
export class PriceService {
  constructor(private ccxtService: CcxtService) {}
  async getPrice(
    exchange: string,
    symbols: string[],
    dates: string[],
  ): Promise<any> {
    const prices = await this.ccxtService.getPrices(exchange, symbols, dates);
    return prices;
  }
}

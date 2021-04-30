import { Injectable } from '@nestjs/common';

@Injectable()
export class PriceService {
  getPrice(exchange, symbols): Promise<any> {
    return new Promise((resolve) =>
      resolve(`Exchange: ${exchange}<br>Symbols: ${symbols}`),
    );
  }
}

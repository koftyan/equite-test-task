import { Controller, Get, Param, Req } from '@nestjs/common';
import { PriceService } from './price.service';
import { Request } from 'express';

@Controller('price')
export class PriceController {
  constructor(private priceService: PriceService) {}

  @Get()
  async getPrice(@Req() request: Request) {
    return `Request: ${request}`;
  }
  // async getPrice(@Param('exchange') exchange, @Param('symbols') symbols) {
  //   const price = await this.priceService.getPrice(exchange, symbols);
  //   return price;
  // }
}

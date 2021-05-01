import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { GetPricesDto } from './dto/GetPrices.dto';
import { PriceService } from './price.service';

@Controller('price')
export class PriceController {
  constructor(private priceService: PriceService) {}

  @Get()
  async getPrice(
    @Query(new ValidationPipe({ transform: true }))
    query: GetPricesDto,
  ) {
    const { exchange, symbols, dates } = query;
    const price = await this.priceService.getPrice(exchange, symbols, dates);
    return price;
  }
}

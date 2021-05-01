import { Module } from '@nestjs/common';
import { CcxtService } from '../ccxt/ccxt.service';
import { PriceController } from './price.controller';
import { PriceService } from './price.service';

@Module({
  controllers: [PriceController],
  providers: [PriceService, CcxtService],
})
export class PriceModule {}

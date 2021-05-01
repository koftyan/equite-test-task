import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PriceModule } from './price/price.module';
// import { CcxtService } from './ccxt/ccxt.service';

@Module({
  imports: [PriceModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

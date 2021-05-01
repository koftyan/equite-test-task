import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsIn, IsString } from 'class-validator';

export class GetPricesDto {
  @IsIn(['binance', 'bitmex', 'bybit'])
  exchange: string;
  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  symbols: string[];
  @IsArray()
  // @Type(() => Date)
  @IsDateString({ strict: true }, { each: true })
  dates: string[];
}

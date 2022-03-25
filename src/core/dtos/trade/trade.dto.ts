import {
    IsNotEmpty,
    IsString,
    IsNumber
  } from "class-validator";
import { COIN_TYPES, TRADE_TYPE } from "src/lib/constants";
export class TradeDto{

    @IsString()
    type: TRADE_TYPE

    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @IsNotEmpty()
    @IsString()
    currency: COIN_TYPES

}
import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator";
import { CryptoPairType } from "src/core/entities/wallet.entity";
import { PaginationType } from "src/core/types/database";
import { SwapableCoin } from "../trade/swap.dto";


export enum RateCurrencies {
  BITCOIN = "bitcoin",
  ETHEREUM = "ethereum",
  STELLAR = "stellar",
  RIPPLE = "ripple",
  CELO = "celo"
}

export enum RateBaseCurrencies {
  NGN = "ngn",
  USD = "usd",
  EUR = "eur",
}

// AED,AFN,ALL,AMD,ANG,AOA,ARS,AUD,AWG,AZN,BAM,BBD,BDT,BGN,BHD,BIF,BMD,BND,BOB,BRL,BSD,BTN,BWP,BYN,BYR,BZD,CAD,CDF,CHF,CLF,CLP,CNY,COP,CRC,CUC,CUP,CVE,CZK,DJF,DKK,DOP,DZD,EGP,ERN,ETB,EUR,FJD,FKP,GBP,GEL,GGP,GHS,GIP,GMD,GNF,GTQ,GYD,HKD,HNL,HRK,HTG,HUF,IDR,ILS,IMP,INR,IQD,IRR,ISK,JEP,JMD,JOD,JPY,KES,KGS,KHR,KMF,KPW,KRW,KWD,KYD,KZT,LAK,LBP,LKR,LRD,LSL,LTL,LVL,LYD,MAD,MDL,MGA,MKD,MMK,MNT,MOP,MRO,MUR,MVR,MWK,MXN,MYR,MZN,NAD,NGN,NIO,NOK,NPR,NZD,OMR,PAB,PEN,PGK,PHP,PKR,PLN,PYG,QAR,RON,RSD,RUB,RWF,SAR,SBD,SCR,SDG,SEK,SGD,SHP,SLL,SOS,SRD,STD,SVC,SYP,SZL,THB,TJS,TMT,TND,TOP,TRY,TTD,TWD,TZS,UAH,UGX,USD,UYU,UZS,VEF,VND,VUV,WST,XAF,XAG,XAU,XCD,XDR,XOF,XPF,YER,ZAR,ZMK,ZMW,ZWL

export class HistoricDataDto {

  @IsNotEmpty()
  @IsString()
  coin: string;

  @IsNotEmpty()
  @IsString()
  base: string;

  @IsNotEmpty()
  @IsString()
  days: string;

  @IsNotEmpty()
  @IsString()
  interval: string;

}
export class SingleRateDto {

  @IsNotEmpty()
  @IsEnum(RateBaseCurrencies)
  base: string;


  @IsNotEmpty()
  @IsEnum(RateCurrencies)
  sub: string;

}

export enum TatumBaseCurrency {
  USD = 'USD',
  NGN = 'NGN'
}
export class ExchangeRateDto {
  @IsNotEmpty()
  @IsEnum(TatumBaseCurrency)
  base: string;


  @IsNotEmpty()
  @IsEnum(SwapableCoin)
  coin: string;

}
export class CreateExchangeRateDto {
  @IsNotEmpty()
  @IsString()
  coin: string

  @IsNotEmpty()
  @IsNumber()
  buyRate: number

  @IsNotEmpty()
  @IsNumber()
  sellRate: number

}

export type ICreateExchangeRate = CreateExchangeRateDto & {
  userId: string
}

export type IGetExchangeRates = PaginationType & {
  userId: string
  coin: string

}

export class FindByPairDto {
  @IsNotEmpty()
  @IsEnum(CryptoPairType)
  public readonly pair: CryptoPairType;

}

export class FindByCoinDto {
  @IsNotEmpty()
  @IsString()
  public readonly coin: string;

}

export class ConvertByPairDto {

  @IsNotEmpty()
  @Type(() => Number)
  @IsPositive()
  public readonly amount: number;


  @IsNotEmpty()
  @IsString()
  public readonly source: string;

  @IsNotEmpty()
  @IsString()
  public readonly destination: string;


}

export type IConvertByPair = ConvertByPairDto & {}
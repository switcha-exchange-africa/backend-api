import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsObject, IsOptional, IsPositive, IsString } from "class-validator";
import { WebPushKey } from "src/core/entities/WebPush";

export class WebPushKeyDto {

  @IsNotEmpty()
  @IsString()
  public readonly auth: string

  @IsNotEmpty()
  @IsString()
  public readonly p256dh: string

}
export class WebPushDto {


  @IsOptional()
  @IsString()
  public readonly endpoint: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  public readonly expirationTime: number;

  @IsNotEmpty()
  @IsObject()
  @Type(() => WebPushKeyDto)
  public readonly key: WebPushKey;
}
export type IWebPush = WebPushDto & {
  userId: string
}
import { IsNotEmpty, IsString } from "class-validator";
import { Types } from "mongoose";
import { PaginationType } from "src/core/types/database";

export type IGetTradeDisputes = PaginationType & {
  userId: string;
  tradeId: string
  disputeId: string
  resolvedBy: string
  resolveAdminBy: string
  email?: string
  status: string
  seller: string
  buyer: string
}
export class CreateTradeDisputeDto {
  @IsNotEmpty()
  @IsString()
  public readonly buyer: string

  @IsNotEmpty()
  @IsString()
  public readonly seller: string

  @IsNotEmpty()
  @IsString()
  public readonly tradeId: string

}




export type ICreateTradeDispute = CreateTradeDisputeDto & {
  userId: string;
  email: string
}

export type IGetSingleTradeDispute = {
  id: Types.ObjectId
  email: string
}
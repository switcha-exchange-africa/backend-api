import { IsNotEmpty, IsString } from "class-validator";
import { PaginationType } from "src/core/types/database";



export class AddKycDto {

  @IsNotEmpty()
  @IsString()
  public readonly image: string

  @IsNotEmpty()
  @IsString()
  public readonly selfie: string

}



export type IGetKyc = PaginationType & {
  userId: string,
  status: string,
}

export type IKyc = AddKycDto & {
  userId: string
}
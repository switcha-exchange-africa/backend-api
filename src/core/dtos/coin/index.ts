import { IsNotEmpty, IsString } from "class-validator";

export class AddCoinDto {
    @IsNotEmpty()
    @IsString()
    public readonly coin: string

}

export type IAddCoin = AddCoinDto & {
    userId: string
}


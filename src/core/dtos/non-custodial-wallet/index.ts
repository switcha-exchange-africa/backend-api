import { IsNotEmpty, IsString } from "class-validator";

export class GenerateNonCustodialWalletDto {
    @IsNotEmpty()
    @IsString()
    public readonly coin: string
}

export type IGenerateNonCustodialWallet = GenerateNonCustodialWalletDto & {
    userId: string
    email: string
}
import { IsNotEmpty, IsString } from "class-validator";


export class HistoricDataDto{

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

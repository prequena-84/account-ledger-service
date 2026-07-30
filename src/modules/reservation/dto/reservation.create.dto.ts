import { IsUUID, IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateReservationDto {
  @IsUUID()
  @IsNotEmpty()
  transaction_id: string;

  @IsString()
  @IsNotEmpty()
  account_id: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;
}

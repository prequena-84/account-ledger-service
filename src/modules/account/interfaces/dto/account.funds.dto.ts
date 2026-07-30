import { IsNotEmpty, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class AccountFundsDTO {
    @IsNumber()
    @IsNotEmpty()
    @Transform(({ value }) => Number(value))
    amount: number;
};
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { CurrencyEnum, AccountStatusEnum } from '../../domain/enum/account.enum';
import type { IAccount } from '../../domain/types/account.interfaces';
import type { TCurrency, TStatus } from '../../domain/types/account.types';

export class AccountCreateDTO implements Pick<IAccount, 'account_id' | 'currency' | 'status'> {
    @IsString()
    @IsNotEmpty()
    account_id: string;

    @IsEnum(CurrencyEnum)
    @IsNotEmpty()
    currency: TCurrency;

    @IsEnum(AccountStatusEnum)
    @IsNotEmpty()
    status: TStatus;
};
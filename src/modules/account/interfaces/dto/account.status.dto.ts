import { IsEnum, IsNotEmpty } from 'class-validator';
import { AccountStatusEnum } from '../../domain/enum/account.enum';
import type { IAccount } from '../../domain/types/account.interfaces';
import type { TStatus } from '../../domain/types/account.types';

export class AccountStatusDTO implements Pick<IAccount, 'status'> {
    @IsEnum(AccountStatusEnum)
    @IsNotEmpty()
    status: TStatus;
};
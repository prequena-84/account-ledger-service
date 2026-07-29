import type { TCurrency, TStatus } from "./account.types";

export interface IAccount {
    account_id: string;
    available_balance: number;
    reserved_balance: number;
    total_balance: number;
    currency: TCurrency;
    status: TStatus;
    version: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
}
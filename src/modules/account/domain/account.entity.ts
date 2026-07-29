import { Entity, PrimaryColumn, Column, VersionColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";
import { CurrencyEnum, AccountStatusEnum } from "./enum/account.enum";
import { numericTransformer } from "./transformer/account.transformer";
import type { IAccount } from "./types/account.interfaces";
import type { TCurrency, TStatus } from "./types/account.types";

@Entity({ name: 'accounts' })
export class AccountEntity implements IAccount {
    // Registro de cuenta Ej: 'ACC-100'
    @PrimaryColumn({
        type: 'varchar',
        length: 50,
    })
    account_id: string;

    @Column({
        type: 'decimal',
        precision: 12,
        scale: 2,
        default: 0,
        transformer: numericTransformer,
    })
    available_balance: number;

    @Column({
        type: 'decimal',
        precision: 12,
        scale: 2,
        default: 0,
        transformer: numericTransformer,
    })
    reserved_balance: number;

    @Column({
        type: 'decimal',
        precision: 12,
        scale: 2,
        default: 0,
        transformer: numericTransformer,
    })
    total_balance: number;

    @Column({
        type: 'enum',
        enum: CurrencyEnum,
        default: CurrencyEnum.USD,
    })
    currency: TCurrency;

    @Column({
        type: 'enum',
        enum: AccountStatusEnum,
        default: AccountStatusEnum.ACTIVE,
    })
    status: TStatus;

    // Concurrencia Optimista
    @VersionColumn()
    version: number;

    @CreateDateColumn({
        type: 'timestamptz',
    })
    createdAt: Date;

    @UpdateDateColumn({
        type: 'timestamptz',
    })
    updatedAt: Date;

    @DeleteDateColumn({
        type: 'timestamptz',
        nullable: true,
    })
    deletedAt: Date | null;
};
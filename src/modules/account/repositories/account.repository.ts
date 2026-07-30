import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountEntity } from '../domain/account.entity';
import { AccountCreateDTO } from '../interfaces/dto/account.create.dto'; 
import { AccountStatusEnum } from '../domain/enum/account.enum';
import type { TStatus } from '../domain/types/account.types';

@Injectable()
export class AccountRepository {
    constructor(
        @InjectRepository(AccountEntity)
        private readonly accountRepository: Repository<AccountEntity>
    ) {};

    // 1. Crear Cuenta (Basado en tu SQL)
    async createAccount(data: AccountCreateDTO): Promise<AccountEntity> {
        const newAccount = this.accountRepository.create(data);
        return this.accountRepository.save(newAccount);
    };

    // 2. Buscar Cuenta por ID
    async findId(accountId: string): Promise<AccountEntity> {
        const account = await this.accountRepository.findOne({ 
            where: {account_id: accountId} 
        });
        if (!account) throw new NotFoundException(`No se encontro la cuenta ${accountId}`);
        return account;
    };

    // 3. Actualizar Cuenta (Basado en tu SQL)
    async updateAccount(accountId: string, amount: number): Promise<AccountEntity> {

        // Nota Tecnica: En una transacción real, esto iría dentro de un QueryRunner de TypeORM
        const account = await this.accountRepository.findOne({
            where: { account_id: accountId },
            lock: { mode: 'pessimistic_write' }, 
        });

        // Validacion de la cuenta del cliente
        if (!account) throw new NotFoundException(`No se encontro la cuenta ${accountId}`);
        
        // Validacion del estado de la cuenta del cliente
        if (account.status !== AccountStatusEnum.ACTIVE) throw new BadRequestException(`Operación denegada: La cuenta ${accountId} está ${account.status}.`);
        
        // Validacion de los fondos disponibles del cliente
        if (account.available_balance < amount) throw new BadRequestException(`Fondos insuficientes para la operacion ${accountId}.`);
        
        // Hacemos el movimiento de forma segura
        account.available_balance -= amount;
        account.reserved_balance += amount;

        // El 'total_balance' se puede actualizar sumando lo que queda en available y reserved
        return this.accountRepository.save(account);
    };

    /**
     * 4. Actualizacion de estado de la cuenta (Update genérico administrativo)
     * Utiliza Bloqueo Optimista automático de TypeORM (requiere que mandes la versión actual)
     */
    async updateStatus(accountId: string, newStatus: TStatus): Promise<AccountEntity> {
        // Reutilizamos el método findId
        const account = await this.findId(accountId); 
        
        // Asignamos el nuevo estado
        account.status = newStatus;
        
        // Al guardar, TypeORM incrementará la versión automáticamente
        return this.accountRepository.save(account);
    };
};
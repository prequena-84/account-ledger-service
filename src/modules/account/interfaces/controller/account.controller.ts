import { Controller, Get, Post, Patch, Body, Param, ParseUUIDPipe, HttpCode, HttpStatus, HttpException, BadRequestException } from '@nestjs/common';
import { AccountRepository } from '../../repositories/account.repository';
import { AccountCreateDTO } from '../dto/account.create.dto';
import { AccountStatusDTO } from '../dto/account.status.dto';
import { AccountEntity } from '../../domain/account.entity';
import { AccountFundsDTO } from '../dto/account.funds.dto';

@Controller('api/v1/accounts')
export class AccountController {
    constructor(private readonly accountRepository: AccountRepository) {};

    /**
     * Endpoint: GET /accounts/:account_id
     * Propósito: Consulta el detalle y saldo de una cuenta específica
     */
    @Get(':account_id')
    @HttpCode(HttpStatus.OK)
    async getAccount(@Param('account_id', new ParseUUIDPipe()) accountId: string): Promise<AccountEntity> {
        try {
            return this.accountRepository.findId(accountId);
        } catch(err) {
            if (err instanceof HttpException) throw err;
            throw new BadRequestException('Error al obtener la cuenta');
        };
    };

    /**
     * Endpoint: POST /accounts
     * Propósito: Crea una nueva cuenta bancaria
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() body: AccountCreateDTO): Promise<AccountEntity | null> {
        try {

            console.log("[POST] Crear Cuenta", body);
            // Implementación: Usar el repositorio
            return this.accountRepository.createAccount(body);

        } catch (err) {
            if (err instanceof HttpException) throw err;
            throw new BadRequestException('Error al crear la cuenta');
        };
    };

    /**
     * Endpoint: PATCH /accounts/:account_id/reserve
     * Propósito: Reserva fondos para una transacción en proceso (Saga)
     */
    @Patch(':account_id/reserve')
    @HttpCode(HttpStatus.OK)
    async reserveFunds(
        @Param('account_id', new ParseUUIDPipe()) accountId: string,
        @Body() { amount }: AccountFundsDTO
    ): Promise<AccountEntity> {
        try {
            // Llamamos a tu método updateAccount (que hace la lógica pesimista)
            return this.accountRepository.updateAccount(accountId, amount);
        } catch(err) {
            if (err instanceof HttpException) throw err;
            throw new BadRequestException('Error al reservar los fondos');
        };
    };

    /**
     * Endpoint: PATCH /accounts/:account_id/status
     * Propósito: Bloquear o desbloquear una cuenta administrativamente
     */
    @Patch(':account_id/status')
    @HttpCode(HttpStatus.OK)
    async updateStatus(
        @Param('account_id', new ParseUUIDPipe()) accountId: string,
        @Body() { status }: AccountStatusDTO // El DTO debe validar que el status sea válido (Enum)
    ): Promise<AccountEntity> {
        try {
            return this.accountRepository.updateStatus(accountId, status);
        } catch(err) {
            if (err instanceof HttpException) throw err;
            throw new BadRequestException('Error al actualizar el estado de la cuenta');
        };
    };
};
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ReservationEntity } from '../domain/reservation.entity';
import { CreateReservationDto } from '../dto/reservation.create.dto';
import { LedgerReservationStatusEnum } from '../domain/enum/reservation.enum';
import { AccountEntity } from '../../account/domain/account.entity'; // Asegúrate de que esta ruta sea correcta

@Injectable()
export class ReservationRepository {
  constructor(
    @InjectRepository(ReservationEntity)
    private readonly repository: Repository<ReservationEntity>,
    // Inyectamos el DataSource para tener control manual sobre las transacciones de base de datos
    private readonly dataSource: DataSource,
  ) {}

  // ... (métodos anteriores se mantienen)
  async create(data: CreateReservationDto): Promise<ReservationEntity> {
    const reservation = this.repository.create(data);
    return this.repository.save(reservation);
  }

  async findById(id: string): Promise<ReservationEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async updateStatus(id: string, status: LedgerReservationStatusEnum): Promise<ReservationEntity | null> {
    await this.repository.update(id, { status });
    return this.findById(id);
  }

  /**
   * Ejecuta la reserva de fondos aplicando un Bloqueo Pesimista (Pessimistic Write).
   * Este es el núcleo de la alta concurrencia en nuestro Core Bancario.
   */
  async reserveFundsPessimistic(transactionId: string, accountId: string, amount: number): Promise<boolean> {
    // 1. Iniciamos un QueryRunner para aislar esta transacción de otras peticiones
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    
    // 2. Iniciamos la transacción SQL (BEGIN)
    await queryRunner.startTransaction();

    try {
      // 3. BLOQUEO PESIMISTA: Buscamos la cuenta y la bloqueamos (SELECT ... FOR UPDATE)
      // Si otra petición intenta tocar esta misma cuenta, tendrá que esperar a que terminemos.
      const account = await queryRunner.manager.findOne(AccountEntity, {
        where: { account_id: accountId },
        lock: { mode: 'pessimistic_write' }, // <- La magia de la Alta Disponibilidad bancaria
      });

      // 4. Validamos que la cuenta exista
      if (!account) {
        throw new BadRequestException('Cuenta no encontrada');
      }

      // 5. Validamos que tenga saldo suficiente para la reserva
      if (Number(account.available_balance) < amount) {
        throw new BadRequestException('Fondos insuficientes para realizar la reserva');
      }

      // 6. Lógica de negocio: Descontamos el disponible y lo pasamos al saldo reservado
      account.available_balance = Number(account.available_balance) - amount;
      account.reserved_balance = Number(account.reserved_balance) + amount;

      // 7. Guardamos la cuenta con los nuevos saldos (esto actualiza la versión del Optimistic Lock automáticamente)
      await queryRunner.manager.save(account);

      // 8. Registramos la huella de la reserva en la tabla LEDGER_RESERVATION
      const reservation = queryRunner.manager.create(ReservationEntity, {
        transaction_id: transactionId,
        account_id: accountId,
        amount: amount,
        status: LedgerReservationStatusEnum.RESERVED,
      });
      await queryRunner.manager.save(reservation);

      // 9. Consolidamos todo en la base de datos (COMMIT). Aquí se liberan los bloqueos.
      await queryRunner.commitTransaction();
      return true;

    } catch (err) {
      // 10. Si algo falla (ej. fondos insuficientes), deshacemos todos los cambios (ROLLBACK)
      await queryRunner.rollbackTransaction();
      
      // Relanzamos el error para que el Controlador gRPC lo atrape
      throw err;
    } finally {
      // 11. Siempre, pase lo que pase, liberamos el QueryRunner para no agotar el pool de conexiones
      await queryRunner.release();
    }
  }
}

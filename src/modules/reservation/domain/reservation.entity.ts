import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { LedgerReservationStatusEnum } from './enum/reservation.enum';
import { ILedgerReservation } from './interfaces/reservation.interfaces';

@Entity('LEDGER_RESERVATION')
export class ReservationEntity implements ILedgerReservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'transaction_id' })
  transaction_id: string;

  @Column({ type: 'varchar', length: 50, name: 'account_id' })
  account_id: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, name: 'amount' })
  amount: number;

  @Column({ type: 'enum', enum: LedgerReservationStatusEnum, default: LedgerReservationStatusEnum.RESERVED, name: 'status' })
  status: LedgerReservationStatusEnum;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deletedAt', nullable: true })
  deletedAt: Date;
}

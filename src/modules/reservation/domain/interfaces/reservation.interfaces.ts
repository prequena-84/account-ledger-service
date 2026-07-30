import { LedgerReservationStatusEnum } from '../enum/reservation.enum';

export interface ILedgerReservation {
  id: string;
  transaction_id: string;
  account_id: string;
  amount: number;
  status: LedgerReservationStatusEnum;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

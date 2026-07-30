import { LedgerReservationStatusEnum } from '../enum/reservation.enum';

export type CreateReservationType = {
  transaction_id: string;
  account_id: string;
  amount: number;
};

export type UpdateReservationStatusType = {
  status: LedgerReservationStatusEnum;
};

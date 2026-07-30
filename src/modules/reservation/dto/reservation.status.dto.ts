import { IsEnum, IsNotEmpty } from 'class-validator';
import { LedgerReservationStatusEnum } from '../domain/enum/reservation.enum';

export class UpdateReservationStatusDto {
  @IsEnum(LedgerReservationStatusEnum)
  @IsNotEmpty()
  status: LedgerReservationStatusEnum;
}

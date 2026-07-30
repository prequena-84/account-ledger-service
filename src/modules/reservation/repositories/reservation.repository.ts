import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReservationEntity } from '../domain/reservation.entity';
import { CreateReservationDto } from '../dto/reservation.create.dto';
import { LedgerReservationStatusEnum } from '../domain/enum/reservation.enum';

@Injectable()
export class ReservationRepository {
  constructor(
    @InjectRepository(ReservationEntity)
    private readonly repository: Repository<ReservationEntity>,
  ) {}

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
}

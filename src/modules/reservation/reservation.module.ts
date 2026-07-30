import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationEntity } from './domain/reservation.entity';
import { ReservationRepository } from './repositories/reservation.repository';
import { ReservationController } from './repositories/reservation.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ReservationEntity])],
  controllers: [ReservationController],
  providers: [ReservationRepository],
  exports: [ReservationRepository],
})
export class ReservationModule {}

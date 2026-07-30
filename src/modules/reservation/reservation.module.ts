import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationEntity } from './domain/reservation.entity';
import { ReservationRepository } from './repositories/reservation.repository';
import { ReservationController } from './repositories/reservation.controller';
import { ReservationGrpcController } from './repositories/reservation.grpc.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ReservationEntity])],
  controllers: [ReservationController, ReservationGrpcController],
  providers: [ReservationRepository],
  exports: [ReservationRepository],
})
export class ReservationModule {}

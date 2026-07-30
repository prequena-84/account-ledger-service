import { Controller, Post, Body, Param, Patch, Get, ParseUUIDPipe, HttpException, HttpStatus } from '@nestjs/common';
import { ReservationRepository } from './reservation.repository';
import { CreateReservationDto } from '../dto/reservation.create.dto';
import { UpdateReservationStatusDto } from '../dto/reservation.status.dto';

@Controller('reservations')
export class ReservationController {
  constructor(private readonly reservationRepository: ReservationRepository) {}

  @Post()
  async createReservation(@Body() dto: CreateReservationDto) {
    try {
      const result = await this.reservationRepository.create(dto);
      return { success: true, data: result };
    } catch (error: any) {
      throw new HttpException({ success: false, message: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async getReservation(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const result = await this.reservationRepository.findById(id);
      if (!result) {
        throw new HttpException('Reservation not found', HttpStatus.NOT_FOUND);
      }
      return { success: true, data: result };
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException({ success: false, message: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReservationStatusDto,
  ) {
    try {
      const result = await this.reservationRepository.updateStatus(id, dto.status);
      if (!result) {
        throw new HttpException('Reservation not found', HttpStatus.NOT_FOUND);
      }
      return { success: true, data: result };
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException({ success: false, message: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

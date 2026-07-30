import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ReservationRepository } from './reservation.repository';

// Interfaz para tipar lo que nos llega por gRPC desde el Orquestador
interface ReserveFundsRequest {
  transaction_id: string;
  account_id: string;
  amount: number;
}

interface ReserveFundsResponse {
  success: boolean;
  message: string;
}

@Controller()
export class ReservationGrpcController {
  private readonly logger = new Logger(ReservationGrpcController.name);

  // Inyectamos nuestro repositorio donde vive la lógica del Bloqueo Pesimista
  constructor(private readonly reservationRepo: ReservationRepository) {}

  /**
   * Este método expone la función gRPC 'ReserveFunds' definida en nuestro archivo ledger_service.proto.
   * El orquestador llamará a este método a través de la red (RPC).
   */
  @GrpcMethod('LedgerService', 'ReserveFunds')
  async reserveFunds(data: ReserveFundsRequest): Promise<ReserveFundsResponse> {
    this.logger.log(`[gRPC] Recibida petición para reservar fondos. Transacción: ${data.transaction_id}`);

    try {
      // 1. Llamamos a nuestra lógica core con Bloqueo Pesimista
      // Esto asegura que si llegan 100 peticiones gRPC al mismo tiempo para la misma cuenta,
      // la base de datos las formará en fila y no habrá saldos negativos (Race Conditions).
      const success = await this.reservationRepo.reserveFundsPessimistic(
        data.transaction_id,
        data.account_id,
        data.amount,
      );

      // 2. Si todo sale bien, respondemos al Orquestador con un éxito
      return {
        success: success,
        message: 'Fondos reservados exitosamente',
      };
    } catch (error) {
      // 3. Tolerancia a fallos: Si ocurre cualquier error (fondos insuficientes, timeout de BD),
      // lo atrapamos elegantemente y le informamos al Orquestador que la reserva falló.
      this.logger.error(`[gRPC] Error al reservar fondos: ${error.message}`);
      
      return {
        success: false,
        message: `Error en reserva: ${error.message}`,
      };
    }
  }
}

import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

//import { TransactionController } from './controllers/transaction.controller';
//import { TransactionService } from './transaction.service';

@Module({
  imports: [
    // 1. Conexión GRPC al Ledger (Puerto 50051)
    ClientsModule.register([
      {
        name: 'LEDGER_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'ledger',
          protoPath: join(__dirname, '../../proto/ledger_service.proto'),
          url: '[IP_ADDRESS]', // Usamos la IP del host para conectar con la Mac - 'localhost:5000',
        },
      },
    ]),
  ],
  controllers: [/*TransactionController*/],
  providers: [/*TransactionService*/],
})
export class TransactionModule {};
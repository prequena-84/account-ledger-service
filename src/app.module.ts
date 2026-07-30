import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Modulo de Configuración de Variables de Entorno
import { ConfigModule } from '@nestjs/config';

// Importación del Middleware interno
import { InternalMiddleware } from './core/middleware/internal.middleware';

// Importación del Modulo de Conexion a la Base de Datos MySQL
import { DatabaseModule } from './config/database/database.module';
import { AccountModule } from './modules/account/account.module';
import { HealthModule } from './modules/health/health.module';
import { ReservationModule } from './modules/reservation/reservation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        `.env.${process.env.NODE_ENV ?? 'development'}`,
        '.env',
      ],
    }),
    DatabaseModule,
    AccountModule,
    HealthModule,
    ReservationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  // Configuración para la protección de rutas con JWT
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(InternalMiddleware)
      .exclude({ path: 'api/v1/health', method: RequestMethod.GET })  // se ecluye el metodo health para validar respuesta del servidor
      .forRoutes('*'); // Se aplica para todas las rutas
  };
};
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

// Importamos el filtro de excepciones globales
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Implementación del uso de CORS (necesario para Socket.io WebSocket desde la app móvil)
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Implemantación del uso de capture de Excepciones Globales
  app.useGlobalFilters(new AllExceptionsFilter());

  const PORT = Number(process.env.PORT ?? 8080);
  const EXPOSE = Number(process.env.EXPOSE ?? 9090);

  await app.listen(PORT, '0.0.0.0');

  console.log({
    Proyecto: '🚀 Account Ledger Service API',
    Server_Running: `http://localhost:${PORT}/api/v1`,
    Server_Docker: `http://${process.env.NODE_ENV}:${EXPOSE}/api/v1`,
    Puerto: PORT,
    Entorno: process.env.NODE_ENV,
    Test: `http://localhost:${PORT}/api/v1/health`,
    Adminer: 'http://localhost:8090',
  });


}
bootstrap();
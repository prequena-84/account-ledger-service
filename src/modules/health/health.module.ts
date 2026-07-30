import { Module } from '@nestjs/common';
import { HealthRepository } from './repositories/health.repository';
import { HealthController } from './interfaces/controller/health.controller';

@Module({
  providers: [HealthRepository],
  controllers: [HealthController]
})
export class HealthModule {}

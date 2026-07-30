import { Controller, Get } from '@nestjs/common';
import { HealthRepository } from '../../repositories/health.repository';

@Controller('api/v1/health')
export class HealthController {
    constructor(private readonly healthRepository: HealthRepository) {};

    @Get()
    getHealth() {
        return this.healthRepository.getHealth({
            status: 'ok',
            app: 'account-ledger-service',
            timestamp: new Date(),
            version: '1.0.0',
        });
    };
};
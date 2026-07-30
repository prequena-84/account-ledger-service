import { registerAs } from '@nestjs/config';
import type { IDatabaseConfig } from './types/database.config.interfaces';

export default registerAs('database', (): IDatabaseConfig => ({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'postgres-dev',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USER ?? 'admin',
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME  ?? 'banking_db',
    logging: process.env.DB_LOGGING === 'true',
    autoLoadEntities: true,
    // Forzamos synchronize a true incondicionalmente para la prueba
    synchronize: true,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
}));
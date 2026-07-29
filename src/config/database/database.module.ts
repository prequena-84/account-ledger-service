import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from './database.config';

@Module({
    imports:[
        ConfigModule.forFeature(databaseConfig),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                ...configService.get('database'),
                autoLoadEntities: configService.get<boolean>('database.autoLoadEntities'), // Garantiza que TypeORM registre todas las entidades declaradas con forFeature()
            }),
            inject: [ConfigService],
        }),
    ],
})
export class DatabaseModule {};
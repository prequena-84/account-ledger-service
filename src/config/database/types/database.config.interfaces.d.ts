export interface IDatabaseConfig {
    type: string;
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    charset?: string;
    logging?: boolean;
    autoLoadEntities: boolean;
    synchronize: boolean;
    ssl?: any;
}
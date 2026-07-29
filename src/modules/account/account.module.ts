import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountEntity } from './domain/account.entity';
import { AccountController } from './interfaces/controller/account.controller';
import { AccountRepository } from './repositories/account.repository';

@Module({
imports:[
    TypeOrmModule.forFeature([AccountEntity]),
  ],
  controllers: [AccountController],
  providers: [AccountRepository],
  exports:[
    TypeOrmModule,
    AccountRepository,
  ],
})
export class AccountModule {}

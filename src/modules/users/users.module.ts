import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'nestjs-prisma';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { JwtStrategy } from './strategy/jwt.strategy';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [JwtModule, PrismaModule, MailModule],
  providers: [UsersService, JwtStrategy],
  controllers: [UsersController],
})
export class UsersModule {}
// import { PrismaModule } from 'nestjs-prisma';
import { MailService } from './mail.service';
import { Module, Global } from "@nestjs/common";

@Global()
@Module({
  imports: [],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
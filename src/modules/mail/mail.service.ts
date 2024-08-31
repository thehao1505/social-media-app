import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import * as apppath from "app-root-path";
// import { PrismaService } from "nestjs-prisma";

@Injectable()
export class MailService {
  constructor(
    private mailer: MailerService,
  ) {}

  async sendForgotPasswordEmail(email: string, data: string) {
    await this.mailer.sendMail({
      to: email,
      subject: 'Forgot Password',
      html: data,
    });
  }
}
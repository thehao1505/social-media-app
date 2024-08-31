import * as argon from "argon2";
import * as crypto from "crypto";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "nestjs-prisma";
import { SignUpDTO } from "./dto/users-signup.dto";
import { ForbiddenException, Injectable } from "@nestjs/common";
import { LoginDTO } from "./dto/users-login.dto";
import { ResetPwDTO } from "./dto/users-resetpw.dto";
import { ChangePwDTO } from "./dto/users-changepw.dto";
import { MailService } from "../mail/mail.service";

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  // async testSendMail(body: any, req: Request) {
  //   await this.mailService.sendForgotPasswordEmail(
  //     'thehao155@gmail.com', body.content
  //   );

  //   console.log(`${req['protocol']}://${req['get']('host')}/reset-password/`);
  //   return 1;
  // }
  
  async forgotPassword(email: string, req: Request) {
    const user = await this.prisma.users.findUnique({
      where: { email },
    });

    if (!user) throw new ForbiddenException('Invalid email');

    const resetToken = { token: crypto.randomBytes(32).toString('hex') };
    await this.prisma.users.update({
      where: { id: user.id },
      data: {
        passwordResetToken: crypto.createHash('sha512').update(JSON.stringify(resetToken)).digest('hex'),
        passwordResetTokenExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });

    const resetURL = `${req['protocol']}://${req['get']('host')}/users/reset-password/${resetToken.token}`;
    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    try {
      await this.mailService.sendForgotPasswordEmail(email, message);

      return {
        url: resetURL,
        resetToken
      };
    } catch (error) {
      await this.prisma.users.update({
        where: { id: user.id },
        data: {
          passwordResetToken: undefined,
          passwordResetTokenExpiry: undefined,
        },
      })

      return new ForbiddenException('Email could not be sent');
    }
  }

  async resetPassword(token: string, resetPwDTO: ResetPwDTO) {
    const hashedToken = crypto.createHash('sha512').update(JSON.stringify(token)).digest('hex');
    const user = await this.prisma.users.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetTokenExpiry: {gte: new Date(Date.now())},
      },
    });

    if (!user) throw new ForbiddenException('Invalid or expired token');

    if (resetPwDTO.password !== resetPwDTO.passwordConfirm)
      throw new ForbiddenException('Passwords do not match');

    await this.prisma.users.update({
      where: { id: user.id },
      data: {
        password: await argon.hash(resetPwDTO.password),
        passwordConfirm: await argon.hash(resetPwDTO.passwordConfirm),
        passwordResetToken: undefined,
        passwordResetTokenExpiry: undefined,
      },
    })

    return this.signJwtToken(user.id, user.email, user.role);
  }

  async changePassword(id: number, changePwDTO: ChangePwDTO) {
    const user = await this.prisma.users.findFirst({
      where: { id },
    })

    if (!(await argon.verify(user.password, changePwDTO.passwordCurrent)))
      throw new ForbiddenException('Invalid password');

    await this.prisma.users.update({
      where: { id },
      data: {
        password: await argon.hash(changePwDTO.password),
        passwordConfirm: await argon.hash(changePwDTO.passwordConfirm),
      },
    })

    return await this.signJwtToken(user.id, user.email, user.role);
  }

  async signUp(signUpDTO: SignUpDTO) {
    const hashedPassword = await argon.hash(signUpDTO.password);
    const user = await this.prisma.users.create({
      data: {
        email: signUpDTO.email,
        username: signUpDTO.username,
        password: hashedPassword,
        phone: signUpDTO.phone,
        name: signUpDTO.name,
      }, select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
      }
    });

    return await this.signJwtToken(user.id, user.email, user.role);
  }

  async login(loginDTO: LoginDTO) {
    const user = await this.prisma.users.findUnique({
      where: { email: loginDTO.email },
    });

    if (!user) throw new ForbiddenException('Invalid credentials');

    const passwordMatch = await argon.verify(user.password, loginDTO.password);
    if (!passwordMatch) throw new ForbiddenException('Invalid credentials pass');

    return await this.signJwtToken(user.id, user.email, user.role);
  }

  async signJwtToken(id: number, email: string, role: string): Promise<{accessToken: string}> {
    const payload = { id, email, role };
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '1d',
      secret: process.env.JWT_SECRET,
    });

    return {accessToken};
  }
}
import { UsersService } from './users.service';
import { SignUpDTO } from './dto/users-signup.dto';
import { Body, Controller, Get, Post, Req, UseGuards, Request, Patch, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LoginDTO } from './dto/users-login.dto';
import { ChangePwDTO } from './dto/users-changepw.dto';
import { ResetPwDTO } from './dto/users-resetpw.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // @Post("/sendmail")
  // testSendMail(
  //   @Body() body: any,
  //   @Req() req: Request,
  // ) {
  //   return this.usersService.testSendMail(body, req);
  // }

  @Post("/forgot-password")
  forgotPassword(
    @Body() body: any,
    @Req() req: Request,
  ) {
    return this.usersService.forgotPassword(body.email, req);
  }

  @Patch("/reset-password/:token")
  resetPassword(
    @Body() resetPwDTO: ResetPwDTO,
    @Param() token: string,
  ) {
    return this.usersService.resetPassword(token, resetPwDTO);
  }

  @Patch("/change-password")
  @UseGuards(AuthGuard('jwt'))
  changePassword(
    @Body() changePwDTO: ChangePwDTO,
    @Req() req: Request,
  ) {
    return this.usersService.changePassword(req['user'].id, changePwDTO);
  }
  
  @Get("/me")
  @UseGuards(AuthGuard('jwt'))
  getMe(@Req() req: Request) {
    return req['user'];
  }

  @Post("/signup")
  signUp(
    @Body() signUpDTO: SignUpDTO,
    // @Req() req: Request,
  ): Promise<{accessToken: string}> {
    return this.usersService.signUp(signUpDTO);
    // const a = this.usersService.signUp(signUpDTO);
    // console.log(req);
    // return a;
  }
  
  @Post("/login")
  login(
    @Body() loginDTO: LoginDTO,
    @Req() req: Request,
  ): Promise<{accessToken: string}> {
    // return this.usersService.login(loginDTO);
    const a = this.usersService.login(loginDTO);
    console.log(req);
    return a;
  }

}

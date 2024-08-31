import { IsNotEmpty, IsString, Matches, MinLength } from "class-validator";

export class ChangePwDTO {
  @IsString()
  @IsNotEmpty()
  passwordCurrent: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(9, {
    message: 'Password must be at least 9 characters long',
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
    message: 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  passwordConfirm: string;
}
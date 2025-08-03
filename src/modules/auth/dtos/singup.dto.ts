import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class SignUpDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  displayName: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,16}$/, {
    message:
      'password must contain at least one uppercase, at least one lowercase, at least one number, at least one special character from this list "#?!@$%^&*-" and total length must be between 8 to 16 characters',
  })
  password: string;
}

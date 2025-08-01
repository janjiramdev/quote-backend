import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateUserByIdDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @Matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,16}$/, {
    message:
      'password must contain at least one uppercase, at least one lowercase, at least one number, at least one special character from this list "#?!@$%^&*-" and total length must be between 8 to 16 characters',
  })
  password?: string;
}

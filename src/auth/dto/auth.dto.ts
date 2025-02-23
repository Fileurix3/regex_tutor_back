import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from "class-validator";

export class AuthDto {
  @IsOptional()
  @ValidateIf((val) => val.name != undefined)
  @MinLength(3, { message: "Name must not be less than 3 characters" })
  @MaxLength(30, { message: "Name length should not exceed 30 characters" })
  name?: string;

  @IsEmail({}, { message: "Invalid email" })
  @IsNotEmpty({ message: "Email is required" })
  email: string;

  @MinLength(6, { message: "Password must not be less than 6 characters" })
  @IsNotEmpty({ message: "Password is required" })
  @IsString()
  password: string;
}

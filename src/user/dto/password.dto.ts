import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class ChangePasswordDto {
  @MinLength(6, { message: "Password must not be less than 6 characters" })
  @IsString()
  @IsNotEmpty({ message: "Old password is required" })
  oldPassword: string;

  @MinLength(6, { message: "Password must not be less than 6 characters" })
  @IsString()
  @IsNotEmpty({ message: "New password is required" })
  newPassword: string;
}

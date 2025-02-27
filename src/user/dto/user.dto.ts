import {
  IsEmail,
  IsOptional,
  MaxLength,
  MinLength,
  ValidateIf,
} from "class-validator";

export class UpdateProfileDto {
  @IsOptional()
  @ValidateIf((val) => val.name != undefined)
  @MinLength(3, { message: "Name must not be less than 3 characters" })
  @MaxLength(30, { message: "Name length should not exceed 30 characters" })
  name: string;

  @IsOptional()
  @ValidateIf((val) => val.email != undefined)
  @IsEmail({}, { message: "Invalid email" })
  email: string;
}

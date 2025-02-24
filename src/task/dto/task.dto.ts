import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

class ExampleTestCaseDto {
  @IsString({ message: "Test case must be a string" })
  @IsNotEmpty({ message: "Test case is required" })
  testCase: string;

  @IsBoolean({ message: "Output must be a boolean" })
  @IsNotEmpty({ message: "Output is required" })
  output: boolean;

  @IsString({ message: "Description must be a string" })
  @IsNotEmpty({ message: "Description is required" })
  description: string;
}

class TestCaseDto {
  @IsString({ message: "Test case must be a string" })
  @IsNotEmpty({ message: "Test case is required" })
  testCase: string;

  @IsBoolean({ message: "Output must be a boolean" })
  @IsNotEmpty({ message: "Output is required" })
  output: boolean;
}

export class TaskDto {
  @MaxLength(50, { message: "Name length should not exceed 50 characters" })
  @MinLength(3, { message: "Name must not be less than 3 characters" })
  @IsString({ message: "Name must be a string" })
  @IsNotEmpty({ message: "Name is required" })
  name: string;

  @IsString({ message: "Description must be a string" })
  @IsNotEmpty({ message: "Description is required" })
  description: string;

  @IsArray({ message: "Example test cases must be an array" })
  @ArrayMinSize(1, { message: "Example test cases can't be empty" })
  @ValidateNested({ each: true })
  @Type(() => ExampleTestCaseDto)
  exampleTestCases: ExampleTestCaseDto[];

  @IsArray({ message: "Test cases must be an array" })
  @ArrayMinSize(1, { message: "Test cases can't be empty" })
  @ValidateNested({ each: true })
  @Type(() => TestCaseDto)
  testCases: TestCaseDto[];
}

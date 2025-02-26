import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Res,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Response } from "express";
import { AuthDto } from "./dto/auth.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UsePipes(ValidationPipe)
  @Post("/register")
  @HttpCode(201)
  async register(@Body() authDto: AuthDto, @Res() res: Response) {
    const message = await this.authService.register(authDto, res);
    return message;
  }

  @UsePipes(ValidationPipe)
  @Post("/login")
  @HttpCode(200)
  async login(@Body() authDto: AuthDto, @Res() res: Response) {
    const message = await this.authService.login(authDto, res);
    return message;
  }

  @Get("/logout")
  @HttpCode(200)
  async logout(@Res() res: Response) {
    const message = await this.authService.logout(res);
    return message;
  }
}

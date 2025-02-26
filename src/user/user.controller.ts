import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Put,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { AuthGuard } from "../guards/auth.guard";
import { Request } from "express";
import { ChangePasswordDto } from "./dto/password.dto";
import { UpdateProfileDto } from "./dto/user.dto";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("profile/:userId")
  @HttpCode(200)
  async getUserProfileByName(@Param("userId") userId: string) {
    const message = await this.userService.getUserProfileById(userId);
    return message;
  }

  @UseGuards(AuthGuard)
  @HttpCode(200)
  @Get("profile")
  async getYourProfile(@Req() req: Request) {
    const userToken = req.cookies.token;
    const message = await this.userService.getYourProfile(userToken);
    return message;
  }

  @UseGuards(AuthGuard)
  @UsePipes(ValidationPipe)
  @Put("update/profile")
  @HttpCode(200)
  async updateUserProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @Req() req: Request,
  ) {
    const userToken = req.cookies.token;
    const message = await this.userService.updateUserProfile(
      updateProfileDto,
      userToken,
    );
    return message;
  }

  @UseGuards(AuthGuard)
  @UsePipes(ValidationPipe)
  @Put("change/password")
  @HttpCode(200)
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req: Request,
  ) {
    const userToken = req.cookies.token;
    const message = await this.userService.changePassword(
      changePasswordDto,
      userToken,
    );
    return message;
  }

  @UseGuards(AuthGuard)
  @Delete("delete/account")
  @HttpCode(200)
  async deleteAccount(@Req() req: Request) {
    const userToken = req.cookies.token;
    const { password } = req.body;
    const message = await this.userService.deleteAccount(userToken, password);
    return message;
  }
}

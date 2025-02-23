import { BadRequestException, Injectable } from "@nestjs/common";
import { Response } from "express";
import { AuthDto } from "./dto/auth.dto";
import { InjectModel } from "@nestjs/mongoose";
import { User, UserDocument } from "../schemas/user.schema";
import { JwtService } from "@nestjs/jwt";
import { Model } from "mongoose";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async register(authDto: AuthDto, res: Response) {
    const { name, password, email } = authDto;

    if (!name) {
      throw new BadRequestException("Name is required");
    }

    const existingUser: UserDocument[] = await this.userModel.find({
      $or: [{ name: name }, { email: email }],
    });

    if (existingUser.length > 0) {
      throw new BadRequestException(
        "User with this name or email already exists",
      );
    }

    const hashPassword: string = await bcrypt.hash(password, 10);

    await this.userModel.create({
      name: name,
      email: email,
      password: hashPassword,
    });

    return { message: "User has been successfully registered" };
  }

  async login(authDto: AuthDto, res: Response) {
    const { password, email } = authDto;

    const user: UserDocument | null = await this.userModel.findOne({
      email: email,
    });

    if (user == null) {
      throw new BadRequestException("Invalid email or password");
    }

    const hashPassword: boolean = await bcrypt.compare(password, user.password);

    if (!hashPassword) {
      throw new BadRequestException("Invalid email or password");
    }

    const payload = { userId: user._id };
    const token = await this.jwtService.signAsync(payload);

    res.cookie("token", token, {
      maxAge: 7 * 25 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "lax",
    });

    return { message: "Login has been successfully" };
  }

  async logout(res: Response) {
    res.clearCookie("token");
    return { message: "logout successfully" };
  }
}

import {
  BadRequestException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { UpdateProfileDto } from "./dto/user.dto";
import { ChangePasswordDto } from "./dto/password.dto";
import { User, UserDocument } from "../schemas/user.schema";
import { JwtService } from "@nestjs/jwt";
import { Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import * as bcrypt from "bcrypt";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async getUserProfileById(userName: string) {
    const user: UserDocument | null = await this.userModel
      .findOne({ name: userName }, { password: 0, __v: 0 })
      .populate("solvedTasks", "_id name")
      .exec();

    if (user == null) {
      throw new NotFoundException("User not found");
    }

    return { user };
  }

  async getYourProfile(userToken: string) {
    const userId: string = this.getUserIdFromJwt(userToken);

    const user: UserDocument | null = await this.userModel
      .findOne({ _id: userId }, { password: 0, __v: 0 })
      .populate("solvedTasks", "_id name")
      .exec();

    if (user == null) {
      throw new NotAcceptableException("User not found");
    }

    return { user };
  }

  async updateUserProfile(
    updateProfileDto: UpdateProfileDto,
    userToken: string,
  ) {
    const { name, email } = updateProfileDto;

    if (!name && !email) {
      throw new BadRequestException("You have to update at least one thing");
    }

    const userId: Types.ObjectId = new Types.ObjectId(
      this.getUserIdFromJwt(userToken),
    );

    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $set: { name, email } },
        { new: true, select: "name email updatedAt" },
      )
      .exec();

    if (!updatedUser) {
      throw new NotFoundException("User not found");
    }

    return {
      message: "User has been successfully updated profile",
      updatedUser: updatedUser,
    };
  }

  async changePassword(
    changePasswordDto: ChangePasswordDto,
    userToken: string,
  ) {
    const { oldPassword, newPassword } = changePasswordDto;

    if (oldPassword == newPassword) {
      throw new BadRequestException(
        "Old password and new password must be different",
      );
    }

    const userId: string = this.getUserIdFromJwt(userToken);

    const user: UserDocument | null = await this.userModel.findById(userId);

    if (user == null) {
      throw new NotFoundException("User not found");
    }

    const oldPasswordIsEqualUserPassword: boolean = await bcrypt.compare(
      oldPassword,
      user.password,
    );

    if (!oldPasswordIsEqualUserPassword) {
      throw new BadRequestException(
        "Current password does not match your oldPassword",
      );
    }

    const hashPassword = await bcrypt.hash(newPassword, 10);

    await this.userModel.updateOne({ id: userId }, { password: hashPassword });

    return { message: "Password has been successfully updated" };
  }

  async deleteAccount(userToken: string) {
    const userId: string = this.getUserIdFromJwt(userToken);

    await this.userModel.deleteOne({ _id: userId });

    return { message: "Account has been successfully deleted" };
  }

  private getUserIdFromJwt(token: string): string {
    try {
      const { userId } = this.jwtService.verify(token);
      return userId;
    } catch {
      throw new UnauthorizedException("Unauthorized");
    }
  }
}

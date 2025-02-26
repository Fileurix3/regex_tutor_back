import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "../schemas/user.schema";

@Injectable()
export class IsAdminGuard implements CanActivate {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const token = req.cookies.token;

    if (!token) {
      throw new UnauthorizedException("Unauthorized");
    }

    const decode: any = this.jwtService.verify(token);
    const userId = decode.userId;

    const user: UserDocument | null = await this.userModel.findOne({
      _id: userId,
    });

    if (user == null || user.role != "Admin") {
      throw new ForbiddenException("You don't have enough rights");
    }

    return true;
  }
}

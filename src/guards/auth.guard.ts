import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    const token = req.cookies.token;

    if (!token) {
      throw new UnauthorizedException("Unauthorized");
    }

    try {
      this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET as string,
      });

      return true;
    } catch (err) {
      res.clearCookie("token");
      throw new UnauthorizedException("Unauthorized");
    }
  }
}

import { JwtService } from "@nestjs/jwt";
import { IsAdminGuard } from "./is_admin.guard";
import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";
import { User } from "src/schemas/user.schema";
import { Model } from "mongoose";

describe("IsAdminGuard", () => {
  let guard: IsAdminGuard;
  let jwtService: JwtService;
  let userModel: Model<User>;

  beforeEach(() => {
    jwtService = {
      verify: jest.fn(),
    } as unknown as JwtService;

    userModel = {
      findOne: jest.fn(),
    } as unknown as Model<User>;

    guard = new IsAdminGuard(userModel, jwtService);
  });

  it("should be defined", () => {
    expect(guard).toBeDefined();
  });

  it("should deny access if user is not authenticated (no token)", () => {
    const context = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: () => ({ cookies: {} }),
      }),
    } as unknown as ExecutionContext;

    expect(async () => await guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it("should deny access if user is not an admin", async () => {
    const context = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: () => ({ cookies: { token: "someToken" } }),
      }),
    } as unknown as ExecutionContext;

    jwtService.verify = jest.fn().mockReturnValue({ userId: "123" });

    userModel.findOne = jest.fn().mockResolvedValue({
      _id: "123",
      role: "User",
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it("should deny access if user is not an admin", async () => {
    const context = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: () => ({ cookies: { token: "someToken" } }),
      }),
    } as unknown as ExecutionContext;

    jwtService.verify = jest.fn().mockReturnValue({ userId: "123" });

    userModel.findOne = jest.fn().mockResolvedValue({
      _id: "123",
      role: "Admin",
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });
});

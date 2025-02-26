import { JwtService } from "@nestjs/jwt";
import { AuthGuard } from "./auth.guard";
import { ExecutionContext, UnauthorizedException } from "@nestjs/common";

describe("AuthGuard", () => {
  let guard: AuthGuard;
  let jwtService: JwtService;

  beforeEach(() => {
    jwtService = {
      verify: jest.fn(),
    } as unknown as JwtService;

    guard = new AuthGuard(jwtService);
  });

  it("should be defined", () => {
    expect(guard).toBeDefined();
  });

  it("should allow access if user is authenticated", () => {
    const context = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: () => ({ cookies: { token: "someToke" } }),
        getResponse: () => ({ clearCookie: jest.fn() }),
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
  });

  it("should deny access if user is not authenticated (no token)", () => {
    const context = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: () => ({ cookies: {} }),
        getResponse: () => ({ clearCookie: jest.fn() }),
      }),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });
});

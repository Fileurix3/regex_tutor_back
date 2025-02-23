import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { Response } from "express";

describe("AuthController", () => {
  let authController: AuthController;
  let authService: AuthService;
  let mockRes: Partial<Response>;

  beforeEach(async () => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            logout: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("POST /auth/register - must call the AuthService register method and return correct data", async () => {
    const authDto = {
      name: "John",
      email: "john@example.com",
      password: "password",
    };

    const result = { message: "User has been successfully registered" };

    jest.spyOn(authService, "register").mockResolvedValueOnce(result as any);

    await authController.register(authDto, mockRes as Response);

    expect(authService.register).toHaveBeenCalledWith(authDto, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(result);
  });

  it("POST /auth/login - must call the AuthService login method and return correct data", async () => {
    const authDto = { email: "test@example.com", password: "password" };
    const result = { message: "Login has been successfully" };

    jest.spyOn(authService, "login").mockResolvedValueOnce(result as any);

    await authController.login(authDto, mockRes as Response);

    expect(authService.login).toHaveBeenCalledWith(authDto, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(result);
  });

  it("POST /auth/logout - must call the AuthService logout method and return correct data", async () => {
    const result = { message: "logout successfully" };
    jest.spyOn(authService, "logout").mockResolvedValueOnce(result as any);

    await authController.logout(mockRes as Response);

    expect(authService.logout).toHaveBeenCalledWith(mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(result);
  });
});

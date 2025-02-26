import { Test, TestingModule } from "@nestjs/testing";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { Request } from "express";
import { ChangePasswordDto } from "./dto/password.dto";
import { UpdateProfileDto } from "./dto/user.dto";
import { JwtService } from "@nestjs/jwt";

describe("AuthController", () => {
  let userController: UserController;
  let userService: UserService;
  let mockReq: Partial<Request>;

  beforeEach(async () => {
    mockReq = {
      cookies: { token: "someToken" },
    } as unknown as Request;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            getUserProfileById: jest.fn(),
            getYourProfile: jest.fn(),
            changePassword: jest.fn(),
            updateUserProfile: jest.fn(),
            deleteAccount: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("GET /user/profile/:userName - must call the UserService getUserProfileByName method and return correct data", async () => {
    const result = {
      id: "id",
      name: "userName",
      createdAt: "2021-01-01",
    };

    jest
      .spyOn(userService, "getUserProfileById")
      .mockResolvedValueOnce(result as any);

    const response = await userController.getUserProfileByName(
      mockReq.cookies!.token,
    );

    expect(userService.getUserProfileById).toHaveBeenCalledWith(
      mockReq.cookies!.token,
    );
    expect(response).toEqual(result);
  });

  it("GET /user/profile - must call the UserService getYourProfile method and return correct data", async () => {
    const result = {
      id: "id",
      name: "userName",
      created_at: "10",
      avatar_url: "avatar",
      recipes: [
        {
          id: "recipeId",
          title: "title",
          difficult: "difficult",
          category: "category",
          ingredients: ["egg"],
          image: "image",
          cook_time: "time",
        },
      ],
    };

    jest
      .spyOn(userService, "getYourProfile")
      .mockResolvedValueOnce(result as any);

    const response = await userController.getYourProfile(mockReq as Request);

    expect(userService.getYourProfile).toHaveBeenCalledWith(
      mockReq.cookies!.token,
    );
    expect(response).toEqual(result);
  });

  it("PUT /user/update/profile - must call the UserService updateUserProfile method and return correct data", async () => {
    const result = { message: "Profile has been successfully updated" };

    const updateProfileDto: UpdateProfileDto = {
      name: "newName",
      email: "newEmail@example.com",
    };

    jest
      .spyOn(userService, "updateUserProfile")
      .mockResolvedValueOnce(result as any);

    const response = await userController.updateUserProfile(
      updateProfileDto,
      mockReq as Request,
    );

    expect(userService.updateUserProfile).toHaveBeenCalledWith(
      updateProfileDto,
      mockReq.cookies!.token,
    );
    expect(response).toEqual(result);
  });

  it("PUT /user/change/password - must call the UserService changePassword method and return correct data", async () => {
    const result = { message: "Password has been successfully updated" };
    const changePasswordDto: ChangePasswordDto = {
      oldPassword: "oldPassword",
      newPassword: "newPassword",
    };

    jest
      .spyOn(userService, "changePassword")
      .mockResolvedValueOnce(result as any);

    const response = await userController.changePassword(
      changePasswordDto,
      mockReq as Request,
    );

    expect(userService.changePassword).toHaveBeenCalledWith(
      changePasswordDto,
      mockReq.cookies!.token,
    );
    expect(response).toEqual(result);
  });

  it("DELETE /user/delete/account - must call the UserService deleteAccount method and return correct data", async () => {
    const result = { message: "Account has been successfully deleted" };

    jest.spyOn(userService, "deleteAccount").mockResolvedValueOnce(result);

    const response = await userController.deleteAccount(mockReq as Request);

    expect(userService.deleteAccount).toHaveBeenCalledWith(
      mockReq.cookies!.token,
    );
    expect(response).toEqual(result);
  });
});

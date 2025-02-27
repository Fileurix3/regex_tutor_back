import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { App } from "supertest/types";
import { AppModule } from "./../src/app.module";
import { Model } from "mongoose";
import { User } from "src/schemas/user.schema";
import { getModelToken } from "@nestjs/mongoose";
import { JwtService } from "@nestjs/jwt";
import * as cookieParser from "cookie-parser";

describe("user (e2e)", () => {
  let app: INestApplication<App>;
  let userModel: Model<User>;

  let userToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();

    userModel = moduleFixture.get<Model<User>>(getModelToken("User"));
    const jwtService = moduleFixture.get(JwtService);

    await request(app.getHttpServer()).post("/auth/register").send({
      name: "testUser",
      email: "test@example.com",
      password: "testPassword",
    });

    const response = await request(app.getHttpServer())
      .post("/auth/login")
      .send({
        email: "test@example.com",
        password: "testPassword",
      });

    const cookiesAuth = response.headers["set-cookie"];

    for (let i = 0; i < cookiesAuth.length; i++) {
      if (cookiesAuth[0].startsWith("token=")) {
        userToken = cookiesAuth[i].split(/\;/)[0].split(/\=/)[1];
        break;
      }
    }

    userId = jwtService.verify(userToken).userId;
  });

  it("GET /user/profile/{userId} - get user profile by id", async () => {
    const response = await request(app.getHttpServer())
      .get(`/user/profile/${userId}`)
      .expect(200);

    expect(response.body.user).toHaveProperty("_id");
    expect(response.body.user).toHaveProperty("name");
    expect(response.body.user).toHaveProperty("email");
    expect(response.body.user).toHaveProperty("createdAt");
    expect(response.body.user).toHaveProperty("updatedAt");
    expect(response.body.user).toHaveProperty("role");
    expect(response.body.user).toHaveProperty("solvedTasks");
  });

  it("GET /user/profile/{userId} - invalid user id (throw error 400)", async () => {
    const response = await request(app.getHttpServer())
      .get("/user/profile/123")
      .expect(400);

    expect(response.body.message).toEqual("Invalid user id");
  });

  it("GET /user/profile should return user profile", async () => {
    const response = await request(app.getHttpServer())
      .get("/user/profile")
      .set("Cookie", `token=${userToken}`)
      .expect(200);

    expect(response.body.user).toHaveProperty("_id");
    expect(response.body.user).toHaveProperty("name");
    expect(response.body.user).toHaveProperty("email");
    expect(response.body.user).toHaveProperty("createdAt");
    expect(response.body.user).toHaveProperty("updatedAt");
    expect(response.body.user).toHaveProperty("role");
    expect(response.body.user).toHaveProperty("solvedTasks");
  });

  it("GET /user/profile/{userId} - get you profile if user unauthorized (without token throw error 401)", async () => {
    const response = await request(app.getHttpServer())
      .get(`/user/profile`)
      .expect(401);

    expect(response.body.message).toEqual("Unauthorized");
  });

  it("PUT /user/update/profile - update user profile (without token throw error 401)", async () => {
    const response = await request(app.getHttpServer())
      .put("/user/update/profile")
      .send({ email: "new@example.com" })
      .expect(401);

    expect(response.body.message).toEqual("Unauthorized");
  });

  it("PUT /user/update/profile - if the user has not updated any fields (throw error 400)", async () => {
    const response = await request(app.getHttpServer())
      .put("/user/update/profile")
      .set("Cookie", `token=${userToken}`)
      .send({});

    expect(response.body.message).toEqual(
      "You have to update at least one thing",
    );
  });

  it("PUT /user/update/profile - if the user has not updated any fields (throw error 400)", async () => {
    const newEmail = "new@gmail.com";
    const response = await request(app.getHttpServer())
      .put("/user/update/profile")
      .set("Cookie", `token=${userToken}`)
      .send({ email: newEmail });

    expect(response.body.message).toEqual(
      "User has been successfully updated profile",
    );

    expect(response.body.updatedUser).toHaveProperty("name");
    expect(response.body.updatedUser).toHaveProperty("updatedAt");
    expect(response.body.updatedUser.email).toEqual(newEmail);
  });

  it("PUT /user/change/password - change password (without token throw error 401)", async () => {
    const response = await request(app.getHttpServer())
      .put(`/user/change/password`)
      .expect(401);

    expect(response.body.message).toEqual("Unauthorized");
  });

  it("PUT /user/change/password - no fields (throw error 400)", async () => {
    const response = await request(app.getHttpServer())
      .put(`/user/change/password`)
      .set("Cookie", `token=${userToken}`)
      .send({})
      .expect(400);

    expect(response.body.message).toEqual([
      "Old password is required",
      "oldPassword must be a string",
      "Password must not be less than 6 characters",
      "New password is required",
      "newPassword must be a string",
      "Password must not be less than 6 characters",
    ]);
  });

  it("PUT /user/change/password - no oldPassword field (throw error 400)", async () => {
    const response = await request(app.getHttpServer())
      .put(`/user/change/password`)
      .set("Cookie", `token=${userToken}`)
      .send({ newPassword: "newPassword" })
      .expect(400);

    expect(response.body.message).toEqual([
      "Old password is required",
      "oldPassword must be a string",
      "Password must not be less than 6 characters",
    ]);
  });

  it("PUT /user/change/password - no newPassword field (throw error 400)", async () => {
    const response = await request(app.getHttpServer())
      .put(`/user/change/password`)
      .set("Cookie", `token=${userToken}`)
      .send({ oldPassword: "newPassword" })
      .expect(400);

    expect(response.body.message).toEqual([
      "New password is required",
      "newPassword must be a string",
      "Password must not be less than 6 characters",
    ]);
  });

  it("PUT /user/change/password - if the newPassword match the oldPassword (throw error 400) ", async () => {
    const response = await request(app.getHttpServer())
      .put(`/user/change/password`)
      .set("Cookie", `token=${userToken}`)
      .send({ oldPassword: "password", newPassword: "password" })
      .expect(400);

    expect(response.body.message).toEqual(
      "Old password and new password must be different",
    );
  });

  it("PUT /user/change/password - if the oldPassword not match the current password (throw error 400)", async () => {
    const response = await request(app.getHttpServer())
      .put(`/user/change/password`)
      .set("Cookie", `token=${userToken}`)
      .send({ oldPassword: "password", newPassword: "newPassword" })
      .expect(400);

    expect(response.body.message).toEqual(
      "Current password does not match your oldPassword",
    );
  });

  it("PUT /user/change/password - change password", async () => {
    const response = await request(app.getHttpServer())
      .put(`/user/change/password`)
      .set("Cookie", `token=${userToken}`)
      .send({ oldPassword: "testPassword", newPassword: "newPassword" })
      .expect(200);

    expect(response.body.message).toEqual(
      "Password has been successfully updated",
    );
  });

  it("DELETE /user/delete/account - delete account (without token throw error 401)", async () => {
    const response = await request(app.getHttpServer())
      .delete(`/user/delete/account`)
      .expect(401);

    expect(response.body.message).toEqual("Unauthorized");
  });

  it("DELETE /user/delete/account - no password filed (throw error 400)", async () => {
    const response = await request(app.getHttpServer())
      .delete(`/user/delete/account`)
      .set("Cookie", `token=${userToken}`)
      .send({})
      .expect(400);

    expect(response.body.message).toEqual("Password is required");
  });

  it("DELETE /user/delete/account - if this password not match current password (throw error 400)", async () => {
    const response = await request(app.getHttpServer())
      .delete(`/user/delete/account`)
      .set("Cookie", `token=${userToken}`)
      .send({ password: "password" })
      .expect(400);

    expect(response.body.message).toEqual("Invalid password");
  });

  it("DELETE /user/delete/account - delete account", async () => {
    const response = await request(app.getHttpServer())
      .delete(`/user/delete/account`)
      .set("Cookie", `token=${userToken}`)
      .send({ password: "newPassword" })
      .expect(200);

    expect(response.body.message).toEqual(
      "Account has been successfully deleted",
    );
  });

  afterAll(async () => {
    await userModel.deleteMany({
      name: "testUser",
    });

    await app.close();
  });
});

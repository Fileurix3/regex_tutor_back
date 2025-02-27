import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { App } from "supertest/types";
import { AppModule } from "./../src/app.module";
import { Model } from "mongoose";
import { User } from "src/schemas/user.schema";
import { getModelToken } from "@nestjs/mongoose";

describe("auth (e2e)", () => {
  let app: INestApplication<App>;
  let userModel: Model<User>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userModel = moduleFixture.get<Model<User>>(getModelToken("User"));
  });

  it("POST /auth/register - no email field (throw error 400)", async () => {
    const response = await request(app.getHttpServer())
      .post("/auth/register")
      .send({
        name: "testUser",
        password: "testPassword",
      })
      .expect(400);

    expect(response.body.message).toEqual([
      "Email is required",
      "Invalid email",
    ]);
  });

  it("POST /auth/register - no name field (throw error 400)", async () => {
    const response = await request(app.getHttpServer())
      .post("/auth/register")
      .send({
        email: "test@example.com",
        password: "testPassword",
      })
      .expect(400);

    expect(response.body.message).toEqual("Name is required");
  });

  it("POST /auth/register - no password field (throw error 400)", async () => {
    const response = await request(app.getHttpServer())
      .post("/auth/register")
      .send({
        name: "testUser",
        email: "test@example.com",
      })
      .expect(400);

    expect(response.body.message).toEqual([
      "Password is required",
      "Password must not be less than 6 characters",
    ]);
  });

  it("POST /auth/register - invalid email (throw error 400)", async () => {
    const response = await request(app.getHttpServer())
      .post("/auth/register")
      .send({
        name: "testUser",
        email: "invalidEmail",
        password: "testPassword",
      })
      .expect(400);

    expect(response.body.message).toEqual(["Invalid email"]);
  });

  it("POST /auth/register - password is too small (throw error 400)", async () => {
    const response = await request(app.getHttpServer())
      .post("/auth/register")
      .send({
        name: "testUser",
        email: "test@example.com",
        password: "123",
      })
      .expect(400);

    expect(response.body.message).toEqual([
      "Password must not be less than 6 characters",
    ]);
  });

  it("POST /auth/register - name is too big (throw error 400)", async () => {
    const response = await request(app.getHttpServer())
      .post("/auth/register")
      .send({
        name: "a".repeat(31),
        email: "test@example.com",
        password: "testPassword",
      })
      .expect(400);

    expect(response.body.message).toEqual([
      "Name length should not exceed 30 characters",
    ]);
  });

  it("POST /auth/register - should create new user", async () => {
    const response = await request(app.getHttpServer())
      .post("/auth/register")
      .send({
        name: "testUser",
        email: "test@example.com",
        password: "testPassword",
      })
      .expect(201);

    expect(response.body.message).toEqual(
      "User has been successfully registered",
    );
  });

  it("POST /auth/register - name already exists (throw error 400)", async () => {
    const response = await request(app.getHttpServer())
      .post("/auth/register")
      .send({
        name: "testUser",
        email: "test2@example.com",
        password: "testPassword",
      })
      .expect(400);

    expect(response.body.message).toEqual(
      "User with this name or email already exists",
    );
  });

  it("POST /auth/register - email already exists (throw error 400)", async () => {
    const response = await request(app.getHttpServer())
      .post("/auth/register")
      .send({
        name: "testUser2",
        email: "test@example.com",
        password: "testPassword",
      })
      .expect(400);

    expect(response.body.message).toEqual(
      "User with this name or email already exists",
    );
  });

  it("POST /auth/login - no email field (throw error 400)", async () => {
    const response = await request(app.getHttpServer())
      .post("/auth/login")
      .send({
        password: "testPassword",
      })
      .expect(400);

    expect(response.body.message).toEqual([
      "Email is required",
      "Invalid email",
    ]);
  });

  it("POST /auth/login - no password field (throw error 400)", async () => {
    const response = await request(app.getHttpServer())
      .post("/auth/login")
      .send({
        email: "test@example.com",
      })
      .expect(400);

    expect(response.body.message).toEqual([
      "Password is required",
      "Password must not be less than 6 characters",
    ]);
  });

  it("POST /auth/login - is wrong password (throw error 400)", async () => {
    const response = await request(app.getHttpServer())
      .post("/auth/login")
      .send({
        email: "test@example.com",
        password: "wrongPassword",
      })
      .expect(400);

    expect(response.body.message).toEqual("Invalid email or password");
  });

  it("POST /auth/login - is wrong email (throw error 400)", async () => {
    const response = await request(app.getHttpServer())
      .post("/auth/login")
      .send({
        email: "wrong@example.com",
        password: "testPassword",
      })
      .expect(400);

    expect(response.body.message).toEqual("Invalid email or password");
  });

  it("POST /auth/login - login user", async () => {
    const response = await request(app.getHttpServer())
      .post("/auth/login")
      .send({
        email: "test@example.com",
        password: "testPassword",
      })
      .expect(200);

    expect(response.body.message).toEqual("Login has been successfully");
  });

  afterAll(async () => {
    await userModel.deleteMany({
      name: "testUser",
    });

    await app.close();
  });
});

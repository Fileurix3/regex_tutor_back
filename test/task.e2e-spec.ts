import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { App } from "supertest/types";
import { AppModule } from "./../src/app.module";
import { Model, Types } from "mongoose";
import { User } from "src/schemas/user.schema";
import { getModelToken } from "@nestjs/mongoose";
import { JwtService } from "@nestjs/jwt";
import * as cookieParser from "cookie-parser";
import { Task } from "src/schemas/task.schema";

describe("task (e2e)", () => {
  let app: INestApplication<App>;
  let userModel: Model<User>;
  let taskModel: Model<Task>;

  let userToken: string;
  let userId: string;

  let taskId: Types.ObjectId;

  const taskDto = {
    name: "Email address verification (test)",
    description:
      "Write a regular expression that checks if an email address is correct.",
    exampleTestCases: [
      {
        testCase: "test@example.com",
        output: true,
        description: "valid email",
      },
      {
        testCase: "testexample.com",
        output: false,
        description: "invalid email",
      },
      {
        testCase: "test@.com",
        output: false,
        description: "invalid email",
      },
    ],
    testCases: [
      {
        testCase: "test@example.com",
        output: true,
      },
      {
        testCase: "testexample.com",
        output: false,
      },
      {
        testCase: "test@.com",
        output: false,
      },
      {
        testCase: "test@exapmle",
        output: false,
      },
      {
        testCase: "123testEmail@exapmle.com",
        output: true,
      },
      {
        testCase: "test@exapmle.a",
        output: false,
      },
      {
        testCase: "test@exapmle.aaaaaaaaaaaaa",
        output: false,
      },
      {
        testCase: "@exapmle.com",
        output: false,
      },
    ],
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();

    userModel = moduleFixture.get<Model<User>>(getModelToken("User"));
    taskModel = moduleFixture.get<Model<Task>>(getModelToken("Task"));
    const jwtService = moduleFixture.get(JwtService);

    await request(app.getHttpServer()).post("/auth/register").send({
      name: "testUser",
      email: "test@example.com",
      password: "testPassword",
    });

    const responseUser = await request(app.getHttpServer())
      .post("/auth/login")
      .send({
        email: "test@example.com",
        password: "testPassword",
      });

    const cookiesAuthUser = responseUser.headers["set-cookie"];

    for (let i = 0; i < cookiesAuthUser.length; i++) {
      if (cookiesAuthUser[0].startsWith("token=")) {
        userToken = cookiesAuthUser[i].split(/\;/)[0].split(/\=/)[1];
        break;
      }
    }

    userId = jwtService.verify(userToken).userId;
  });

  it("POST /task/create - if user unauthorized (without token throw error 401)", async () => {
    const response = await request(app.getHttpServer())
      .post("/task/create")
      .send(taskDto)
      .expect(401);

    expect(response.body.message).toEqual("Unauthorized");
  });

  it("POST /task/create - if user without admin role (throw error 403)", async () => {
    const response = await request(app.getHttpServer())
      .post("/task/create")
      .set("Cookie", `token=${userToken}`)
      .send(taskDto)
      .expect(403);

    expect(response.body.message).toEqual("You don't have enough rights");
  });

  it("POST /task/create - invalid request data (throw error 400)", async () => {
    await changeUserRoleToAdmin(userId);

    await request(app.getHttpServer())
      .post("/task/create")
      .set("Cookie", `token=${userToken}`)
      .send({ name: "invalid data" })
      .expect(400);

    await changeUserRoleToUser(userId);
  });

  it("POST /task/create - create new task", async () => {
    await changeUserRoleToAdmin(userId);

    const response = await request(app.getHttpServer())
      .post("/task/create")
      .set("Cookie", `token=${userToken}`)
      .send(taskDto)
      .expect(201);

    expect(response.body.message).toEqual("Task has been created successfully");

    const task = await taskModel.findOne({ name: taskDto.name }).lean();

    taskId = task!._id;

    await changeUserRoleToUser(userId);
  });

  it("GET /task/get/{taskId} - invalid task id (throw error 400)", async () => {
    const response = await request(app.getHttpServer())
      .get(`/task/get/123`)
      .expect(400);

    expect(response.body.message).toEqual("Invalid task id");
  });

  it("GET /task/get/{taskId} - get task by id", async () => {
    const response = await request(app.getHttpServer())
      .get(`/task/get/${taskId}`)
      .expect(200);

    expect(response.body.task).toHaveProperty("_id");
    expect(response.body.task.name).toEqual(taskDto.name);
    expect(response.body.task.description).toEqual(taskDto.description);
    expect(response.body.task).toHaveProperty("createdAt");
    expect(response.body.task).toHaveProperty("updatedAt");
    expect(response.body.task).toHaveProperty("exampleTestCases");

    expect(response.body.task.exampleTestCases).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          testCase: expect.any(String),
          output: expect.any(Boolean),
          description: expect.any(String),
        }),
      ]),
    );
  });

  it("GET /task/get - get tasks page", async () => {
    const response = await request(app.getHttpServer())
      .get(`/task/get`)
      .expect(200);

    expect(response.body.currentPage).toEqual(1);
    expect(response.body).toHaveProperty("totalPages");
    expect(response.body).toHaveProperty("totalTasks");
    expect(response.body).toHaveProperty("tasks");

    expect(response.body.tasks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          _id: expect.any(String),
          name: expect.any(String),
          description: expect.any(String),
          createdAt: expect.any(String),
        }),
      ]),
    );
  });

  it("POST /task/submit/{taskId} - if user unauthorized (without token throw error 401)", async () => {
    const response = await request(app.getHttpServer())
      .post(`/task/submit/${taskId}`)
      .expect(401);

    expect(response.body.message).toEqual("Unauthorized");
  });

  it("POST /task/submit/{taskId} - no regexSubmit field (throw error 400)", async () => {
    const response = await request(app.getHttpServer())
      .post(`/task/submit/${taskId}`)
      .set("Cookie", `token=${userToken}`)
      .expect(400);

    expect(response.body.message).toEqual("Submit regex is required");
  });

  it("POST /task/submit/{taskId} - if don't passed all test cases (throw error 400)", async () => {
    const response = await request(app.getHttpServer())
      .post(`/task/submit/${taskId}`)
      .set("Cookie", `token=${userToken}`)
      .send({ submitRegex: "@" })
      .expect(400);

    expect(response.body.message).toEqual("Test case failed");
    expect(response.body).toHaveProperty("testCase");
    expect(response.body).toHaveProperty("output");
    expect(response.body).toHaveProperty("expected");
  });

  it("POST /task/submit/{taskId} - if passed all test cases", async () => {
    const response = await request(app.getHttpServer())
      .post(`/task/submit/${taskId}`)
      .set("Cookie", `token=${userToken}`)
      .send({ submitRegex: "^[a-zA-Z0-9]+@[a-z]+\\.[a-z]{2,3}$" })
      .expect(202);

    expect(response.body.message).toEqual(
      "Task has been successfully completed",
    );
  });

  it("GET /task/get/all/testCases/{taskId} - if user unauthorized (without token throw error 401)", async () => {
    const response = await request(app.getHttpServer())
      .get(`/task/get/all/testCases/${taskId}`)
      .expect(401);

    expect(response.body.message).toEqual("Unauthorized");
  });

  it("GET /task/get/all/testCases/{taskId} - if user without admin role (throw error 403)", async () => {
    const response = await request(app.getHttpServer())
      .get(`/task/get/all/testCases/${taskId}`)
      .set("Cookie", `token=${userToken}`)
      .expect(403);

    expect(response.body.message).toEqual("You don't have enough rights");
  });

  it("GET /task/get/all/testCases/{taskId} - invalid task id (throw error 400)", async () => {
    await changeUserRoleToAdmin(userId);
    const response = await request(app.getHttpServer())
      .get(`/task/get/all/testCases/123`)
      .set("Cookie", `token=${userToken}`)
      .expect(400);

    expect(response.body.message).toEqual("Invalid task id");

    await changeUserRoleToUser(userId);
  });

  it("GET /task/get/all/testCases/{taskId} - get all test cases", async () => {
    await changeUserRoleToAdmin(userId);
    const response = await request(app.getHttpServer())
      .get(`/task/get/all/testCases/${taskId}`)
      .set("Cookie", `token=${userToken}`)
      .expect(200);

    expect(response.body.task).toHaveProperty("_id");
    expect(response.body.task.name).toEqual(taskDto.name);
    expect(response.body.task.description).toEqual(taskDto.description);
    expect(response.body.task).toHaveProperty("createdAt");
    expect(response.body.task).toHaveProperty("updatedAt");
    expect(response.body.task).toHaveProperty("exampleTestCases");
    expect(response.body.task).toHaveProperty("testCases");

    expect(response.body.task.exampleTestCases).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          testCase: expect.any(String),
          output: expect.any(Boolean),
          description: expect.any(String),
        }),
      ]),
    );

    expect(response.body.task.testCases).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          testCase: expect.any(String),
          output: expect.any(Boolean),
        }),
      ]),
    );

    await changeUserRoleToUser(userId);
  });

  it("PUT /task/update/{taskId} - if user unauthorized (without token throw error 401)", async () => {
    const response = await request(app.getHttpServer())
      .put(`/task/update/${taskId}`)
      .expect(401);

    expect(response.body.message).toEqual("Unauthorized");
  });

  it("PUT /task/update/{taskId} - invalid request data (throw error 400)", async () => {
    await changeUserRoleToAdmin(userId);

    await request(app.getHttpServer())
      .put(`/task/update/123`)
      .set("Cookie", `token=${userToken}`)
      .send({ name: "invalid request data" })
      .expect(400);

    await changeUserRoleToUser(userId);
  });

  it("PUT /task/update/{taskId} - if user without admin role (throw error 403)", async () => {
    const response = await request(app.getHttpServer())
      .put(`/task/update/${taskId}`)
      .set("Cookie", `token=${userToken}`)
      .expect(403);

    expect(response.body.message).toEqual("You don't have enough rights");
  });

  it("PUT /task/update/{taskId} - invalid task id (throw error 400)", async () => {
    await changeUserRoleToAdmin(userId);
    const response = await request(app.getHttpServer())
      .put(`/task/update/123`)
      .set("Cookie", `token=${userToken}`)
      .send(taskDto)
      .expect(400);

    expect(response.body.message).toEqual("Invalid task id");

    await changeUserRoleToUser(userId);
  });

  it("PUT /task/update/{taskId} - if task with this name already exists (throw error 400)", async () => {
    await changeUserRoleToAdmin(userId);
    const response = await request(app.getHttpServer())
      .put(`/task/update/${taskId}`)
      .set("Cookie", `token=${userToken}`)
      .send(taskDto)
      .expect(400);

    expect(response.body.message).toEqual("Task with this name already exists");

    await changeUserRoleToUser(userId);
  });

  it("PUT /task/update/{taskId} - update task", async () => {
    let newTaskDto = taskDto;
    newTaskDto.name = "new Name";

    await changeUserRoleToAdmin(userId);
    const response = await request(app.getHttpServer())
      .put(`/task/update/${taskId}`)
      .set("Cookie", `token=${userToken}`)
      .send(newTaskDto)
      .expect(200);

    expect(response.body.message).toEqual("Task has been successfully updated");

    await changeUserRoleToUser(userId);
  });

  afterAll(async () => {
    await taskModel.deleteMany({
      _id: taskId,
    });

    await userModel.deleteMany({
      name: "testUser",
    });

    await app.close();
  });

  async function changeUserRoleToAdmin(userId: string) {
    await userModel.updateOne({ _id: userId }, { role: "Admin" });
  }

  async function changeUserRoleToUser(userId: string) {
    await userModel.updateOne({ _id: userId }, { role: "User" });
  }
});

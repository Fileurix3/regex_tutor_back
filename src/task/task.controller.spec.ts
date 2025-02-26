import { Test, TestingModule } from "@nestjs/testing";
import { TaskController } from "./task.controller";
import { TaskService } from "./task.service";
import { Response, Request } from "express";
import { JwtService } from "@nestjs/jwt";
import { User } from "../schemas/user.schema";
import { getModelToken } from "@nestjs/mongoose";
import { TaskDto } from "./dto/task.dto";

describe("TaskController", () => {
  let taskController: TaskController;
  let taskService: TaskService;
  let mockRes: Partial<Response>;
  let mockReq: Partial<Request>;

  beforeEach(async () => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockReq = {
      cookies: { token: "someToken" },
    } as unknown as Request;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TaskService,
          useValue: {
            createTask: jest.fn(),
            getTaskByName: jest.fn(),
            getTasks: jest.fn(),
            submitTask: jest.fn(),
            getTaskWithAllTestCasesByName: jest.fn(),
            updateTask: jest.fn(),
          },
        },
        {
          provide: getModelToken(User.name),
          useValue: {
            findOne: jest.fn(),
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

    taskController = module.get<TaskController>(TaskController);
    taskService = module.get<TaskService>(TaskService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("POST /task/create - should call TaskService.createTask and return correct data", async () => {
    const taskDto: TaskDto = {
      name: "Task 1",
      description: "Description of task 1",
      exampleTestCases: [],
      testCases: [],
    };

    const result = { message: "Task has been created successfully" };

    jest.spyOn(taskService, "createTask").mockResolvedValueOnce(result as any);

    await taskController.createTask(taskDto, mockRes as Response);

    expect(taskService.createTask).toHaveBeenCalledWith(taskDto);
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(result);
  });

  it("GET /task/get/:taskName - should call TaskService.getTaskByName and return correct data", async () => {
    const taskName: string = "Task 1";
    const result = {
      task: {
        name: "Task 1",
        description: "Description of task 1",
        createdAd: "2021-1-1",
      },
    };

    jest
      .spyOn(taskService, "getTaskByName")
      .mockResolvedValueOnce(result as any);

    await taskController.getTaskByName(taskName, mockRes as Response);

    expect(taskService.getTaskByName).toHaveBeenCalledWith(taskName);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(result);
  });

  it("GET /task/get - should call TaskService.getTasks and return correct data", async () => {
    const userToken: string = "someToken";
    const result = {
      currentPage: 1,
      totalPages: 1,
      totalTasks: 1,
      tasks: [
        {
          name: "Task 1",
          description: "Description of task 1",
          createdAd: "2021-1-1",
        },
      ],
    };

    jest.spyOn(taskService, "getTasks").mockResolvedValueOnce(result as any);

    await taskController.getTasks(1, mockReq as Request, mockRes as Response);

    expect(taskService.getTasks).toHaveBeenCalledWith(50, 1, userToken);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(result);
  });

  it("POST /task/submit/:taskName - should call TaskService.submitTask and return correct data", async () => {
    const submitRegex: string = "someRegex";
    const taskName: string = "Task 1";
    const userToken: string = mockReq.cookies!.token;
    const result = { message: "Task has been successfully completed" };

    jest.spyOn(taskService, "submitTask").mockResolvedValueOnce(result as any);

    await taskController.submitTask(
      submitRegex,
      taskName,
      mockReq as Request,
      mockRes as Response,
    );

    expect(taskService.submitTask).toHaveBeenCalledWith(
      userToken,
      submitRegex,
      taskName,
    );
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(result);
  });

  it("GET /task/get/all/testCases/:taskName - should call TaskService.getTaskWithAllTestCasesByName and return correct data", async () => {
    const taskName: string = "Task 1";
    const result = { task: { name: "Task 1", testCases: [] } };

    jest
      .spyOn(taskService, "getTaskWithAllTestCasesByName")
      .mockResolvedValueOnce(result as any);

    await taskController.getTaskWithAllTestCasesById(
      taskName,
      mockRes as Response,
    );

    expect(taskService.getTaskWithAllTestCasesByName).toHaveBeenCalledWith(
      taskName,
    );
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(result);
  });

  it("PUT /task/update/:taskId - should call TaskService.updateTask and return correct data", async () => {
    const taskId: string = "1";
    const taskDto: TaskDto = {
      name: "Task 1 update",
      description: "Description of task 1 update",
      exampleTestCases: [],
      testCases: [],
    };
    const result = { message: "Task has been successfully updated" };

    jest.spyOn(taskService, "updateTask").mockResolvedValueOnce(result as any);

    await taskController.updateTaskById(taskDto, taskId, mockRes as Response);

    expect(taskService.updateTask).toHaveBeenCalledWith(taskDto, taskId);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(result);
  });
});

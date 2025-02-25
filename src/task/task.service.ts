import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Task, TaskDocument } from "src/schemas/task.schema";
import { Model } from "mongoose";
import { TaskDto } from "./dto/task.dto";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class TaskService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<Task>,
    private jwtService: JwtService,
  ) {}

  async createTask(taskDto: TaskDto) {
    const { name, description, exampleTestCases, testCases } = taskDto;

    const existThisName: TaskDocument | null = await this.taskModel.findOne({
      name: name,
    });

    if (existThisName != null) {
      throw new BadRequestException("This name already exists");
    }

    await this.taskModel.create({
      name: name,
      description: description,
      exampleTestCases: exampleTestCases,
      testCases: testCases,
    });

    return {
      message: "Task has been created successfully",
    };
  }

  async getTaskByName(taskName: string) {
    const task: TaskDocument | null = await this.taskModel.findOne(
      { name: taskName },
      { _id: 1, name: 1, description: 1, exampleTestCases: 1 },
    );

    if (task == null) {
      throw new NotFoundException("Task not found");
    }

    return { task };
  }

  async getTasks(limit: number, offset: number) {
    if (offset < 1) {
      throw new BadRequestException("Offset can't be less than 1");
    }

    const skip = (offset - 1) * limit;

    const tasks: TaskDocument[] = await this.taskModel
      .find({}, { _id: 1, name: 1, description: 1 })
      .skip(skip)
      .limit(limit);

    const totalTasks: number = await this.taskModel.countDocuments();

    return {
      currentPage: offset,
      totalPages: Math.ceil(totalTasks / limit),
      totalTasks: totalTasks,
      tasks: tasks,
    };
  }

  async submitTask(userToken: string, submitRegex: string, taskName: string) {
    if (!submitRegex) {
      throw new BadRequestException("Submit regex is required");
    }

    const userId: string = this.jwtService.verify(userToken).userId;
    const regex: RegExp = new RegExp(submitRegex);
    const task: TaskDocument | null = await this.taskModel.findOne({
      name: taskName,
    });

    if (task == null) {
      throw new NotFoundException("Task not found");
    }

    const testCases = task.testCases;

    for (let i = 0; i < testCases.length; i++) {
      const passed: boolean = regex.test(testCases[i].testCase);

      if (passed != Boolean(testCases[i].output)) {
        return {
          message: "Test case failed",
          testCase: testCases[i].testCase,
          output: passed,
          expected: testCases[i].output,
        };
      }
    }

    return { message: "Task has been successfully completed" };
  }

  async getTaskWithAllTestCasesById(taskId: string) {}

  async deleteTask(taskId: string) {}

  async updateTask(taskDto: TaskDto, taskId: string) {}
}

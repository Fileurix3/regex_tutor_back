import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Task, TaskDocument } from "src/schemas/task.schema";
import { Model } from "mongoose";
import { TaskDto } from "./dto/task.dto";

@Injectable()
export class TaskService {
  constructor(@InjectModel(Task.name) private taskModel: Model<Task>) {}

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

  async getTaskById(taskId: string) {}

  async getTasks(limit: number, offset: number) {}

  async submitTask(userToken: string, submitRegex: string, taskId: string) {}

  async getTaskWithAllTestCasesById(taskId: string) {}

  async deleteTask(taskId: string) {}

  async updateTask(taskDto: TaskDto, taskId: string) {}
}

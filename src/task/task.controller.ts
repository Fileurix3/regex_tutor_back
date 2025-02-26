import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { TaskService } from "./task.service";
import { AuthGuard } from "../guards/auth.guard";
import { Request } from "express";
import { TaskDto } from "./dto/task.dto";
import { IsAdminGuard } from "../guards/is_admin.guard";

@Controller("task")
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @UseGuards(AuthGuard)
  @UseGuards(IsAdminGuard)
  @UsePipes(ValidationPipe)
  @Post("create")
  @HttpCode(201)
  async createTask(@Body() taskDto: TaskDto) {
    const message = await this.taskService.createTask(taskDto);
    return message;
  }

  @Get("get/:taskId")
  @HttpCode(200)
  async getTaskByName(@Param("taskId") taskId: string) {
    const message = await this.taskService.getTaskById(taskId);
    return message;
  }

  @Get("get")
  @HttpCode(200)
  async getTasks(@Query("offset") offset: number = 1, @Req() req: Request) {
    const userToken = req.cookies.token;
    const message = await this.taskService.getTasks(50, offset, userToken);
    return message;
  }

  @UseGuards(AuthGuard)
  @Post("submit/:taskId")
  @HttpCode(202)
  async submitTask(
    @Body("submitRegex") submitRegex: string,
    @Param("taskId") taskId: string,
    @Req() req: Request,
  ) {
    const userToken: string = req.cookies.token;
    const message = await this.taskService.submitTask(
      userToken,
      submitRegex,
      taskId,
    );

    return message;
  }

  @UseGuards(AuthGuard)
  @UseGuards(IsAdminGuard)
  @Get("get/all/testCases/:taskId")
  @HttpCode(200)
  async getTaskWithAllTestCasesById(@Param("taskId") taskId: string) {
    const message = await this.taskService.getTaskWithAllTestCasesById(taskId);
    return message;
  }

  @UseGuards(AuthGuard)
  @UseGuards(IsAdminGuard)
  @Put("update/:taskId")
  @HttpCode(200)
  async updateTaskById(
    @Body() taskDto: TaskDto,
    @Param("taskId") taskId: string,
  ) {
    const message = await this.taskService.updateTask(taskDto, taskId);
    return message;
  }
}

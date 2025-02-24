import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { TaskService } from "./task.service";
import { AuthGuard } from "src/guards/auth.guard";
import { Request, Response } from "express";
import { TaskDto } from "./dto/task.dto";
import { IsAdminGuard } from "src/guards/is_admin.guard";

@Controller("task")
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @UseGuards(AuthGuard)
  @UseGuards(IsAdminGuard)
  @UsePipes(ValidationPipe)
  @Post("create")
  async createTask(@Body() taskDto: TaskDto, @Res() res: Response) {
    const message = await this.taskService.createTask(taskDto);
    return res.status(201).json(message);
  }

  @Get("get/:taskId")
  async getTaskById(@Param("taskId") taskId: string, @Res() res: Response) {
    const message = await this.taskService.getTaskById(taskId);
    return res.status(200).json(message);
  }

  @Get("get")
  async getTasks(@Query() offset: number = 0, @Res() res: Response) {
    const message = await this.taskService.getTasks(50, offset);
    return res.status(200).json(message);
  }

  @UseGuards(AuthGuard)
  @Post("submit/:taskId")
  async submitTask(
    @Body("submitRegex") submitRegex: string,
    @Param("taskId") taskId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const userToken: string = req.cookies.token;
    const message = await this.taskService.submitTask(
      userToken,
      submitRegex,
      taskId,
    );

    return res.status(200).json(message);
  }

  @UseGuards(AuthGuard)
  @UseGuards(IsAdminGuard)
  @Get("get/all/testCases/:taskId")
  async getTaskWithAllTestCasesById(
    @Param("taskId") taskId: string,
    @Res() res: Response,
  ) {
    const message = await this.taskService.getTaskWithAllTestCasesById(taskId);
    return res.status(200).json(message);
  }

  @UseGuards(AuthGuard)
  @UseGuards(IsAdminGuard)
  @Delete("delete/:taskId")
  async deleteTask(@Param("taskId") taskId: string, @Res() res: Response) {
    const message = await this.taskService.deleteTask(taskId);
    return res.status(200).json(message);
  }

  @UseGuards(AuthGuard)
  @UseGuards(IsAdminGuard)
  @Put("update/:taskId")
  async updateTask(
    @Body() taskDto: TaskDto,
    @Param("taskId") taskId: string,
    @Res() res: Response,
  ) {
    const message = await this.taskService.updateTask(taskDto, taskId);
    return res.status(200).json(message);
  }
}

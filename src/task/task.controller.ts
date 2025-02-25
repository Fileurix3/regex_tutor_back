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

  @Get("get/:taskName")
  async getTaskByName(
    @Param("taskName") taskName: string,
    @Res() res: Response,
  ) {
    const message = await this.taskService.getTaskByName(taskName);
    return res.status(200).json(message);
  }

  @Get("get")
  async getTasks(
    @Query("offset") offset: number = 1,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const userToken = req.cookies.token;
    const message = await this.taskService.getTasks(50, offset, userToken);
    return res.status(200).json(message);
  }

  @UseGuards(AuthGuard)
  @Post("submit/:taskName")
  async submitTask(
    @Body("submitRegex") submitRegex: string,
    @Param("taskName") taskName: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const userToken: string = req.cookies.token;
    const message = await this.taskService.submitTask(
      userToken,
      submitRegex,
      taskName,
    );

    return res.status(200).json(message);
  }

  @UseGuards(AuthGuard)
  @UseGuards(IsAdminGuard)
  @Get("get/all/testCases/:taskName")
  async getTaskWithAllTestCasesById(
    @Param("taskName") taskName: string,
    @Res() res: Response,
  ) {
    const message =
      await this.taskService.getTaskWithAllTestCasesByName(taskName);
    return res.status(200).json(message);
  }

  @UseGuards(AuthGuard)
  @UseGuards(IsAdminGuard)
  @Delete("delete/:taskName")
  async deleteTask(@Param("taskName") taskName: string, @Res() res: Response) {
    const message = await this.taskService.deleteTask(taskName);
    return res.status(200).json(message);
  }

  @UseGuards(AuthGuard)
  @UseGuards(IsAdminGuard)
  @Put("update/:taskName")
  async updateTask(
    @Body() taskDto: TaskDto,
    @Param("taskName") taskName: string,
    @Res() res: Response,
  ) {
    const message = await this.taskService.updateTask(taskDto, taskName);
    return res.status(200).json(message);
  }
}

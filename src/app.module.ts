import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule } from "@nestjs/config";
import { TaskModule } from "./task/task.module";
import { UserModule } from './user/user.module';
@Module({
  imports: [
    AuthModule,
    TaskModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URI as string),
    UserModule,
  ],
})
export class AppModule {}

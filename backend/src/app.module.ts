import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { ConfigModule } from "@nestjs/config";
import { TransactionsModule } from "./transactions/transactions.module";
import { CategoryKeywordsModule } from "./category-keywords/category-keywords.module";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "../dist/frontend"),
      serveRoot: "/",
      exclude: ["/api*"],
    }),
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      useFactory: async () => ({
        type: "postgres",
        host: process.env.DATABASE_HOST || "localhost",
        port: parseInt(process.env.DATABASE_PORT || "5432", 10),
        username: process.env.DATABASE_USER || "postgres",
        password: process.env.DATABASE_PASSWORD || "password",
        database: process.env.DATABASE_NAME || "expenditure_analyzer",
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    TransactionsModule,
    CategoryKeywordsModule,
  ],
})
export class AppModule {}

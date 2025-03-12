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
        url: process.env.DATABASE_URL,
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    TransactionsModule,
    CategoryKeywordsModule,
  ],
})
export class AppModule {}

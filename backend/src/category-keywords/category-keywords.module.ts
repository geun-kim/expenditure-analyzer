import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CategoryKeywordsService } from "./category-keywords.service";
import { CategoryKeywordsController } from "./category-keywords.controller";
import { CategoryKeywords } from "../entities/category-keywords.entity";

@Module({
  imports: [TypeOrmModule.forFeature([CategoryKeywords])],
  providers: [CategoryKeywordsService],
  controllers: [CategoryKeywordsController],
})
export class CategoryKeywordsModule {}

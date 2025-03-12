import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  Query,
  BadRequestException,
} from "@nestjs/common";
import { CategoryKeywordsService } from "./category-keywords.service";
import { CategoryKeywordsDto } from "../dto/category-keywords.dto";

@Controller("category-keywords")
export class CategoryKeywordsController {
  constructor(
    private readonly categoryKeywordsService: CategoryKeywordsService,
  ) {}

  @Get()
  async getAllCategories(@Query("userId") userId: string) {
    if (!userId) {
      throw new BadRequestException("userId query param is required");
    }
    return this.categoryKeywordsService.getAllCategories(userId);
  }

  @Post()
  async addOrUpdateCategory(
    @Body() dto: CategoryKeywordsDto,
    @Query("userId") userId: string,
  ) {
    if (!userId) {
      throw new BadRequestException("userId query param is required");
    }
    return this.categoryKeywordsService.addOrUpdateCategory(dto, userId);
  }

  @Delete(":category")
  async deleteCategory(
    @Param("category") category: string,
    @Query("userId") userId: string,
  ) {
    if (!userId) {
      throw new BadRequestException("userId query param is required");
    }
    await this.categoryKeywordsService.deleteCategory(category, userId);
    return { message: `Category "${category}" deleted.` };
  }
}

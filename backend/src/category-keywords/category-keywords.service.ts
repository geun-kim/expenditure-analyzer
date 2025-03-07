import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CategoryKeywords } from "../entities/category-keywords.entity";
import { CategoryKeywordsDto } from "../dto/category-keywords.dto";

@Injectable()
export class CategoryKeywordsService {
  constructor(
    @InjectRepository(CategoryKeywords)
    private readonly categoryRepo: Repository<CategoryKeywords>,
  ) {}

  async getAllCategories(userId: string): Promise<CategoryKeywords[]> {
    return this.categoryRepo.find({ where: { userId } });
  }

  // Add or update a category
  async addOrUpdateCategory(
    dto: CategoryKeywordsDto,
    userId: string,
  ): Promise<CategoryKeywords> {
    const { category, keywords } = dto;

    let categoryRecord = await this.categoryRepo.findOne({
      where: { category, userId },
    });

    if (categoryRecord) {
      // Update existing record
      categoryRecord.keywords = keywords;
    } else {
      // Create new record
      categoryRecord = this.categoryRepo.create({ category, keywords, userId });
    }

    return this.categoryRepo.save(categoryRecord);
  }

  // Delete a category
  async deleteCategory(category: string, userId: string): Promise<void> {
    await this.categoryRepo.delete({ category, userId });
  }
}

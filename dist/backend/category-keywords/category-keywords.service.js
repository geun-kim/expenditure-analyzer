"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryKeywordsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const category_keywords_entity_1 = require("../entities/category-keywords.entity");
let CategoryKeywordsService = class CategoryKeywordsService {
    constructor(categoryRepo) {
        this.categoryRepo = categoryRepo;
    }
    async getAllCategories(userId) {
        return this.categoryRepo.find({ where: { userId } });
    }
    async addOrUpdateCategory(dto, userId) {
        const { category, keywords } = dto;
        let categoryRecord = await this.categoryRepo.findOne({
            where: { category, userId },
        });
        if (categoryRecord) {
            categoryRecord.keywords = keywords;
        }
        else {
            categoryRecord = this.categoryRepo.create({ category, keywords, userId });
        }
        return this.categoryRepo.save(categoryRecord);
    }
    async deleteCategory(category, userId) {
        await this.categoryRepo.delete({ category, userId });
    }
};
exports.CategoryKeywordsService = CategoryKeywordsService;
exports.CategoryKeywordsService = CategoryKeywordsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(category_keywords_entity_1.CategoryKeywords)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CategoryKeywordsService);
//# sourceMappingURL=category-keywords.service.js.map
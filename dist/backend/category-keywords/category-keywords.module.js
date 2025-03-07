"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryKeywordsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const category_keywords_service_1 = require("./category-keywords.service");
const category_keywords_controller_1 = require("./category-keywords.controller");
const category_keywords_entity_1 = require("../entities/category-keywords.entity");
let CategoryKeywordsModule = class CategoryKeywordsModule {
};
exports.CategoryKeywordsModule = CategoryKeywordsModule;
exports.CategoryKeywordsModule = CategoryKeywordsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([category_keywords_entity_1.CategoryKeywords])],
        providers: [category_keywords_service_1.CategoryKeywordsService],
        controllers: [category_keywords_controller_1.CategoryKeywordsController],
    })
], CategoryKeywordsModule);
//# sourceMappingURL=category-keywords.module.js.map
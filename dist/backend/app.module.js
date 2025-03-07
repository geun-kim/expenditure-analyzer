"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const config_1 = require("@nestjs/config");
const transactions_module_1 = require("./transactions/transactions.module");
const category_keywords_module_1 = require("./category-keywords/category-keywords.module");
const typeorm_1 = require("@nestjs/typeorm");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, "../../frontend/dist/frontend"),
                exclude: ["/api*"],
            }),
            config_1.ConfigModule.forRoot(),
            typeorm_1.TypeOrmModule.forRootAsync({
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
            transactions_module_1.TransactionsModule,
            category_keywords_module_1.CategoryKeywordsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map
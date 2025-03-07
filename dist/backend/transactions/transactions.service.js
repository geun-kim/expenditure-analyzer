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
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const transaction_entity_1 = require("../entities/transaction.entity");
let TransactionsService = class TransactionsService {
    constructor(transactionRepository) {
        this.transactionRepository = transactionRepository;
    }
    async create(transactionData) {
        try {
            const transaction = this.transactionRepository.create(transactionData);
            return await this.transactionRepository.save(transaction);
        }
        catch (error) {
            console.error("Failed to insert transaction:", transactionData);
            console.error("Error details:", error);
            throw new Error("Failed to insert transaction.");
        }
    }
    async findAll(userId) {
        try {
            const transactions = await this.transactionRepository.find({
                where: { userId },
            });
            return transactions.length > 0
                ? transactions.map((txn) => ({
                    ...txn,
                    cad: parseFloat(txn.cad),
                    usd: parseFloat(txn.usd),
                }))
                : [];
        }
        catch (error) {
            console.error("Failed to fetch transactions:", error);
            throw new Error("Could not retrieve transactions.");
        }
    }
    async delete(id, userId) {
        await this.transactionRepository.delete({ id, userId });
    }
    async batchUpdate(updates) {
        const queryRunner = this.transactionRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            for (const update of updates) {
                await queryRunner.manager.update(transaction_entity_1.Transaction, update.id, {
                    category: update.category,
                });
            }
            await queryRunner.commitTransaction();
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map
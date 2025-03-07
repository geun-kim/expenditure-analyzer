import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Transaction } from "../entities/transaction.entity";

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async create(transactionData: Partial<Transaction>): Promise<Transaction> {
    try {
      const transaction = this.transactionRepository.create(transactionData);
      return await this.transactionRepository.save(transaction);
    } catch (error) {
      console.error("Failed to insert transaction:", transactionData);
      console.error("Error details:", error);
      throw new Error("Failed to insert transaction.");
    }
  }

  async findAll(userId: string): Promise<Transaction[]> {
    try {
      const transactions = await this.transactionRepository.find({
        where: { userId },
      });
      return transactions.length > 0
        ? transactions.map((txn) => ({
            ...txn,
            cad: parseFloat(txn.cad as unknown as string),
            usd: parseFloat(txn.usd as unknown as string),
          }))
        : [];
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      throw new Error("Could not retrieve transactions.");
    }
  }

  async delete(id: number, userId: string): Promise<void> {
    await this.transactionRepository.delete({ id, userId });
  }

  async batchUpdate(
    updates: { id: number; category: string }[],
  ): Promise<void> {
    const queryRunner =
      this.transactionRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const update of updates) {
        await queryRunner.manager.update(Transaction, update.id, {
          category: update.category,
        });
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}

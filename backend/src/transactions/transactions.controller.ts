import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  Patch,
  Query,
} from "@nestjs/common";
import { TransactionsService } from "./transactions.service";
import { Transaction } from "../entities/transaction.entity";

@Controller("transactions")
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  async create(
    @Body() transactionData: Partial<Transaction>,
  ): Promise<Transaction> {
    return this.transactionsService.create(transactionData);
  }

  @Get()
  async findAll(@Query("userId") userId: string): Promise<Transaction[]> {
    return this.transactionsService.findAll(userId);
  }

  @Delete(":id")
  async deleteTransaction(
    @Param("id") id: number,
    @Query("userId") userId: string,
  ): Promise<void> {
    await this.transactionsService.delete(id, userId);
  }

  @Patch("batch-update")
  async batchUpdateTransactions(
    @Body() body: { updates: { id: number; category: string }[] },
  ) {
    await this.transactionsService.batchUpdate(body.updates);
    return { message: "Batch update successful." };
  }
}

import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Transaction, CategoryKeywords } from "../../common/app.type";
import { CategoryKeywordsApiService } from "../category-keywords-api/category-keywords-api.service";

@Injectable({
  providedIn: "root",
})
export class TransactionStateService {
  private transactionsSubject = new BehaviorSubject<Transaction[]>([]);
  transactions$ = this.transactionsSubject.asObservable();
  private categoryKeywordsSubject = new BehaviorSubject<CategoryKeywords>({});
  categoryKeywords$ = this.categoryKeywordsSubject.asObservable();

  constructor(private categoryApi: CategoryKeywordsApiService) {
    this.loadCategories(); // Load categories on service init
  }

  loadCategories(): void {
    this.categoryApi.getAllCategories().subscribe((categories) => {
      const mapped = categories.reduce(
        (acc, item) => {
          acc[item.category] = item.keywords.split(",").map((k) => k.trim());
          return acc;
        },
        {} as { [key: string]: string[] },
      );

      this.categoryKeywordsSubject.next(mapped);
    });
  }

  refreshCategories(): void {
    this.loadCategories();
  }

  // Update state with new transactions
  setTransactions(transactions: Transaction[]): void {
    this.transactionsSubject.next(transactions);
  }

  // Get current transaction list
  getTransactions(): Transaction[] {
    return this.transactionsSubject.value;
  }
}

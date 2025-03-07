import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Transaction, CategoryUpdate } from "../../common/app.type";

@Injectable({
  providedIn: "root",
})
export class TransactionsApiService {
  private apiUrl = "http://localhost:3000/api/transactions"; // NestJS API URL

  userId = localStorage.getItem("userId");

  constructor(private http: HttpClient) {}

  // Fetch all transactions
  getTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(this.apiUrl, {
      params: {
        userId: this.userId || "",
      },
    });
  }

  // Save a new transaction
  addTransaction(transaction: Transaction): Observable<Transaction> {
    console.log("Transaction being sent:", transaction);

    return this.http.post<Transaction>(this.apiUrl, transaction);
  }

  deleteTransaction(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      params: { userId: this.userId || "" },
    });
  }

  batchUpdateTransactions(updates: CategoryUpdate[]): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/batch-update`, { updates });
  }
}

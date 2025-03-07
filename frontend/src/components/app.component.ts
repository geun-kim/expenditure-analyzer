import { Component, OnInit, OnDestroy } from "@angular/core";
import { takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";
import { TransactionsApiService } from "../services/transactions-api/transactions-api.service";
import { TransactionStateService } from "../services/transactions-state/transactions-state.service";
import { Transaction } from "../common/app.type";
import { Router } from "@angular/router";

@Component({
  selector: "app-root",
  standalone: false,
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent implements OnInit, OnDestroy {
  title = "budget-tracker";
  isDashboard = false;
  userId: string = "";
  private destroy$ = new Subject<void>();

  constructor(
    private transactionsApiService: TransactionsApiService,
    private transactionStateService: TransactionStateService,
    private router: Router,
  ) {
    this.router.events.subscribe(() => {
      this.isDashboard = this.router.url.includes("dashboard");
    });
  }

  ngOnInit(): void {
    this.loadUserId();

    this.transactionsApiService
      .getTransactions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: Transaction[]) => {
          this.transactionStateService.setTransactions(data);
        },
        error: (error) => console.error("Error fetching transactions:", error),
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUserId(): void {
    let storedUserId = localStorage.getItem("userId");
    if (!storedUserId) {
      storedUserId = this.generateUniqueId();
      localStorage.setItem("userId", storedUserId);
    }
    this.userId = storedUserId;
  }

  generateNewUserId(): void {
    this.userId = this.generateUniqueId();
    localStorage.setItem("userId", this.userId);
    alert(
      `New User ID Generated: ${this.userId}\nMake sure to save it to access your records!`,
    );
    window.location.reload();
  }

  updateUserId(): void {
    if (this.userId.trim()) {
      localStorage.setItem("userId", this.userId);
      alert("Your User ID has been updated. Make sure to remember it!");
    }
    window.location.reload();
  }

  private generateUniqueId(): string {
    return "user-" + Math.random().toString(36).slice(2, 11);
  }

  togglePage(): void {
    this.router.navigate([this.isDashboard ? "/transactions" : "/dashboard"]);
  }
}

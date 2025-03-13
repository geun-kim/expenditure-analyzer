import { Component, OnInit, OnDestroy } from "@angular/core";
import * as Papa from "papaparse";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { TransactionsApiService } from "../../services/transactions-api/transactions-api.service";
import { Transaction } from "../../common/app.type";
import { PageEvent } from "@angular/material/paginator";
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from "@angular/animations";
import { TransactionStateService } from "../../services/transactions-state/transactions-state.service";

@Component({
  selector: "csv-uploader",
  standalone: false,
  templateUrl: "./csv-uploader.component.html",
  styleUrls: ["./csv-uploader.component.scss"],
  animations: [
    trigger("slideInOut", [
      state(
        "open",
        style({
          transform: "translateX(0)",
          opacity: 1,
        }),
      ),
      state(
        "closed",
        style({
          transform: "translateX(-100%)",
          opacity: 0,
        }),
      ),
      transition("open => closed", [animate("300ms ease-in")]),
      transition("closed => open", [animate("300ms ease-out")]),
    ]),
  ],
})
export class CsvUploaderComponent implements OnInit, OnDestroy {
  transactions: Transaction[] = [];
  pagedTransactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  totalAmountCAD = 0;
  errorMessage: string = "";
  showFilters: boolean = false;
  availableCategories: string[] = [];

  private destroy$ = new Subject<void>();

  displayedColumns: string[] = [
    "index",
    "transactionDate",
    "description",
    "cad",
    "usd",
    "action",
  ];

  filter = {
    startDate: "",
    endDate: "",
    description: "",
    minCad: null as number | null,
    maxCad: null as number | null,
    minUsd: null as number | null,
    maxUsd: null as number | null,
    selectedCategories: [] as string[],
  };

  pageSize = 10;
  currentPage = 0;

  constructor(
    private transactionsApiService: TransactionsApiService,
    private transactionStateService: TransactionStateService,
  ) {}

  ngOnInit(): void {
    this.transactionStateService.transactions$
      .pipe(takeUntil(this.destroy$))
      .subscribe((transactions) => {
        this.transactions = transactions.sort(
          (a, b) =>
            new Date(a.transactionDate).getTime() -
            new Date(b.transactionDate).getTime(),
        );
        this.extractCategories();
        this.applyFilters();
        this.calculateTotal();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  extractCategories(): void {
    const categoriesSet = new Set(
      this.transactions.map((txn) => txn.category).filter(Boolean),
    );
    this.availableCategories = Array.from(categoriesSet) as string[];
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const parsedTransactions = result.data.map((row: any) => ({
          ...this.mapToTransaction(row),
          userId: localStorage.getItem("userId"),
        }));
        let newTransaction: Transaction;

        parsedTransactions.forEach((transaction) => {
          this.transactionsApiService.addTransaction(transaction).subscribe({
            next: (response) => (newTransaction = response),
            error: (error) => {
              console.error("Error saving transaction:", error);
              this.errorMessage = `Failed to add transaction: ${transaction.description1 || "Unknown transaction"} - ${error.error?.message || error.message}`;
            },
            complete: () => {
              this.transactions.push(newTransaction);
              this.transactions.sort(
                (a, b) =>
                  new Date(a.transactionDate).getTime() -
                  new Date(b.transactionDate).getTime(),
              );
              this.transactionStateService.setTransactions(this.transactions);
              this.applyFilters();
              this.calculateTotal();
              console.log("Transaction(s) saved.");
            },
          });
        });
      },
      error: (error) => console.error("Error parsing CSV:", error),
    });

    input.value = "";
  }

  private mapToTransaction(row: any): Transaction {
    return {
      accountType: row["Account Type"]?.trim(),
      accountNumber: row["Account Number"]?.trim(),
      transactionDate: row["Transaction Date"]?.trim(),
      chequeNumber: row["Cheque Number"]?.trim(),
      description1: row["Description 1"]?.trim(),
      description2: row["Description 2"]?.trim(),
      cad: Math.abs(parseFloat(row["CAD$"])),
      usd: Math.abs(parseFloat(row["USD$"])),
    };
  }

  private calculateTotal(): void {
    this.totalAmountCAD = this.filteredTransactions.reduce(
      (sum, transaction) => sum + transaction.cad,
      0,
    );
  }

  deleteTransaction(id: number | undefined): void {
    if (!id) return;

    this.transactionsApiService.deleteTransaction(id).subscribe({
      next: () => {
        this.transactions = this.transactions.filter(
          (transaction) => transaction.id !== id,
        );
        this.transactionStateService.setTransactions(this.transactions);
        this.applyFilters();
        this.calculateTotal();
        console.log(`Transaction with ID ${id} deleted successfully.`);
      },
      error: (error) => console.error("Error deleting transaction:", error),
    });
  }

  updatePagedTransactions(): void {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedTransactions = this.filteredTransactions.slice(
      startIndex,
      endIndex,
    );
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.updatePagedTransactions();
  }

  applyFilters(): void {
    this.filteredTransactions = this.transactions.filter((txn) => {
      // Date Range Filter
      const transactionDate = new Date(txn.transactionDate);
      let startDate: Date | null = null;
      let endDate: Date | null = null;

      if (this.filter.startDate) {
        const [startYear, startMonth, startDay] = this.filter.startDate
          .split("-")
          .map(Number);
        startDate = new Date(startYear, startMonth - 1, startDay, 0, 0, 0, 0);
      }

      if (this.filter.endDate) {
        const [endYear, endMonth, endDay] = this.filter.endDate
          .split("-")
          .map(Number);
        endDate = new Date(endYear, endMonth - 1, endDay, 23, 59, 59, 999);
      }

      if (startDate && transactionDate < startDate) return false;
      if (endDate && transactionDate > endDate) return false;

      // Description Filter (case-insensitive)
      if (
        this.filter.description &&
        !`${txn.description1} ${txn.description2}`
          .toLowerCase()
          .includes(this.filter.description.toLowerCase())
      ) {
        return false;
      }

      // CAD Range Filter
      if (this.filter.minCad !== null && txn.cad < this.filter.minCad)
        return false;
      if (this.filter.maxCad !== null && txn.cad > this.filter.maxCad)
        return false;

      // USD Range Filter
      if (this.filter.minUsd !== null && txn.usd < this.filter.minUsd)
        return false;
      if (this.filter.maxUsd !== null && txn.usd > this.filter.maxUsd)
        return false;

      if (
        this.filter.selectedCategories.length > 0 &&
        !this.filter.selectedCategories.includes(txn.category as string)
      ) {
        return false;
      }

      return true;
    });

    this.updatePagedTransactions(); // Update pagination after filtering
    this.calculateTotal();
  }

  toggleCategorySelection(category: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      this.filter.selectedCategories.push(category);
    } else {
      this.filter.selectedCategories = this.filter.selectedCategories.filter(
        (c) => c !== category,
      );
    }

    this.applyFilters();
  }

  resetFilters(): void {
    this.filter = {
      startDate: "",
      endDate: "",
      description: "",
      minCad: null,
      maxCad: null,
      minUsd: null,
      maxUsd: null,
      selectedCategories: [],
    };
    this.applyFilters(); // Refresh the filtered results
  }

  toggleSidebar(): void {
    this.showFilters = !this.showFilters;
  }
}

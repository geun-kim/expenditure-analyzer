import { Component, OnInit, OnDestroy, AfterViewInit } from "@angular/core";
import { TransactionStateService } from "../../services/transactions-state/transactions-state.service";
import { TransactionsApiService } from "../../services/transactions-api/transactions-api.service";
import { CategoryKeywordsApiService } from "../../services/category-keywords-api/category-keywords-api.service";
import { Subject, takeUntil } from "rxjs";
import {
  Transaction,
  CategoryUpdate,
  CategoryKeywords,
} from "../../common/app.type";
import { Chart } from "chart.js/auto";

const UNAUTHORIZED = "Uncategorized";

@Component({
  selector: "app-dashboard",
  standalone: false,
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  categoryKeywords: CategoryKeywords = {};
  newCategory: string = "";
  newKeywords: string = "";
  transactions: Transaction[] = [];
  selectedDateRange = "thisMonth";
  customStartDate?: string;
  customEndDate?: string;
  selectedCategory = "all";
  pieChart: any;
  barChart: any;
  barChartTitle = "📈 Daily Spending (This Month)";
  private destroy$ = new Subject<void>();

  constructor(
    private transactionStateService: TransactionStateService,
    private transactionsApiService: TransactionsApiService,
    private categoryKeywordsApiService: CategoryKeywordsApiService,
  ) {}

  ngOnInit(): void {
    this.transactionStateService.loadCategories();

    this.transactionStateService.categoryKeywords$
      .pipe(takeUntil(this.destroy$))
      .subscribe((categories) => {
        this.categoryKeywords = categories;
      });

    this.transactionStateService.transactions$
      .pipe(takeUntil(this.destroy$))
      .subscribe((transactions) => {
        this.transactions = transactions;
        this.updateChart();
      });
  }

  ngAfterViewInit(): void {
    this.initializeCharts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get categoryKeys(): string[] {
    return Object.keys(this.categoryKeywords);
  }

  updateChartTitle(): void {
    if (this.selectedDateRange === "thisMonth") {
      this.barChartTitle = "📈 Daily Spending (This Month)";
    } else if (this.selectedDateRange === "last3Months") {
      this.barChartTitle = "📈 Monthly Trends (Last 3 Months)";
    } else if (this.selectedDateRange === "thisYear") {
      this.barChartTitle = "📈 Yearly Trends";
    } else if (this.selectedDateRange === "custom") {
      if (this.customStartDate && this.customEndDate) {
        this.barChartTitle = `📈 Custom Date Range: ${this.customStartDate} → ${this.customEndDate}`;
      } else {
        this.barChartTitle = "📈 Custom Date Range";
      }
    } else {
      this.barChartTitle = "📈 Monthly Trends";
    }
  }

  resetFilters(): void {
    this.selectedDateRange = "thisMonth";
    this.customStartDate = "";
    this.customEndDate = "";
    this.selectedCategory = "all";

    this.updateChart();
  }

  initializeCharts(): void {
    this.pieChart = new Chart("pieChart", {
      type: "pie",
      data: {
        labels: [],
        datasets: [{ data: [], backgroundColor: this.getChartColors() }],
      },
      options: {
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                const value = Number(context.raw) || 0;
                return `$${value.toFixed(2)}`;
              },
            },
          },
        },
      },
    });

    this.barChart = new Chart("barChart", {
      type: "bar",
      data: {
        labels: [],
        datasets: [
          {
            label: "Total Expenses",
            data: [],
            backgroundColor: "rgba(255, 99, 132, 0.6)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: {
            title: { display: true, text: "Date" },
          },
          y: {
            beginAtZero: true,
            title: { display: true, text: "Amount ($)" },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                const value = Number(context.raw) || 0;
                return `$${value.toFixed(2)}`;
              },
            },
          },
        },
      },
    });

    this.updateChart();
  }

  updateChart(): void {
    if (!this.barChart) {
      return;
    }
    this.updateChartTitle();

    const filteredTransactions = this.filterTransactions(this.transactions);
    const categoryTotals = this.calculateCategoryTotals(filteredTransactions);
    const groupedData = this.groupTransactions(filteredTransactions);

    const labels = Object.keys(groupedData);
    const values = Object.values(groupedData);

    labels.sort((a, b) => {
      const dateA = this.parseDateLabel(a);
      const dateB = this.parseDateLabel(b);
      return dateA.getTime() - dateB.getTime();
    });

    const sortedValues = labels.map((label) => groupedData[label]);

    let axisLabel = "Date";
    if (this.selectedDateRange === "thisMonth") {
      axisLabel = "Day of Month";
    } else if (this.selectedDateRange === "last3Months") {
      axisLabel = "Month";
    } else if (this.selectedDateRange === "custom") {
      axisLabel = `${this.customStartDate ? this.customStartDate : ""} → ${this.customEndDate ? this.customEndDate : ""}`;
    } else if (this.isMultipleYears()) {
      axisLabel = "Year";
    }

    if (labels.length === 0) {
      // ✅ If there's no data, display a placeholder
      this.pieChart.data.labels = ["No Data Available"];
      this.pieChart.data.datasets[0].data = [1];
    } else {
      this.pieChart.data.labels = Object.keys(categoryTotals).map((category) =>
        category.replace(/\b\w/g, (char) => char.toUpperCase()),
      );
      this.pieChart.data.datasets[0].data = Object.values(categoryTotals);
    }

    this.pieChart.update();

    this.barChart.data.labels = labels;
    this.barChart.data.datasets[0].data = sortedValues;
    this.barChart.options.scales!.x!.title!.text = axisLabel;
    this.barChart.update();
  }

  parseDateLabel(label: string): Date {
    if (
      this.selectedDateRange === "thisMonth" ||
      (!this.isMultipleMonths() && !this.isMultipleYears())
    ) {
      return new Date(`${label} ${new Date().getFullYear()}`);
    } else if (this.isMultipleMonths()) {
      return new Date(`1 ${label}`);
    } else if (this.isMultipleYears()) {
      return new Date(`${label}-01-01`);
    }

    return new Date();
  }

  isMultipleMonths(): boolean {
    const uniqueMonths = new Set(
      this.transactions.map((txn) =>
        new Date(txn.transactionDate).toLocaleString("default", {
          month: "short",
          year: "numeric",
        }),
      ),
    );
    return uniqueMonths.size > 1;
  }

  isMultipleYears(): boolean {
    const uniqueYears = new Set(
      this.transactions.map((txn) =>
        new Date(txn.transactionDate).getFullYear(),
      ),
    );
    return uniqueYears.size > 1;
  }

  groupTransactions(transactions: Transaction[]): { [key: string]: number } {
    return transactions.reduce(
      (acc, txn) => {
        const txnDate = new Date(txn.transactionDate);
        let key: string;

        const firstTxnDate = new Date(
          this.customStartDate || transactions[0].transactionDate,
        );
        const lastTxnDate = new Date(
          this.customEndDate ||
            transactions[transactions.length - 1].transactionDate,
        );
        const daysDiff =
          (lastTxnDate.getTime() - firstTxnDate.getTime()) /
          (1000 * 60 * 60 * 24);
        const monthsDiff =
          (lastTxnDate.getFullYear() - firstTxnDate.getFullYear()) * 12 +
          (lastTxnDate.getMonth() - firstTxnDate.getMonth());

        if (
          this.selectedDateRange === "thisMonth" ||
          (this.selectedDateRange === "custom" && daysDiff <= 31)
        ) {
          key = `${txnDate.getDate()} ${txnDate.toLocaleString("default", { month: "short" })}`; // "1 Feb", "2 Feb"
        } else if (
          this.isMultipleMonths() ||
          this.selectedDateRange === "last3Months" ||
          (this.selectedDateRange === "custom" && monthsDiff < 12)
        ) {
          key = txnDate.toLocaleString("default", {
            month: "short",
            year: "numeric",
          }); // "Feb 2024"
        } else if (
          this.isMultipleYears() ||
          this.selectedDateRange === "custom"
        ) {
          key = txnDate.getFullYear().toString();
        } else {
          key = txnDate.toISOString().split("T")[0];
        }

        acc[key] = (acc[key] || 0) + txn.cad;
        return acc;
      },
      {} as { [key: string]: number },
    );
  }

  filterTransactions(transactions: Transaction[]): Transaction[] {
    const now = new Date();

    return transactions.filter((txn) => {
      const txnDate = new Date(txn.transactionDate);

      const matchesCategory =
        this.selectedCategory === "all" ||
        txn.category === this.selectedCategory;
      let matchesDate = false;
      if (this.selectedDateRange === "thisMonth") {
        matchesDate =
          txnDate.getMonth() === now.getMonth() &&
          txnDate.getFullYear() === now.getFullYear();
      } else if (this.selectedDateRange === "last3Months") {
        matchesDate =
          txnDate >
          new Date(
            now.getFullYear(),
            now.getMonth() - 3,
            now.getDate(),
            0,
            0,
            0,
            0,
          );
      } else if (this.selectedDateRange === "thisYear") {
        matchesDate = txnDate.getFullYear() === now.getFullYear();
      } else if (
        this.selectedDateRange === "custom" &&
        this.customStartDate &&
        this.customEndDate
      ) {
        if (
          typeof this.customStartDate === "string" &&
          typeof this.customEndDate === "string"
        ) {
          const [startYear, startMonth, startDay] = this.customStartDate
            .split("-")
            .map(Number);
          const [endYear, endMonth, endDay] = this.customEndDate
            .split("-")
            .map(Number);

          const start = new Date(
            startYear,
            startMonth - 1,
            startDay,
            0,
            0,
            0,
            0,
          );
          const end = new Date(endYear, endMonth - 1, endDay, 23, 59, 59, 999);

          matchesDate = txnDate >= start && txnDate <= end;
        }
      }
      return matchesCategory && matchesDate;
    });
  }

  calculateCategoryTotals(transactions: Transaction[]): {
    [category: string]: number;
  } {
    return transactions.reduce(
      (acc, txn) => {
        if (!txn.category) return acc;
        acc[txn.category] = (acc[txn.category] || 0) + txn.cad;
        return acc;
      },
      {} as { [category: string]: number },
    );
  }

  calculateMonthlyTotals(transactions: Transaction[]): {
    [month: string]: number;
  } {
    return transactions.reduce(
      (acc, txn) => {
        const month = new Date(txn.transactionDate).toLocaleString("default", {
          month: "short",
          year: "numeric",
        });
        acc[month] = (acc[month] || 0) + txn.cad;
        return acc;
      },
      {} as { [month: string]: number },
    );
  }

  getChartColors(): string[] {
    return ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50", "#FF9800", "#9C27B0"];
  }

  addOrUpdateCategory(): void {
    if (!this.newCategory || !this.newKeywords) {
      alert("Please provide both category name and keywords.");
      return;
    }

    const category = this.newCategory.trim().toLowerCase();

    const keyword = this.newKeywords.trim().toLowerCase();

    if (!this.categoryKeywords[category]) {
      this.categoryKeywords[category] = [keyword];
    } else {
      if (this.categoryKeywords[category].includes(keyword)) {
        console.log("Keyword already exists in the category");
        return;
      }
      this.categoryKeywords[category].push(keyword);
    }

    const keywords = this.categoryKeywords[category]
      .map((k) => k.trim().toLowerCase())
      .filter((k) => k)
      .join(", ");

    this.categoryKeywordsApiService
      .addOrUpdateCategory(category, keywords)
      .subscribe({
        next: () => {
          this.transactionStateService.refreshCategories();
          const updatedTransactions: CategoryUpdate[] = this.transactions
            .filter((txn) => {
              const description =
                `${txn.description1} ${txn.description2}`.toLowerCase();
              return description.includes(keyword) && txn.category !== category;
            })
            .map((txn) => ({ id: txn.id, category }) as CategoryUpdate);

          this.batchUpdateTransactionCategories(updatedTransactions, category),
            console.log(`Category "${category}" updated successfully.`);
        },
        error: (err) => console.error("Failed to update category:", err),
      });

    this.transactionStateService.loadCategories();

    this.newCategory = "";
    this.newKeywords = "";
  }

  private batchUpdateTransactionCategories(
    updatedTransactions: CategoryUpdate[],
    category: string,
  ): void {
    if (updatedTransactions.length === 0) {
      console.log("No transactions to update.");
      return;
    }

    this.transactionsApiService
      .batchUpdateTransactions(updatedTransactions)
      .subscribe({
        next: () => {
          console.log(
            `${updatedTransactions.length} transactions updated to category: ${category}`,
          );

          const updatedState = this.transactions.map((txn) => {
            const match = updatedTransactions.find((ut) => ut.id === txn.id);
            return match ? { ...txn, category } : txn;
          });

          this.transactionStateService.setTransactions(updatedState);
        },
        error: (err: any) =>
          console.error("Failed to batch update transactions:", err),
      });
  }

  updateCategory(category: string, keywordString: string): void {
    const oldKeywords: string[] =
      this.categoryKeywords[category][0] !== ""
        ? this.categoryKeywords[category]
        : [];
    const newKeywords: string[] = keywordString
      ? keywordString.split(",").map((k) => k.trim().toLowerCase())
      : [];

    const removedKeywords = oldKeywords.filter((k) => !newKeywords.includes(k));
    const addedKeywords = newKeywords.filter((k) => !oldKeywords.includes(k));

    console.log(`Removed keywords for ${category}:`, removedKeywords);
    console.log(`Added keywords for ${category}:`, addedKeywords);

    if (removedKeywords.length || addedKeywords.length) {
      this.categoryKeywordsApiService
        .addOrUpdateCategory(category, newKeywords.join(", "))
        .subscribe({
          next: () => {
            console.log(`Category "${category}" updated successfully.`);
            let affectedTransactions: CategoryUpdate[];

            if (removedKeywords.length) {
              affectedTransactions = this.transactions
                .filter((txn) =>
                  removedKeywords.some(
                    (keyword) =>
                      txn.description1?.toLowerCase().includes(keyword) ||
                      txn.description2?.toLowerCase().includes(keyword),
                  ),
                )
                .map(
                  (txn) =>
                    ({
                      id: txn.id,
                      category: UNAUTHORIZED,
                    }) as CategoryUpdate,
                );
              console.log(
                `Transactions affected by removed keywords: ${affectedTransactions.length}`,
              );

              this.batchUpdateTransactionCategories(
                affectedTransactions,
                UNAUTHORIZED,
              );
            }
            if (addedKeywords.length) {
              affectedTransactions = this.transactions
                .filter((txn) =>
                  addedKeywords.some(
                    (keyword) =>
                      txn.description1?.toLowerCase().includes(keyword) ||
                      txn.description2?.toLowerCase().includes(keyword),
                  ),
                )
                .map((txn) => {
                  const matchingKeyword = addedKeywords.find(
                    (keyword) =>
                      txn.description1?.toLowerCase().includes(keyword) ||
                      txn.description2?.toLowerCase().includes(keyword),
                  );

                  return {
                    id: txn.id,
                    category,
                  } as CategoryUpdate;
                });
              console.log(
                `Transactions affected by added keywords: ${affectedTransactions.length}`,
              );

              this.batchUpdateTransactionCategories(
                affectedTransactions,
                category,
              );
            }

            this.transactionStateService.refreshCategories();
          },
          error: (err) => console.error("Failed to update category:", err),
        });
    } else {
      console.log("No transactions affected.");
      return;
    }
  }

  deleteCategory(category: string): void {
    if (!confirm(`Are you sure you want to delete the category "${category}"?`))
      return;

    this.categoryKeywordsApiService.deleteCategory(category).subscribe({
      next: () => {
        this.transactionStateService.refreshCategories();
        console.log(`Category "${category}" deleted.`);
      },
      error: (err) => console.error("Failed to delete category:", err),
    });
  }
}

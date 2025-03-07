import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Transaction, CategoryUpdate } from "../../common/app.type";

@Injectable({
  providedIn: "root",
})
export class CategoryKeywordsApiService {
  private apiUrl = "http://localhost:3000/api/category-keywords"; // NestJS API URL
  userId = localStorage.getItem("userId");

  constructor(private http: HttpClient) {}

  // 🟢 Get all category keywords
  getAllCategories(): Observable<{ category: string; keywords: string }[]> {
    return this.http.get<{ category: string; keywords: string }[]>(
      this.apiUrl,
      {
        params: {
          userId: this.userId || "",
        },
      },
    );
  }

  // 🔄 Add or update a category with keywords
  addOrUpdateCategory(category: string, keywords: string): Observable<void> {
    return this.http.post<void>(
      this.apiUrl,
      { category, keywords },
      {
        params: {
          userId: this.userId || "",
        },
      },
    );
  }

  // ❌ Delete a category by name
  deleteCategory(category: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${category}`);
  }
}

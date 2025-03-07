// src/app/app-routing.module.ts
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { CsvUploaderComponent } from "./components/csv-uploader/csv-uploader.component";

const routes: Routes = [
  { path: "", redirectTo: "dashboard", pathMatch: "full" },
  { path: "transactions", component: CsvUploaderComponent }, // CSV Uploader
  { path: "dashboard", component: DashboardComponent }, // Dashboard Route
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

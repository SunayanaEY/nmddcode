import { Routes } from "@angular/router";
import { ChartSectionComponent } from "../../charts/chart-section/chart-section.component";
import { TableSectionComponent } from "../../table/table-section/table-section.component";
import { DashboardComponent } from "../../dashboard.component";

export const AdminLayoutRoutes: Routes = [
  {
    path: 'dashboard/charts', component: ChartSectionComponent
  },
  {
    path: 'charts', component: ChartSectionComponent
  },
  {
    path:'dashboard/table-data',component: TableSectionComponent

  },
  {
    path:'table-data',component: TableSectionComponent

  },

  { path: 'dashboard', component: DashboardComponent },
];

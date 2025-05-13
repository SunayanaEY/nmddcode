import { DatePipe } from '@angular/common';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
//import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AppComponent } from './app.component';
import { ChartSectionComponent } from './pages/charts/chart-section/chart-section.component';
import { HighchartsChartModule,HighchartsChartComponent } from 'highcharts-angular';
//import { NgxPaginationModule } from 'ngx-pagination';
//import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TableSectionComponent } from './pages/table/table-section/table-section.component';
import { TableSearchPipe } from './pages/helpers/table-search.pipe';
import { ExcelService } from './_services/Excel/excel.service';
//import * as highcharts from highcharts;



@NgModule({
  imports: [
    //EditorModule,
    //AngularEditorModule,

   // NgxSimpleTextEditorModule,
   HighchartsChartModule,
   //HighchartsChartComponent,
   FormsModule,
   RouterOutlet,
  // NgxPaginationModule


  ],

  declarations: [
    //ChartSectionComponent,
   // AppComponent
  //TableSectionComponent
 // TableSearchPipe
    ],

  exports: [ ReactiveFormsModule],
  providers: [
    DatePipe,
    ExcelService,


  ],
  bootstrap: [],
})

    export class AppModule {
      // constructor(library: FaIconLibrary) {
      //   library.addIcons(faCalendar);
      //   library.addIcons(faClock);
      //     }
    }

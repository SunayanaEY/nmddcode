import { DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
//import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { HighchartsChartModule } from 'highcharts-angular';
//import { NgxPaginationModule } from 'ngx-pagination';
//import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ExcelService } from './_services/Excel/excel.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { HttpClient } from '@angular/common/http';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
//import * as highcharts from highcharts;
import { MultiSelectDropdownComponent } from './components/multi-select-dropdown/multi-select-dropdown.component';

// export function HttpLoaderFactory(http:HttpClient){
//   return new TranslateHttpLoader(http, './assets/i18n/', '.json');
// }

@NgModule({
  imports: [
    //EditorModule,
    //AngularEditorModule,

   // NgxSimpleTextEditorModule,
   HighchartsChartModule,
   //HighchartsChartComponent,
   FormsModule,
   RouterOutlet,
   NgSelectModule,
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

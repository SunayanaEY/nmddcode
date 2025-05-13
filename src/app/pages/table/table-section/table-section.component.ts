import { Component, ViewEncapsulation } from '@angular/core';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { TableSearchPipe } from '../../helpers/table-search.pipe';
import { SortPipe } from '../../helpers/sort.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import { autoTable,applyPlugin } from 'jspdf-autotable';
import { NgSelectModule } from '@ng-select/ng-select';
applyPlugin(jsPDF);

import { ExcelService } from '../../../_services/Excel/excel.service';

//import { NgModule } from '@angular/core';


@Component({
  selector: 'app-table-section',
  //standalone: false,
 imports: [PaginationModule,NgxPaginationModule,
  RouterModule,CommonModule,NgxSpinnerModule,SortPipe,TableSearchPipe,
  FormsModule,NgSelectModule,ReactiveFormsModule
 ],
  templateUrl: './table-section.component.html',
  styleUrl: './table-section.component.css',
  encapsulation: ViewEncapsulation.None
})
export class TableSectionComponent {

  public searchTextActive: string = '';
  p: number = 1;
  pageTitle: string='';
  userRole: string = '';
  isExportPdf:boolean = true;
  isExportXLSX:boolean =true;
  demoRequests:Array<any>=[];
  isApiCalled:boolean = false;
  public orderByActive: { order: string; key: string } = { order: '', key: '' };
  pdfName: string = 'Nationa_Dairy_Monitoring_Data_';
  pdfHeaders: Array<string> = [];
  pdfData: Array<any> = [];
  public columnKeys: Array<string> = [];


  staticData = [

    {
      "state":"Andhra Pradesh",
      "district":"Patna",
      "block": "Block C",
      "village":"Village 3",
      "collection_date":	"2025-05-06",
      "milk_qty":	1077,
      "fat_per":5.24,
      "snf_per":8.45,
      "milk_type":"Cow",
      "source_centre":"MCC",
      "mcc_code":"ANDPAT3769",
      "lat":	23.721584,
      "long":	84.46514,
      "entry_method": "Auto",
      "sync_status": true
    },
    {
      "state":"Andhra Pradesh",
      "district":"Patna",
      "block": "Block A",
      "village":"Village 2",
      "collection_date":	"2025-05-08",
      "milk_qty":	1534,
      "fat_per":5.73,
      "snf_per":9.29,
      "milk_type":"Cow",
      "source_centre":"MCU",
      "mcc_code":"ANDPAT8662",
      "lat":	26.146336,
      "long":	76.17967,
      "entry_method": "API",
      "sync_status": true
    },
    {
      "state":"Andhra Pradesh",
      "district":"Patna",
      "block": "Block A",
      "village":"Village 2",
      "collection_date":	"2025-05-08",
      "milk_qty":	1534,
      "fat_per":5.73,
      "snf_per":9.29,
      "milk_type":"Cow",
      "source_centre":"MCU",
      "mcc_code":"ANDPAT8662",
      "lat":	26.146336,
      "long":	76.17967,
      "entry_method": "Auto",
      "sync_status": false
    },
    {
      "state":"Andhra Pradesh",
      "district":"Bhopal",
      "block": "Block B",
      "village":"Village 4",
      "collection_date":	"2025-05-08",
      "milk_qty":	2276,
      "fat_per":6.32,
      "snf_per":9.13,
      "milk_type":"Cow",
      "source_centre":"BMC",
      "mcc_code":"ANDBHO3833",
      "lat":	24.11345,
      "long":	87.354054,
      "entry_method": "API",
      "sync_status": true
    },
    {
      "state":"Bihar",
      "district":"Hyderabad",
      "block": "Block B",
      "village":"Village 4",
      "collection_date":	"2025-05-06",
      "milk_qty":	1790,
      "fat_per":3.98,
      "snf_per":7.76,
      "milk_type":"Buffalo",
      "source_centre":"MCU",
      "mcc_code":"BIHHYD3386",
      "lat":	23.588056,
      "long":	70.69067,
      "entry_method": "Register",
      "sync_status": false
    },
    {
      "state":"Bihar",
      "district":"Chennai",
      "block": "Block B",
      "village":"Village 1",
      "collection_date":	"2025-05-05",
      "milk_qty":	1364,
      "fat_per":3.76,
      "snf_per":9.43,
      "milk_type":"Cow",
      "source_centre":"BMC",
      "mcc_code":"BIHCHE3451",
      "lat":	22.577724,
      "long":	73.100274,
      "entry_method": "API",
      "sync_status": true
    },
    {
      "state":"Bihar",
      "district":"Delhi",
      "block": "Block D",
      "village":"Village 2",
      "collection_date":	"2025-05-04",
      "milk_qty":	1734,
      "fat_per":3.76,
      "snf_per":9.43,
      "milk_type":"Cow",
      "source_centre":"BMC",
      "mcc_code":"BIHCHE3451",
      "lat":	22.577724,
      "long":	73.100274,
      "entry_method": "Auto",
      "sync_status": false
    },
    {
      "state":"Chhattisgarh",
      "district":"Hyderabad",
      "block": "Block B",
      "village":"Village 3",
      "collection_date":	"2025-05-09",
      "milk_qty":	1382,
      "fat_per":4.8,
      "snf_per":8.09,
      "milk_type":"Buffalo",
      "source_centre":"MCC",
      "mcc_code":"CHHHYD2406",
      "lat":	27.980244,
      "long":	72.759497,
      "entry_method": "API",
      "sync_status": false
    },
    {
      "state":"Chhattisgarh",
      "district":"Patna",
      "block": "Block B",
      "village":"Village 2",
      "collection_date":	"2025-05-03",
      "milk_qty":	2500,
      "fat_per":5.29,
      "snf_per":8.71,
      "milk_type":"Buffalo",
      "source_centre":"BMC",
      "mcc_code":"CHHPAT6286",
      "lat":	24.965128,
      "long":	72.869284,
      "entry_method": "Auto",
      "sync_status": false
    },
    {
      "state":"Chhattisgarh",
      "district":"Patna",
      "block": "Block B",
      "village":"Village 2",
      "collection_date":	"2025-05-03",
      "milk_qty":	2500,
      "fat_per":5.29,
      "snf_per":8.71,
      "milk_type":"Buffalo",
      "source_centre":"BMC",
      "mcc_code":"CHHPAT6286",
      "lat":	24.965128,
      "long":	72.869284,
      "entry_method": "Register",
      "sync_status": true
    },
    {
      "state":"Chhattisgarh",
      "district":"Chennai",
      "block": "Block A",
      "village":"Village 1",
      "collection_date":	"2025-05-06",
      "milk_qty":	3375,
      "fat_per":3.91,
      "snf_per":8.14,
      "milk_type":"Buffalo",
      "source_centre":"MCU",
      "mcc_code":"CHHCHE3451",
      "lat":	23.525464,
      "long":	84.120139,
      "entry_method": "API",
      "sync_status": true
    },
    {
      "state":"Goa",
      "district":"Chennai",
      "block": "Block B",
      "village":"Village 2",
      "collection_date":	"2025-05-07",
      "milk_qty":	1793,
      "fat_per":4.37,
      "snf_per":9.19,
      "milk_type":"Mixed",
      "source_centre":"MCU",
      "mcc_code":"GOACHE5998",
      "lat":	26.339829,
      "long":	75.046551,
      "entry_method": "API",
      "sync_status": true
    },
    {
      "state":"Goa",
      "district":"Delhi",
      "block": "Block C",
      "village":"Village 1",
      "collection_date":	"2025-05-07",
      "milk_qty":	1486,
      "fat_per":5.13,
      "snf_per":8.71,
      "milk_type":"Buffalo",
      "source_centre":"MCU",
      "mcc_code":"GOADEL8742",
      "lat":	25.315423,
      "long":	79.425495,
      "entry_method": "Register",
      "sync_status": true
    },
    {
      "state":"Goa",
      "district":"Bhopal",
      "block": "Block B",
      "village":"Village 3",
      "collection_date":	"2025-05-08",
      "milk_qty":	3453,
      "fat_per":4.74,
      "snf_per":9.36,
      "milk_type":"Mixed",
      "source_centre":"MCU",
      "mcc_code":"GOABHO1755",
      "lat":	24.62518,
      "long":	75.718553,
      "entry_method": "Auto",
      "sync_status": false
    },
  ];

  filters = { mcc_code:'',state: '', district: '', block: '' ,village:'',
    collection_date:'',milk_qty:'',fat_per:'',snf_per:'', milk_type:'',
    sync_status:'',entry_method:''
  };
  filteredData = [...this.staticData];
  uniqueValuesMccCode(): any[] {

    return [...new Set(this.staticData.map(item => item['mcc_code']))];

  }
  uniqueValuesstate(): any[] {

    return [...new Set(this.staticData.map(item => item['state']))];

  }
  uniqueValuesdistrict(): any[] {

    return [...new Set(this.staticData.map(item => item['district']))];

  }
  uniqueValuesblock(): any[] {

    return [...new Set(this.staticData.map(item => item['block']))];

  }
  uniqueValuesvillage(): any[] {

    return [...new Set(this.staticData.map(item => item['village']))];

  }
  uniqueValuescollection_date(): any[] {

    return [...new Set(this.staticData.map(item => item['collection_date']))];

  }
  uniqueValuesmilk_qty(): any[] {

    return [...new Set(this.staticData.map(item => item['milk_qty']))];

  }
  uniqueValuesfat_per(): any[] {

    return [...new Set(this.staticData.map(item => item['fat_per']))];

  }
  uniqueValuessnf_per(): any[] {

    return [...new Set(this.staticData.map(item => item['snf_per']))];

  }
  uniqueValuesmilk_type(): any[] {

    return [...new Set(this.staticData.map(item => item['milk_type']))];

  }
  uniqueValuessync_status(): any[] {

    return [...new Set(this.staticData.map(item => item['sync_status']))];

  }
  uniqueValuesentry_method(): any[] {

    return [...new Set(this.staticData.map(item => item['entry_method']))];

  }

  constructor(
    private spinner: NgxSpinnerService,
    private excelService: ExcelService,){}


    ngOnInit(): void {


      this.pdfHeaders = ['SR. NO','MCC/BMC Code',"STATE","DISTRICT","BLOCK",
        "VILLAGE","ENTRY DATE","MILK QUANTITY","FAT%","SNF%","MILK TYPE","SYNC STATUS",
        "ENTRY METHOD"
      ];



      this.columnKeys = ['mcc_code','state','district','block',
        'village','collection_date','milk_qty','fat_per','snf_per',
        'milk_type', 'sync_status','entry_method'
      ];

      this.pdfData = this.staticData;
    }

    applyFilters(): void {
      this.filteredData = this.staticData.filter(row => {
        return (
          (!this.filters.mcc_code || row.mcc_code === this.filters.mcc_code) &&
          (!this.filters.state || row.state === this.filters.state) &&
          (!this.filters.district || row.district === this.filters.district) &&
          (!this.filters.block || row.block === this.filters.block) &&
          (!this.filters.village || row.village === this.filters.village) &&
          (!this.filters.collection_date || row.collection_date === this.filters.collection_date) &&
          (!this.filters.milk_qty || row.milk_qty.toString() === this.filters.milk_qty.toString()) &&
          (!this.filters.fat_per || row.fat_per.toString() === this.filters.fat_per.toString()) &&
          (!this.filters.snf_per || row.snf_per.toString() === this.filters.snf_per.toString()) &&
          (!this.filters.milk_type || row.milk_type === this.filters.milk_type) &&
          (!this.filters.sync_status || row.sync_status.toString() === this.filters.sync_status.toString()) &&
          (!this.filters.entry_method || row.entry_method === this.filters.entry_method)
        );
      });

      this.filteredData.forEach(ele => {
        console.log(ele.mcc_code);
      })
    }

  createPdf() {
    let headers = [this.pdfHeaders];
    let finalData: any[] = [];
    let sno = 1;
    this.pdfData.forEach((ele) => {
      let item = [];
      item.push(sno);
      let i = 0;
      for (let key in ele) {
        item.push(
          this.columnKeys && this.columnKeys.length
            ? ele[this.columnKeys[i]]
            : ele[key]
        );
        i++;
      }
      finalData.push(item);
      sno++;
    });

    var doc = new jsPDF();

    doc.setFontSize(10);
    doc.setFontSize(8);
    doc.setTextColor(100);

    (doc as any).autoTable({
      //table border
      tableLineColor: [189, 195, 199],
      tableLineWidth: 0.75,

      head: headers,
      body: finalData,
      theme: 'plain',
      didDrawCell: (data: { cell: { x: number; y: number; height: any; width: any; }; }) => {
        //drawing lines to specific cells:
        /*if (data.row.section === "head" && data.column.dataKey === "qty") {
            doc.setDrawColor(255, 255, 0); // set the border color
            doc.setLineWidth(0.5); // set the border with
            */

        doc.setDrawColor(189, 195, 199);
        //doc.setDrawColor(0, 0, 0); // set the border color
        doc.setLineWidth(0.3); // set the border with

        // draw bottom border
        doc.line(
          data.cell.x,
          data.cell.y + data.cell.height,
          data.cell.x + data.cell.width,
          data.cell.y + data.cell.height
        );
        // draw top border
        doc.line(
          data.cell.x + data.cell.width,
          data.cell.y,
          data.cell.x,
          data.cell.y
        );
        // draw left border
        doc.line(
          data.cell.x,
          data.cell.y + data.cell.height,
          data.cell.x,
          data.cell.y
        );
        // draw right border
        doc.line(
          data.cell.x + data.cell.width,
          data.cell.y,
          data.cell.x + data.cell.width,
          data.cell.y + data.cell.height
        );
      },
      /*drawHeaderRow: (head, data) => {
              //---------------------------------------
              // Write the line at the bottom of header
              //---------------------------------------
              data.doc.line(data.cursor.x, data.cursor.y + head.height, data.cursor.x + data.table.width, data.cursor.y + head.height);
          },*/
    });
    doc.save(
      this.pdfName +

        new Date().getFullYear() +
        new Date().getMonth() +
        new Date().getDate() +
        '.pdf'
    );
  }


  exportAsXLSX() {
    this.spinner.show('dataSpinner2');
    var entries: any[] = [];


this.pdfHeaders = ['SR. NO','MCC/BMC Code',"STATE","DISTRICT","BLOCK",
        "VILLAGE","ENTRY DATE","MILK QUANTITY","FAT%","SNF%","MILK TYPE","SYNC STATUS",
        "ENTRY METHOD"
      ];



      this.columnKeys = ['mcc_code','state','district','block',
        'village','collection_date','milk_qty','fat_per','snf_per',
        'milk_type', 'sync_status','entry_method'
      ];


    this.pdfData.forEach((element) => {
      var obj = {};

        obj = {
          'MCC/BMC Code': element.mcc_code,
          'STATE': element.state,
          'DISTRICT': element.district,
          'BLOCK': element.block,
          'VILLAGE': element.village,
          'ENTRY DATE': element.collection_date,
          'MILK QUANTITY': element.milk_qty,
          'FAT%': element.fat_per,
          'SNF%': element.snf_per,
          'MILK TYPE': element.milk_type,
          'SYNC STATUS': element.sync_status,
          'ENTRY METHOD':element.entry_method
        };


      entries.push(obj);
    });
    this.excelService.exportAsExcelFile(
      entries,
      this.pdfName +

        new Date().getFullYear() +
        new Date().getMonth() +
        new Date().getDate()
    );
    this.spinner.hide('dataSpinner2');
  }


  DemoFeedbackScoreCard(){

  }

  ButtonClicked(){}
  openremarkpopup(reject:string,id:any){}
  markStatusComplete(id : any){}
  onClickOrderByActive(key: any) {
    this.orderByActive = {
      ...this.orderByActive,
      order: this.orderByActive.order == 'asc' ? 'desc' : 'asc',
      key: key,
    };
  }
}

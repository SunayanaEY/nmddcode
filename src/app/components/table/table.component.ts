import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExcelService } from '../../_services/Excel/excel.service';
import jsPDF from 'jspdf';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableSearchPipe } from "../../pages/helpers/table-search.pipe";
import { autoTable,applyPlugin } from 'jspdf-autotable';
import { NgxPaginationModule } from 'ngx-pagination';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ToastrService } from 'ngx-toastr';
applyPlugin(jsPDF);
//require('jspdf-autotable');
export interface TableColumn {
  key: string;
  header: string;
  transform?: (value: any, item: any) => string;
}

export interface TableAction {
  name: string;
  icon: string;
  class: string;
  title: string;
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TableSearchPipe,
    PaginationModule,NgxPaginationModule
  ],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent {
  @Input() data: any[] = [];
  @Input() tableName: string= "";
  schemesTableString:string = "schemes";
  tableNamesArray:Array<string> = ["schemes","trainingTypes"];
  @Input() addNew: String = "";
  @Input() columns: TableColumn[] = [];
  @Input() actions: TableAction[] = [];
  @Input()  pdfHeaders: Array<string> = [];
  excelHeaders: Array<string> = [];
  @Input()  columnKeys: Array<string> = [];
  @Input()  isExportPDF: Boolean = false;
  @Input()  isExportCSV: Boolean = false;
  @Input()  isBulkCertDownload: Boolean = false;
  @Input()  excelData: Array<any> = [];
   @Input()  fileName: String = '';
   public searchTextActive: string = '';
    @Output() viewClicked: EventEmitter<{ field: string; data: any }> = new EventEmitter();
  p:number = 1;
  @Output() actionClick = new EventEmitter<{ action: string, item: any, index: number }>();

  constructor( private excelService:ExcelService,
    private toatsr: ToastrService
  ){

  }
  onActionClick(action: string, item: any, index: number): void {
    this.actionClick.emit({ action, item, index });
  }

  formatSerialNumber(index: number): string {
    return String(index + 1).padStart(2, '0');
  }

  createPdf() {
      let headers = [this.pdfHeaders];
      //this.pdfObjectKeys = this.objectKeys.keys;
      let finalData: any[][] = [];
      let sno = 1;
      this.data.forEach((ele) => {
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
        this.fileName +'_'+
        new Date().getFullYear() +
        new Date().getMonth() +
        new Date().getDate() +
        '.pdf'
      );
    }



  exportExcel(){
    //const users = [];
    //const complaintType = this.fliterForm.value.complaint;

    this.excelHeaders = this.pdfHeaders.splice(0,1);

    this.data.forEach( (element) => {

      let combinedArray = this.pdfHeaders.map((item, index) => ({ item1: item, item2: element[this.columnKeys[index]] }));
      const resultObj: { [key: string]: any } = {};
      combinedArray.forEach((arr) =>{

        resultObj[arr.item1] = arr.item2;
      });
      /*const resultObj = {
        'Complaint Category': element.title,
        'Description': element.description,
        'Date': element.createDateTime,
        'Status': element.status,
      }*/
      this.excelData.push(resultObj);
    });
    console.log("new Date(): "+new Date());
    console.log("new Date().getMonth(): "+new Date().getMonth());
    this.excelService.exportAsExcelFile(this.excelData, this.fileName +'_'+ new Date().getFullYear() +
    String(Number(new Date().getMonth())+1) +
    new Date().getDate());
  }

  addNewRow(len:number){
    this.data.push({ schemeId: null, schemeTitle: '' ,editable:true,actions:[

        { name: 'save', icon: 'bi bi-save-fill', class: 'btn-info', title: 'Save' },
        { name: 'delete', icon: 'bi bi-trash', class: 'btn-info', title: 'Delete' },
        // { name: 'download', icon: 'bi bi-download', class: 'btn-success', title: 'Download' },
      ]})
  }
}


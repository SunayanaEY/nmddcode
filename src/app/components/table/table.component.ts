import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExcelService } from '../../_services/Excel/excel.service';
import jsPDF from 'jspdf';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableSearchPipe } from '../../pages/helpers/table-search.pipe';
import { autoTable, applyPlugin } from 'jspdf-autotable';
import { NgxPaginationModule } from 'ngx-pagination';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ToastrService } from 'ngx-toastr';
import { table } from 'node:console';
import { TranslateModule } from '@ngx-translate/core';
applyPlugin(jsPDF);
//require('jspdf-autotable');
export interface TableColumn {
  key: string;
  header: string;
  transform?: (value: any, item: any) => string;

  isLink?: boolean;
  linkHandler?: (row: any) => void;
  linkCondition?: (row: any) => boolean;
  showColumn?: (row?: any) => boolean;
}

export interface TableAction {
  name: string;
  icon: string;
  class: string;
  title: string;
  condition?: (row: any) => boolean;
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TableSearchPipe,
    PaginationModule,
    NgxPaginationModule,
    TranslateModule,
  ],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})
export class TableComponent {
  @Input() data: any[] = [];
  @Input() tableName: string = '';
  @Input() isLoading: boolean = false;
  @Input() userRole: number = 0;
  schemesTableString: string = 'schemes';
  tableNamesArray: Array<string> = ['schemes', 'trainingTypes','trainingInstituteTable'];
  
  @Input() addNew: string = '';
  @Input() columns: TableColumn[] = [];
  @Input() enableMultiSelect: boolean = false;
  @Input() bulkActions: TableAction[] = [];
  @Input() selectedItems: Set<any> = new Set();
  selectAll: boolean = false;
  @Input() actions: TableAction[] = [];
  @Input() pdfHeaders: Array<string> = [];
  excelHeaders: Array<string> = [];
  @Input() columnKeys: Array<string> = [];
  @Input() isExportPDF: Boolean = false;
  @Input() isExportCSV: Boolean = false;
  @Input() isBulkCertDownload: Boolean = false;
  @Input() excelData: Array<any> = [];
  @Input() fileName: String = '';
  public searchTextActive: string = '';
  @Output() viewClicked: EventEmitter<{ field: string; data: any }> =
    new EventEmitter();
  p: number = 1;
  @Output() actionClick = new EventEmitter<{
    action: string;
    item: any;
    index: number;
  }>();
  @Output() downloadAllCerts = new EventEmitter<{
    action: string;
    //item: any;
    //index: number;
  }>();
  @Output() linkClick = new EventEmitter<{ column: TableColumn; row: any }>();
  @Output() bulkActionClick = new EventEmitter<{
    action: string;
    items: any[];
  }>();

  constructor(
    private excelService: ExcelService,
    private toatsr: ToastrService
  ) {}

  ngOnInit() {
    console.log('visibleColumns:', this.visibleColumns);
  }
  onActionClick(action: string, item: any, index: number): void {
    this.actionClick.emit({ action, item, index });
  }
  onLinkClick(column: TableColumn, row: any) {
    if (column.linkHandler) {
      column.linkHandler(row);
    } else {
      this.linkClick.emit({ column, row });
    }
  }
  get visibleColumns(): TableColumn[] {
    return this.columns.filter(col => 
    col.showColumn && col.showColumn()
  );
}
  downloadCerts(action: string) {
    this.downloadAllCerts.emit({ action: action });
  }
  shouldShowColumn(col: any, item: any): boolean {
    if (col.showColumn === undefined || col.showColumn === null) {
      return true; // default: show column
    }

    if (typeof col.showColumn === 'function') {
      return col.showColumn(item); // evaluate function if provided
    }

    return col.showColumn !== false; // only hide if explicitly false
  }
  formatSerialNumber(index: number): string {
    if (index < 10) {
      return String(index + 1).padStart(2, '0');
    } else return String(index + 1);
  }

  createPdf() {
    let headers = [this.pdfHeaders];
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
      didDrawCell: (data: {
        cell: { x: number; y: number; height: any; width: any };
      }) => {
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
      this.fileName +
        '_' +
        new Date().getFullYear() +
        new Date().getMonth() +
        new Date().getDate() +
        '.pdf'
    );
  }

  exportExcel() {
    this.excelHeaders = this.pdfHeaders.splice(0, 1);

    this.data.forEach((element) => {
      let combinedArray = this.pdfHeaders.map((item, index) => ({
        item1: item,
        item2: element[this.columnKeys[index]],
      }));
      const resultObj: { [key: string]: any } = {};
      combinedArray.forEach((arr) => {
        resultObj[arr.item1] = arr.item2;
      });

      this.excelData.push(resultObj);
    });
    this.excelService.exportAsExcelFile(
      this.excelData,
      this.fileName +
        '_' +
        new Date().getFullYear() +
        String(Number(new Date().getMonth()) + 1) +
        new Date().getDate()
    );
  }

  addNewRow(len: number) {
    this.actionClick.emit({ action: 'add', item: {}, index: len });
  }

  // Multi-select methods
  toggleSelectAll(): void {
    this.selectAll = !this.selectAll;
    if (this.selectAll) {
      // Only select items that are not APPROVED or REJECTED

      this.data.forEach((item) => {
        if (
          this.tableName === 'Verify-Trainings' &&
          item.status === 'IN PROGRESS'
        ) {
          this.selectedItems.add(item);
        } else if (
          this.tableName === 'Trainee-List' &&
          (item.status === 'Trainees details uploaded' ||
            ((this.userRole === 5 || this.userRole === 6) &&
              item.status === 'Recommended by Institute Head'))
        ) {
          this.selectedItems.add(item);
        } else if (
          this.tableName !== 'Verify-Trainings' &&
          this.tableName !== 'Trainee-List' &&
          item.status === 'VERIFIED'
        ) {
          this.selectedItems.add(item);
        }
      });
    } else {
      this.selectedItems.clear();
    }
  }

  toggleItemSelection(item: any): void {
    if (this.selectedItems.has(item)) {
      this.selectedItems.delete(item);
    } else {
      this.selectedItems.add(item);
    }
    // Update selectAll based on eligible items only
    const eligibleItems = this.data.filter(
      (item) => item.status !== 'APPROVED' && item.status !== 'REJECTED'
    );
    this.selectAll =
      eligibleItems.length > 0 &&
      eligibleItems.every((item) => this.selectedItems.has(item));
  }

  isItemSelected(item: any): boolean {
    return this.selectedItems.has(item);
  }

  onBulkActionClick(action: string): void {
    const selectedItemsArray = Array.from(this.selectedItems);
    if (selectedItemsArray.length > 0) {
      this.bulkActionClick.emit({ action, items: selectedItemsArray });
    }
  }

  get hasSelectedItems(): boolean {
    return this.selectedItems.size > 0;
  }

  get eligibleItemsCount(): number {
    if (this.tableName === 'Verify-Trainings')
      return this.data.filter((item) => item.status === 'IN PROGRESS').length;
    else if (this.tableName === 'Trainee-List')
      return this.data.filter(
        (item) =>
          item.status === 'Trainees details uploaded' ||
          ((this.userRole === 5 || this.userRole === 6) &&
            item.status === 'Recommended by Institute Head')
      ).length;
    else return this.data.filter((item) => item.status === 'VERIFIED').length;
  }

  // Method to clear selected items - can be called from parent component
  clearSelectedItems(): void {
    this.selectedItems.clear();
    this.selectAll = false;
  }
}

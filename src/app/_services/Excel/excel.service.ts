import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable()
export class ExcelService {
  constructor() {}

  public exportAsExcelFile(json: any[], excelFileName: string): void {
    const myworksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const myworkbook: XLSX.WorkBook = {
      Sheets: { data: myworksheet },
      SheetNames: ['data'],
    };
    const excelBuffer: any = XLSX.write(myworkbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE,
    });
    FileSaver.saveAs(data, fileName + EXCEL_EXTENSION);
  }

  public onexportXLSX(json: any[], excelFileName: string): void {
    const myworksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const myworkbook: XLSX.WorkBook = {
      Sheets: { data: myworksheet },
      SheetNames: ['data'],
    };
    const excelBuffer: any = XLSX.write(myworkbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    this.saveAsExcelFile1(excelBuffer, excelFileName);
  }

  private saveAsExcelFile1(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE,
    });
    FileSaver.saveAs(data, fileName + EXCEL_EXTENSION);
  }

  /**autofit function */
  autofitColumns(ws: XLSX.WorkSheet, data: any[][]) {
    const colWidths = data[0].map((_, colIndex) => {
      return Math.max(
        ...data.map((row) => {
          const cellValue = row[colIndex] ? row[colIndex].toString() : '';
          return cellValue.length;
        })
      );
    });

    ws['!cols'] = colWidths.map((width) => ({ wch: width }));
  }

  /**function with autofit option */
  public exportAsExcelFile2(json: any[], excelFileName: string): void {
    const myworksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const myworkbook: XLSX.WorkBook = {
      Sheets: { data: myworksheet },
      SheetNames: ['data'],
    };
    //this.autofitColumns(myworksheet,json)

    // Calculate the maximum width for each column
    const wscols = json.reduce((cols, row) => {
      Object.keys(row).forEach((key, index) => {
        const value = row[key] ? row[key].toString() : '';
        cols[index] = Math.max(cols[index] || 0, value.length);
      });
      return cols;
    }, []);

    // Set the column widths
    myworksheet['!cols'] = wscols.map((width: any) => ({ wch: width }));

    const excelBuffer: any = XLSX.write(myworkbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }
}

import { Component, ElementRef, ViewChild } from '@angular/core';
import { BreadcrumbComponent, BreadcrumbItem } from '../../../components/breadcrumb/breadcrumb.component';
import { TableColumn, TableAction, TableComponent } from '../../../components/table/table.component';
import { index } from 'd3';
import { FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-scheme-management',
  imports: [TableComponent,BreadcrumbComponent],
  templateUrl: './scheme-management.component.html',
  styleUrl: './scheme-management.component.css'
})
export class SchemeManagementComponent {
  confirmationMessage:string = "";
  event:any;
  @ViewChild('schemeConfirmationModal')
  schemeConfirmationModal!: ElementRef;
isExportCSV:Boolean =false;
  isExportPdf:Boolean =false;
  table:string = "schemes";

  fileName:String = 'All_trainings_'

  pdfHeaders: Array<string> = [
    'Training Title', 'Date', 'Scheme','Location','Submission Date','Status'
  ];
  columnKeys:Array<string> =['trainingTitle','date','scheme','location','submittedOn','status']
  breadcrumbItems: BreadcrumbItem[] = [
      { label: 'Dashboard', url: '/dashboard' },
      { label: 'Scheme Management' }
    ];
    tableColumns: TableColumn[] = [
       // { key: 'schemeId', header: 'Training Title' },
        { key: 'schemeTitle', header: 'Scheme' },

      ];

      tableActions: TableAction[] = [
        { name: 'edit', icon: 'bi bi-pencil-fill', class: 'btn-info', title: 'Edit' },
       // { name: 'save', icon: 'bi bi-save-fill', class: 'btn-info', title: 'Save' },
        { name: 'delete', icon: 'bi bi-trash', class: 'btn-info', title: 'Delete' },
        // { name: 'download', icon: 'bi bi-download', class: 'btn-success', title: 'Download' },
      ];

      changeTableActions(){

      }

      tableData: any[] = [
        { schemeId: 1, schemeTitle: 'Scheme 1',editable:false,actions:this.tableActions },
        { schemeId: 2, schemeTitle: 'Scheme 2',editable:false,actions:this.tableActions },
        { schemeId: 3, schemeTitle: 'Scheme 3' ,editable:false,actions:this.tableActions},
        { schemeId: 4, schemeTitle: 'Scheme 4' ,editable:false,actions:this.tableActions},
      ];

      constructor(private formBuilder: FormBuilder,
        private modalService: NgbModal,private toastr: ToastrService
      ){

      }
      handleTableAction(event: { action: string, item: any, index: number }): void {
        this.event=event;
        if(this.event.action=='edit'){

          this.tableData[this.event.index].editable=true;

            this.tableData[this.event.index].actions= [

        { name: 'save', icon: 'bi bi-save-fill', class: 'btn-info', title: 'Save' },
        { name: 'delete', icon: 'bi bi-trash', class: 'btn-info', title: 'Delete' },
        // { name: 'download', icon: 'bi bi-download', class: 'btn-success', title: 'Download' },
      ];
        }
        else if(this.event.action=='save'){
          if(event.item.schemeTitle==null || event.item.schemeTitle==''){
            this.toastr.warning("Please enter scheme name!");
          }else{
          this.confirmationMessage = "Confirm to Save the changes!";
        this.confirmChangeModal();
          }
         }
         else if(this.event.action=='delete'){
          this.confirmationMessage = "Confirm to delete the scheme!";
          this.confirmChangeModal();
         }
      }

      confirmChangeModal(){
        this.modalService.open(this.schemeConfirmationModal, {
        size: 'sm',
        scrollable: false,
        backdrop: 'static',
        keyboard: false
      });

      }

      confirm(){

        if(this.event.action=='save'){
          this.tableData[this.event.index].editable=false;
          this.tableData[this.event.index] = this.event.item;
          this.tableData[this.event.index].actions= [
        { name: 'edit', icon: 'bi bi-pencil-fill', class: 'btn-info', title: 'Edit' },
        //{ name: 'save', icon: 'bi bi-save-fill', class: 'btn-info', title: 'Save' },
        { name: 'delete', icon: 'bi bi-trash', class: 'btn-info', title: 'Delete' },
        // { name: 'download', icon: 'bi bi-download', class: 'btn-success', title: 'Download' },
      ];

        }
        else if(this.event.action=='delete'){
          this.tableData.splice(this.event.index,1);
        }
        this.modalService.dismissAll();
      }
}

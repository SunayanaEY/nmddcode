import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { BreadcrumbComponent, BreadcrumbItem } from '../../../components/breadcrumb/breadcrumb.component';
import { TableColumn, TableAction, TableComponent } from '../../../components/table/table.component';

@Component({
  selector: 'app-training-type-management',
  imports: [TableComponent,BreadcrumbComponent],
  templateUrl: './training-type-management.component.html',
  styleUrl: './training-type-management.component.css'
})
export class TrainingTypeManagementComponent {
  confirmationMessage:string = "";
  event:any;
  @ViewChild('trainingTypeConfirmationModal')
  trainingTypeConfirmationModal!: ElementRef;
isExportCSV:Boolean =false;
  isExportPdf:Boolean =false;
  table:string = "trainingTypes";
  addNew:String = "Add new training type";

  fileName:String = 'All_trainings_'

  pdfHeaders: Array<string> = [
    'Training Title', 'Date', 'Scheme','Location','Submission Date','Status'
  ];
  columnKeys:Array<string> =['trainingTitle','date','scheme','location','submittedOn','status']
  breadcrumbItems: BreadcrumbItem[] = [
      { label: 'Dashboard', url: '/dashboard' },
      { label: 'Training Type Management' }
    ];
    tableColumns: TableColumn[] = [
       // { key: 'schemeId', header: 'Training Title' },
        { key: 'trainingType', header: 'Training Type' },

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
        { trainingTypeId: 1, trainingType: 'Classroom',editable:false,actions:this.tableActions },
        { trainingTypeId: 2, trainingType: 'Field Demo',editable:false,actions:this.tableActions },
        { trainingTypeId: 3, trainingType: 'Online' ,editable:false,actions:this.tableActions},
        { trainingTypeId: 4, trainingType: 'Hybrid' ,editable:false,actions:this.tableActions},
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
          if(event.item.trainingType==null || event.item.trainingType==''){
            this.toastr.warning("Please enter training type!");
          }else{
          this.confirmationMessage = "Confirm to Save the changes!";
        this.confirmChangeModal();
          }
         }
         else if(this.event.action=='delete'){
          if(event.item.trainingType==null || event.item.trainingType==''){
             this.tableData.splice(this.event.index,1);
          }else{
          this.confirmationMessage = "Confirm to delete training type - "+event.item.trainingType;
          this.confirmChangeModal();
          }

         }
      }

      confirmChangeModal(){
        this.modalService.open(this.trainingTypeConfirmationModal, {
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

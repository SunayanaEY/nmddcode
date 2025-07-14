import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AdminLayoutRoutes } from './admin-layout.routing';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
// import { ToastrModule } from 'ngx-toastr';

import { NgxPaginationModule } from 'ngx-pagination';

import { ExcelService } from '../../../_services/Excel/excel.service';
import { ApprovedCertificateComponent } from '../../approved-certificate/approved-certificate.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    NgxPaginationModule,
    ApprovedCertificateComponent,
  ],
  declarations: [],
  providers: [ExcelService],
})
export class AdminLayoutModule {}

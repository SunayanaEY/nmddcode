import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from '../../../components/breadcrumb/breadcrumb.component';
import { SchemeManagementComponent } from '../../admin-layout/scheme-management/scheme-management.component';
import { TrainingTypeManagementComponent } from '../../admin-layout/training-type-management/training-type-management.component';

@Component({
  selector: 'app-training-master-management',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbComponent,
    SchemeManagementComponent,
    TrainingTypeManagementComponent
  ],
  templateUrl: './training-master-management.component.html',
  styleUrls: ['./training-master-management.component.css']
})
export class TrainingMasterManagementComponent implements OnInit {

  // Breadcrumb configuration
  breadcrumbItems = [
    { label: 'Dashboard', link: '/admin/dashboard' },
    { label: 'Training Management', link: '/admin/training' },
    { label: 'Training Master Management', link: '', active: true }
  ];

  constructor() { }

  ngOnInit(): void {
    console.log('Training Master Management component initialized');
  }

}
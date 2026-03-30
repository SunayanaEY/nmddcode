import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrganizationAdminProfileComponent } from '../training/organization-admin-profile/organization-admin-profile.component';
import { OrganizationTableDataComponent } from '../training/organization-table-data/organization-table-data.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-other-organization-master',
  standalone: true,
  imports: [CommonModule, TranslateModule, OrganizationAdminProfileComponent, OrganizationTableDataComponent],
  templateUrl: './other-organization-master.component.html',
  styleUrl: './other-organization-master.component.css'
})
export class OtherOrganizationMasterComponent {
  @ViewChild(OrganizationAdminProfileComponent)
  formComponent!: OrganizationAdminProfileComponent;

  @ViewChild(OrganizationTableDataComponent)
  tableComponent!: OrganizationTableDataComponent;

  showForm = false;
  selectedOrganization: any = null;

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm && this.formComponent) {
      this.formComponent.clearEditMode();
      this.selectedOrganization = null;
    }
  }

  onEditFromTable(rowData: any): void {
    this.showForm = true;
    this.selectedOrganization = rowData;

    setTimeout(() => {
      if (this.formComponent) {
        this.formComponent.setEditData(rowData);
      }
      const formElement = document.getElementById('organizationFormSection');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  onFormSubmissionSuccess(): void {
    if (this.tableComponent) {
      this.tableComponent.loadOrganizationData();
    }
    this.showForm = false;
    this.selectedOrganization = null;
  }

  onFormCancel(): void {
    this.showForm = false;
    this.selectedOrganization = null;
  }
}

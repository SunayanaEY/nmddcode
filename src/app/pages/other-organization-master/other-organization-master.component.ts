import { Component } from '@angular/core';
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
  showForm = false;

  toggleForm() {
    this.showForm = !this.showForm;
  }
}

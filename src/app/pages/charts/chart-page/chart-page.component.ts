import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { ChartSectionComponent } from '../chart-section/chart-section.component';
import { FooterComponent } from '../../footer.component';
import { HeaderComponent } from '../../header.component';
import { SidebarComponent } from '../../sidebar.component';

@Component({
  selector: 'app-chart-page',
  imports: [HeaderComponent, FooterComponent, SidebarComponent,ChartSectionComponent],
  templateUrl: './chart-page.component.html',
  styleUrl: './chart-page.component.css'
})
export class ChartPageComponent {
  collapsed = false;

  constructor(public auth: AuthService){

  }
}

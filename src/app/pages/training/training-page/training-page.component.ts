import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { TrainingSectionComponent } from '../training-section/training-section.component';
import { FooterComponent } from '../../footer.component';
import { HeaderComponent } from '../../header.component';
import { SidebarComponent } from '../../sidebar.component';

@Component({
  selector: 'app-training-page',
  imports: [HeaderComponent, FooterComponent, SidebarComponent, TrainingSectionComponent],
  templateUrl: './training-page.component.html',
  styleUrl: './training-page.component.css'
})
export class TrainingPageComponent {
  collapsed = false;

  constructor(public auth: AuthService){

  }
}
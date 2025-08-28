import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { FooterComponent } from '../../footer.component';
import { HeaderComponent } from '../../header.component';
import { SidebarComponent } from '../../sidebar.component';
import { AuthService } from '../../../services/auth.service';
import { SessionTimeoutWarningComponent } from '../../../components/session-timeout-warning/session-timeout-warning.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, SidebarComponent, SessionTimeoutWarningComponent],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent {
collapsed = false;



  public href: string = "";
  constructor(private router: Router,public auth: AuthService) { }

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.href = event.url;
      }
    });
  }
}

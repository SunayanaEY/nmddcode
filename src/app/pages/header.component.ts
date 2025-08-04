import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  @Input() user: { username: string; email: string; role: number } | null =
    null;
  currentLanguage: 'en' | 'hi' = 'en';

  ngOnInit(): void {
    const userData = sessionStorage.getItem('user');
    if (userData) {
      this.user = JSON.parse(userData);
    }
  }

  // get userRole(): string {
  //   debugger;
  //   if (this.user?.role === 2) {
  //     return 'Administrator';
  //   } else if (this.user?.role === 1) {
  //     return 'User';
  //   } else {
  //     return 'Guest';
  //   }
  // }
  toggleLanguage(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.currentLanguage = isChecked ? 'hi' : 'en';
    console.log('Language switched to:', this.currentLanguage);

    // Optional: if using ngx-translate
    // this.translateService.use(this.currentLanguage);
  }
}

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

export interface BreadcrumbItem {
  label: string;
  url?: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule,TranslateModule],
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.css'],
})
export class BreadcrumbComponent {
  @Input() items: BreadcrumbItem[] = [];

  constructor(private router: Router) {}

  onItemClick(item: BreadcrumbItem, isLast: boolean): void {
    if (!isLast && item.url) {
      this.router.navigate([item.url]);
    }
  }
}

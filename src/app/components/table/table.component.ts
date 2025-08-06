import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  key: string;
  header: string;
  transform?: (value: any, item: any) => string;
}

export interface TableAction {
  name: string;
  icon: string;
  class: string;
  title: string;
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent {
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() actions: TableAction[] = [];

  @Output() actionClick = new EventEmitter<{ action: string, item: any, index: number }>();

  onActionClick(action: string, item: any, index: number): void {
    this.actionClick.emit({ action, item, index });
  }

  formatSerialNumber(index: number): string {
    return String(index + 1).padStart(2, '0');
  }
}
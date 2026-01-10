import { Component, EventEmitter, Input, Output, ElementRef, HostListener, forwardRef } from '@angular/core';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-multi-select-dropdown',
  templateUrl: './multi-select-dropdown.component.html',
  styleUrls: ['./multi-select-dropdown.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiSelectDropdownComponent),
      multi: true,
    },
  ],
})
export class MultiSelectDropdownComponent implements ControlValueAccessor {
  @Input() items: any[] = [];
  @Input() placeholder: string = 'Select Items';
  @Output() selectionChange = new EventEmitter<any[]>();

  isOpen = false;
  filteredItems: any[] = [];
  selectedItems: any[] = [];
  searchQuery: string = '';
  disabled = false;

  // ControlValueAccessor callbacks
  onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      if (this.isOpen) {
        this.isOpen = false;
        this.onTouched();
      }
    }
  }

  ngOnInit() {}

  // CVA methods
  writeValue(value: any): void {
    // Accept array of names or comma-separated string
    if (!value) {
      this.selectedItems = [];
      return;
    }
    const names: string[] = Array.isArray(value)
      ? value
      : String(value)
          .split(',')
          .map((v) => v.trim())
          .filter((v) => v.length);

    // Map names back to items by name
    this.selectedItems = this.items.filter((item) => names.includes(item.name));
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  toggleDropdown() {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.onSearchChange();
      this.onTouched();
    }
  }

  toggleSelection(item: any) {
    const index = this.selectedItems.findIndex((selected) => selected.id === item.id);
    if (index > -1) {
      this.selectedItems.splice(index, 1);
    } else {
      this.selectedItems.push(item);
    }
    // Emit both to Angular forms and to parent listeners
    this.onChange(this.selectedItems.map((i) => i.name));
    this.selectionChange.emit(this.selectedItems);
  }

  isSelected(item: any): boolean {
    return this.selectedItems.some((selected) => selected.id === item.id);
  }

  getSelectedItemsText(): string {
    if (this.selectedItems.length === 0) {
      return 'Select Items';
    }
    if (this.selectedItems.length === this.items.length) {
      return 'All items selected';
    }
    return this.selectedItems.map((item) => item.name).join(', ');
  }

  onSearchChange() {
    const q = (this.searchQuery || '').toLowerCase().trim();
    this.filteredItems = q
      ? this.items.filter((item) => (item.name || '').toLowerCase().includes(q))
      : [...this.items];
  }

  removeSelected(item: any) {
    const index = this.selectedItems.findIndex((selected) => selected.id === item.id);
    if (index > -1) {
      this.selectedItems.splice(index, 1);
      this.onChange(this.selectedItems.map((i) => i.name));
      this.selectionChange.emit(this.selectedItems);
      this.onTouched();
    }
  }
}

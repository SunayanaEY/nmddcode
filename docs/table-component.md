# Table Component

A reusable, responsive data table component with action buttons, serial numbering, and customizable columns.

## Features

- ✅ Responsive design with horizontal scrolling
- ✅ Automatic serial numbering
- ✅ Customizable columns
- ✅ Action buttons with icons
- ✅ Hover effects and striped rows
- ✅ Bootstrap integration
- ✅ TypeScript support
- ✅ Standalone component architecture

## Installation

### 1. Import the Component

```typescript
import { TableComponent } from './components/table/table.component';

@Component({
  // ... other component config
  imports: [TableComponent],
})
export class YourComponent {
  // component logic
}
```

### 2. Add to Template

```html
<app-table 
  [data]="tableData" 
  [columns]="tableColumns" 
  [actions]="tableActions"
  (actionClick)="onActionClick($event)">
</app-table>
```

## API Reference

### Interfaces

#### TableColumn

```typescript
export interface TableColumn {
  key: string;      // Property key from data object
  header: string;   // Display header text
}
```

#### TableAction

```typescript
export interface TableAction {
  name: string;     // Action identifier
  icon: string;     // Bootstrap icon class
  class: string;    // CSS class for styling
  title: string;    // Tooltip text
}
```

### Inputs

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `data` | `any[]` | Yes | `[]` | Array of data objects to display |
| `columns` | `TableColumn[]` | Yes | `[]` | Column configuration |
| `actions` | `TableAction[]` | No | `[]` | Action buttons configuration |

### Outputs

| Event | Type | Description |
|-------|------|-------------|
| `actionClick` | `{ action: string, item: any, index: number }` | Emitted when an action button is clicked |

### Methods

| Method | Parameters | Return Type | Description |
|--------|------------|-------------|-------------|
| `onActionClick(action: string, item: any, index: number)` | `action`: Action name<br>`item`: Data item<br>`index`: Row index | `void` | Handles action button clicks |
| `formatSerialNumber(index: number)` | `index`: Zero-based row index | `string` | Formats serial number with leading zeros |

## Usage Examples

### Basic Table

```typescript
export class UserListComponent {
  tableData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', age: 30 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 25 },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', age: 35 }
  ];

  tableColumns: TableColumn[] = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'age', header: 'Age' }
  ];

  tableActions: TableAction[] = [
    { name: 'view', icon: 'bi-eye', class: 'btn-view', title: 'View Details' },
    { name: 'edit', icon: 'bi-pencil', class: 'btn-edit', title: 'Edit User' },
    { name: 'delete', icon: 'bi-trash', class: 'btn-delete', title: 'Delete User' }
  ];

  onActionClick(event: { action: string, item: any, index: number }) {
    const { action, item, index } = event;
    
    switch (action) {
      case 'view':
        this.viewUser(item);
        break;
      case 'edit':
        this.editUser(item);
        break;
      case 'delete':
        this.deleteUser(item, index);
        break;
    }
  }

  viewUser(user: any) {
    console.log('Viewing user:', user);
  }

  editUser(user: any) {
    console.log('Editing user:', user);
  }

  deleteUser(user: any, index: number) {
    if (confirm(`Delete user ${user.name}?`)) {
      this.tableData.splice(index, 1);
    }
  }
}
```

### Table Without Actions

```typescript
export class ReadOnlyTableComponent {
  tableData = [
    { product: 'Laptop', price: 999, category: 'Electronics' },
    { product: 'Book', price: 29, category: 'Education' }
  ];

  tableColumns: TableColumn[] = [
    { key: 'product', header: 'Product Name' },
    { key: 'price', header: 'Price ($)' },
    { key: 'category', header: 'Category' }
  ];

  // No actions array - actions column won't be displayed
}
```

### Dynamic Data Loading

```typescript
export class DynamicTableComponent implements OnInit {
  tableData: any[] = [];
  loading = true;

  tableColumns: TableColumn[] = [
    { key: 'name', header: 'Training Centre' },
    { key: 'location', header: 'Location' },
    { key: 'capacity', header: 'Capacity' },
    { key: 'status', header: 'Status' }
  ];

  tableActions: TableAction[] = [
    { name: 'view', icon: 'bi-eye', class: 'btn-view', title: 'View Details' }
  ];

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    try {
      this.loading = true;
      this.tableData = await this.dataService.getTrainingCentres();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      this.loading = false;
    }
  }

  onActionClick(event: { action: string, item: any, index: number }) {
    if (event.action === 'view') {
      this.router.navigate(['/training-centre', event.item.id]);
    }
  }
}
```

## Styling

### Default Styles

The component includes comprehensive styling for:
- Responsive table container with shadow
- Striped rows with hover effects
- Professional header styling
- Action button styling with hover animations
- Mobile-responsive design

### CSS Classes

| Class | Description |
|-------|-------------|
| `.table-container` | Main wrapper container |
| `.table-responsive` | Responsive wrapper for horizontal scrolling |
| `.table` | Bootstrap table base class |
| `.action-buttons` | Container for action buttons |
| `.btn-action` | Base class for action buttons |
| `.btn-view` | View action button (teal) |
| `.btn-edit` | Edit action button (green) |
| `.btn-delete` | Delete action button (red) |

### Custom Action Button Styles

```css
/* Custom action button */
.btn-custom {
  background-color: #6f42c1;
  color: white;
}

.btn-custom:hover {
  background-color: #5a32a3;
  transform: scale(1.1);
}
```

```typescript
// Use in component
tableActions: TableAction[] = [
  { name: 'custom', icon: 'bi-star', class: 'btn-custom', title: 'Custom Action' }
];
```

### Responsive Breakpoints

- **Desktop (>1200px)**: Full size with standard padding
- **Tablet (768px-1200px)**: Reduced font size and padding
- **Mobile (<768px)**: Compact layout with minimal spacing

## Best Practices

### 1. Data Structure
- Ensure consistent property names across all data objects
- Use meaningful property keys that match column keys
- Handle null/undefined values in your data

### 2. Column Configuration
- Keep header text concise but descriptive
- Order columns by importance (most important first)
- Consider mobile display when adding many columns

### 3. Action Buttons
- Limit to 3-4 actions for better UX
- Use standard Bootstrap icons for consistency
- Provide clear, descriptive tooltips
- Follow color conventions (green=edit, red=delete, blue=view)

### 4. Performance
- Use `OnPush` change detection for large datasets
- Implement virtual scrolling for very large tables
- Consider pagination for better performance

```typescript
@Component({
  // ... other config
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OptimizedTableComponent {
  // component logic
}
```

### 5. Accessibility
- The component includes proper table semantics
- Action buttons have title attributes for tooltips
- Consider adding ARIA labels for complex data:

```html
<app-table 
  [data]="tableData" 
  [columns]="tableColumns" 
  [actions]="tableActions"
  (actionClick)="onActionClick($event)"
  role="table"
  aria-label="User data table">
</app-table>
```

## Advanced Usage

### Custom Cell Formatting

For complex cell content, consider preprocessing your data:

```typescript
export class FormattedTableComponent {
  rawData = [
    { name: 'John', salary: 50000, joinDate: '2023-01-15' },
    { name: 'Jane', salary: 60000, joinDate: '2023-02-20' }
  ];

  get tableData() {
    return this.rawData.map(item => ({
      ...item,
      salary: this.formatCurrency(item.salary),
      joinDate: this.formatDate(item.joinDate)
    }));
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}
```

### Conditional Actions

```typescript
export class ConditionalActionsComponent {
  getActionsForItem(item: any): TableAction[] {
    const baseActions = [
      { name: 'view', icon: 'bi-eye', class: 'btn-view', title: 'View' }
    ];

    if (item.status === 'active') {
      baseActions.push(
        { name: 'edit', icon: 'bi-pencil', class: 'btn-edit', title: 'Edit' },
        { name: 'delete', icon: 'bi-trash', class: 'btn-delete', title: 'Delete' }
      );
    }

    return baseActions;
  }

  // Note: This requires modifying the component to accept dynamic actions
  // Consider creating a custom table component for this use case
}
```

## Troubleshooting

### Common Issues

1. **Data not displaying**: Check that column keys match data object properties
2. **Actions not working**: Verify action names in the event handler
3. **Styling issues**: Ensure Bootstrap CSS is loaded
4. **Responsive issues**: Check container width and CSS conflicts

### Dependencies

- Angular Common Module
- Bootstrap CSS (for table classes)
- Bootstrap Icons (for action button icons)

Make sure these dependencies are available in your application.

### Performance Considerations

- For tables with >100 rows, consider implementing pagination
- Use `trackBy` functions for better change detection
- Avoid complex computations in template expressions

```typescript
// Add trackBy for better performance
trackByFn(index: number, item: any): any {
  return item.id || index;
}
```

```html
<!-- Use in template -->
<tr *ngFor="let item of data; let i = index; trackBy: trackByFn">
  <!-- table content -->
</tr>
```
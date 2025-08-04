# Breadcrumb Component

A reusable navigation breadcrumb component that displays the current page's location within the application hierarchy.

## Features

- ✅ Responsive design
- ✅ Clickable navigation items
- ✅ Active state indication
- ✅ Bootstrap Icons integration
- ✅ TypeScript support
- ✅ Standalone component architecture

## Installation

### 1. Import the Component

```typescript
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';

@Component({
  // ... other component config
  imports: [BreadcrumbComponent],
})
export class YourComponent {
  // component logic
}
```

### 2. Add to Template

```html
<app-breadcrumb [items]="breadcrumbItems"></app-breadcrumb>
```

#### BreadcrumbItem

```typescript
export interface BreadcrumbItem {
  label: string;    // Display text for the breadcrumb item
  url?: string;     // Optional navigation URL
}
```

### Inputs

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `items` | `BreadcrumbItem[]` | Yes | `[]` | Array of breadcrumb items to display |

### Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `onItemClick(item: BreadcrumbItem, isLast: boolean)` | `item`: The clicked breadcrumb item<br>`isLast`: Whether this is the last item | Handles navigation when a breadcrumb item is clicked |

## Usage Examples

### Basic Usage

```typescript
export class TrainingCentreComponent {
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Dashboard', url: '/dashboard' },
    { label: 'Training', url: '/dashboard/training' },
    { label: 'Training Centres' } // No URL for current page
  ];
}
```

```html
<app-breadcrumb [items]="breadcrumbItems"></app-breadcrumb>
```

### Dynamic Breadcrumbs

```typescript
export class DynamicPageComponent implements OnInit {
  breadcrumbItems: BreadcrumbItem[] = [];

  ngOnInit() {
    this.buildBreadcrumbs();
  }

  private buildBreadcrumbs() {
    this.breadcrumbItems = [
      { label: 'Home', url: '/' },
      { label: 'Category', url: '/category' },
      { label: this.getCurrentPageTitle() }
    ];
  }

  private getCurrentPageTitle(): string {
    // Logic to get current page title
    return 'Current Page';
  }
}
```

### Nested Navigation

```typescript
export class NestedComponent {
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Dashboard', url: '/dashboard' },
    { label: 'Management', url: '/dashboard/management' },
    { label: 'Users', url: '/dashboard/management/users' },
    { label: 'User Profile' } // Current page
  ];
}
```

## Styling

### Default Styles

The component comes with built-in styles that provide:
- Flexbox layout with proper spacing
- Hover effects for clickable items
- Active state styling for current page
- Bootstrap Icons chevron separators

### CSS Classes

| Class | Description |
|-------|-------------|
| `.breadcrumb` | Main container class |
| `.breadcrumb-item` | Individual breadcrumb item |
| `.breadcrumb-item.active` | Active/current page item |
| `.bi-chevron-right` | Separator icon |

### Customization

You can override the default styles by targeting the CSS classes:

```css
/* Custom breadcrumb styling */
.breadcrumb {
  background-color: #f8f9fa;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  margin-bottom: 1.5rem;
}

.breadcrumb-item {
  font-size: 0.875rem;
  color: #6c757d;
}

.breadcrumb-item:not(.active):hover {
  color: #0d6efd;
  text-decoration: underline;
}

.breadcrumb-item.active {
  color: #212529;
  font-weight: 500;
}
```

## Best Practices

### 1. Breadcrumb Structure
- Always include the root/home page as the first item
- The last item should represent the current page (no URL)
- Keep labels concise but descriptive
- Maintain consistent hierarchy levels

### 2. Navigation URLs
- Provide URLs for all items except the current page
- Use absolute paths for consistency
- Ensure all URLs are valid and accessible

### 3. Accessibility
- The component automatically handles click events
- Consider adding ARIA labels for screen readers:

```html
<app-breadcrumb 
  [items]="breadcrumbItems" 
  role="navigation" 
  aria-label="Breadcrumb navigation">
</app-breadcrumb>
```

### 4. Performance
- Build breadcrumb items once in `ngOnInit`
- Use `OnPush` change detection strategy if needed
- Avoid frequent updates to breadcrumb items

## Common Patterns

### Route-Based Breadcrumbs

```typescript
import { ActivatedRoute, Router } from '@angular/router';

export class RouteBasedBreadcrumbs implements OnInit {
  breadcrumbItems: BreadcrumbItem[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.buildBreadcrumbsFromRoute();
  }

  private buildBreadcrumbsFromRoute() {
    const urlSegments = this.router.url.split('/').filter(segment => segment);
    this.breadcrumbItems = [
      { label: 'Home', url: '/' },
      ...urlSegments.map((segment, index) => {
        const url = '/' + urlSegments.slice(0, index + 1).join('/');
        const isLast = index === urlSegments.length - 1;
        return {
          label: this.formatSegmentLabel(segment),
          url: isLast ? undefined : url
        };
      })
    ];
  }

  private formatSegmentLabel(segment: string): string {
    return segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}
```

## Troubleshooting

### Common Issues

1. **Breadcrumb not showing**: Ensure `items` array is not empty
2. **Navigation not working**: Check that URLs are correct and accessible
3. **Styling issues**: Verify Bootstrap Icons are loaded
4. **TypeScript errors**: Import the `BreadcrumbItem` interface

### Dependencies

- Angular Common Module
- Angular Router
- Bootstrap Icons (for chevron separators)

Make sure these dependencies are available in your application.
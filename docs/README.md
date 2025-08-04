## Component Documentation

This directory contains comprehensive documentation for reusable UI components used throughout the National Dairy Project application.

### Available Components

1. **[Breadcrumb Component](./breadcrumb-component.md)** - Navigation breadcrumb with dynamic routing
2. **[Table Component](./table-component.md)** - Data table with sorting, actions, and responsive design  
3. **[Modal Component](./modal-component.md)** - Versatile modal with multiple modes and form support

### Quick Reference

| Component | Purpose | Key Features |
|-----------|---------|-------------|
| [Breadcrumb](./breadcrumb-component.md) | Navigation | Dynamic routing, customizable styling, click handling |
| [Table](./table-component.md) | Data Display | Responsive design, action buttons, serial numbers, custom formatting |
| [Modal](./modal-component.md) | User Interaction | Multiple modes (view/edit/create), 11 input types, form validation |

### Component Features Overview

#### 🧭 Breadcrumb Component
- ✅ Dynamic breadcrumb generation
- ✅ Router integration
- ✅ Customizable styling
- ✅ Click event handling
- ✅ Responsive design

#### 📊 Table Component
- ✅ Dynamic column configuration
- ✅ Action buttons (Edit, Delete, View)
- ✅ Responsive design
- ✅ Serial number generation
- ✅ Custom cell formatting
- ✅ Hover effects

#### 🔲 Modal Component
- ✅ Multiple modes (View, Edit, Create)
- ✅ 11 different input types
- ✅ Configurable sizes (xs, s, m, l, xl)
- ✅ Form validation
- ✅ File upload support
- ✅ Custom content support
- ✅ Event-driven architecture

### Getting Started

Each component documentation includes:
- ✅ Feature overview and capabilities
- ✅ Step-by-step installation instructions
- ✅ Complete API reference with interfaces
- ✅ Real-world usage examples
- ✅ Best practices and patterns
- ✅ Troubleshooting guide
- ✅ Performance optimization tips

### File Structure

```
docs/
├── README.md                 # This overview file
├── breadcrumb-component.md   # Breadcrumb navigation component
├── table-component.md        # Data table component
└── modal-component.md        # Modal dialog component
```

### Usage Examples

#### Quick Start - Breadcrumb
```typescript
// Component
breadcrumbItems: BreadcrumbItem[] = [
  { label: 'Dashboard', route: '/dashboard' },
  { label: 'Training Centre', route: '/dashboard/training-centre' }
];
```

#### Quick Start - Table
```typescript
// Component
tableColumns: TableColumn[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true }
];

tableActions: TableAction[] = [
  { label: 'Edit', action: 'edit', class: 'btn-primary' },
  { label: 'Delete', action: 'delete', class: 'btn-danger' }
];
```

#### Quick Start - Modal
```typescript
// Component
modalConfig: ModalConfig = {
  title: 'User Form',
  size: 'l',
  primaryButtonText: 'Save',
  fields: [
    { id: 'name', label: 'Name', type: 'text', required: true },
    { id: 'email', label: 'Email', type: 'email', required: true }
  ]
};
```

### Development Guidelines

#### When adding new components:
1. **Documentation First**: Create detailed documentation following the existing format
2. **Comprehensive Examples**: Include real-world usage scenarios
3. **API Reference**: Document all interfaces, inputs, outputs, and methods
4. **Best Practices**: Include performance tips and common patterns
5. **Troubleshooting**: Add common issues and solutions
6. **Update README**: Add component to this overview file

#### Documentation Standards:
- Use clear, descriptive headings
- Include code examples for all features
- Provide both basic and advanced usage scenarios
- Document all configuration options
- Include styling and customization guides

### Architecture Notes

These components follow Angular best practices:
- **Standalone Components**: Modern Angular architecture
- **TypeScript Interfaces**: Strong typing for better development experience
- **Event-Driven**: Clean separation of concerns
- **Responsive Design**: Mobile-first approach
- **Accessibility**: ARIA attributes and keyboard navigation
- **Performance**: OnPush change detection where applicable

### Support & Maintenance

For questions, issues, or contributions:
1. **Component Issues**: Refer to individual component documentation
2. **Usage Questions**: Check the examples and best practices sections
3. **Feature Requests**: Contact the development team
4. **Bug Reports**: Include component version and reproduction steps


**Happy Coding! 🚀**

These components are designed to accelerate development while maintaining consistency across the National Dairy Project application :`)
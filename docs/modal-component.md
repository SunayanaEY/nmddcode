# Modal Component

A versatile, reusable modal component with support for multiple modes (view, edit, create), dynamic form fields, and customizable configurations.

## Features

- ✅ Multiple modes: View, Edit, Create
- ✅ Dynamic form field generation
- ✅ 11 different input types
- ✅ Configurable modal sizes (xs, s, m, l, xl)
- ✅ Custom content support
- ✅ Form validation
- ✅ File upload support
- ✅ Responsive design
- ✅ Backdrop click to close
- ✅ TypeScript support
- ✅ Event-driven architecture

## Installation

### 1. Import the Component

```typescript
import { ModalComponent, ModalConfig, ModalField } from './components/modal/modal.component';

@Component({
  // ... other component config
  imports: [ModalComponent],
})
export class YourComponent {
  // component logic
}
```

### 2. Add to Template

```html
<app-modal 
  [show]="showModal"
  [config]="modalConfig"
  [data]="modalData"
  [mode]="modalMode"
  (close)="onModalClose()"
  (primaryAction)="onPrimaryAction($event)"
  (secondaryAction)="onSecondaryAction($event)"
  (fieldChange)="onFieldChange($event)">
</app-modal>
```

## API Reference

### Interfaces

#### ModalField

```typescript
export interface ModalField {
  id: string;                    // Unique field identifier
  label: string;                 // Display label
  type: 'text' | 'textarea' | 'email' | 'password' | 'number' | 
        'tel' | 'date' | 'file' | 'select' | 'checkbox' | 'radio';
  value?: any;                   // Default/initial value
  placeholder?: string;          // Placeholder text
  required?: boolean;            // Required field validation
  disabled?: boolean;            // Disable field
  options?: { value: any; label: string }[];  // For select/radio
  rows?: number;                 // For textarea
  accept?: string;               // For file input (e.g., '.pdf,.doc')
  min?: number;                  // For number input
  max?: number;                  // For number input
  pattern?: string;              // Regex validation pattern
  multiple?: boolean;            // For file/select multiple
}
```

#### ModalConfig

```typescript
export interface ModalConfig {
  title: string;                 // Modal title
  size?: 'xs' | 's' | 'm' | 'l' | 'xl';  // Modal size
  showCloseButton?: boolean;     // Show X button (default: true)
  showFooter?: boolean;          // Show footer (default: true)
  primaryButtonText?: string;    // Primary button text
  secondaryButtonText?: string;  // Secondary button text
  fields?: ModalField[];         // Dynamic form fields
  content?: string;              // Custom HTML content
}
```

### Inputs

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `show` | `boolean` | Yes | `false` | Controls modal visibility |
| `config` | `ModalConfig` | Yes | `{ title: 'Modal' }` | Modal configuration |
| `data` | `any` | No | `{}` | Data for view mode |
| `mode` | `'view' \| 'edit' \| 'create'` | No | `'view'` | Modal operation mode |

### Outputs

| Event | Type | Description |
|-------|------|-------------|
| `close` | `void` | Emitted when modal is closed |
| `primaryAction` | `any` | Emitted when primary button clicked (returns form data) |
| `secondaryAction` | `any` | Emitted when secondary button clicked (returns form data) |
| `fieldChange` | `{ fieldId: string; value: any }` | Emitted when any field value changes |

### Methods

| Method | Parameters | Return Type | Description |
|--------|------------|-------------|-------------|
| `getSizeClass()` | None | `string` | Returns CSS class for modal size |
| `onFieldChange(fieldId, value)` | `fieldId`: string<br>`value`: any | `void` | Handles field value changes |
| `onFileChange(fieldId, event)` | `fieldId`: string<br>`event`: Event | `void` | Handles file input changes |
| `formatDisplayValue(value, type?)` | `value`: any<br>`type?`: string | `string` | Formats values for display |
| `getDisplayValue(key)` | `key`: string | `any` | Gets value from data object |

## Usage Examples

### 1. View Mode Modal

```typescript
export class ViewModalComponent {
  showModal = false;
  selectedUser: any = {};

  modalConfig: ModalConfig = {
    title: 'User Details',
    size: 'm',
    showCloseButton: true,
    showFooter: true
  };

  openUserModal(user: any) {
    this.selectedUser = user;
    this.showModal = true;
  }

  onModalClose() {
    this.showModal = false;
  }
}
```

```html
<app-modal 
  [show]="showModal"
  [config]="modalConfig"
  [data]="selectedUser"
  mode="view"
  (close)="onModalClose()">
</app-modal>
```

### 2. Create/Edit Form Modal

```typescript
export class FormModalComponent {
  showModal = false;
  modalMode: 'create' | 'edit' = 'create';
  editingUser: any = {};

  modalConfig: ModalConfig = {
    title: 'User Form',
    size: 'l',
    primaryButtonText: 'Save',
    secondaryButtonText: 'Cancel',
    fields: [
      {
        id: 'name',
        label: 'Full Name',
        type: 'text',
        required: true,
        placeholder: 'Enter full name'
      },
      {
        id: 'email',
        label: 'Email Address',
        type: 'email',
        required: true,
        placeholder: 'Enter email address'
      },
      {
        id: 'age',
        label: 'Age',
        type: 'number',
        min: 18,
        max: 100,
        required: true
      },
      {
        id: 'gender',
        label: 'Gender',
        type: 'select',
        required: true,
        options: [
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
          { value: 'other', label: 'Other' }
        ]
      },
      {
        id: 'bio',
        label: 'Biography',
        type: 'textarea',
        rows: 4,
        placeholder: 'Tell us about yourself'
      },
      {
        id: 'newsletter',
        label: 'Subscribe to Newsletter',
        type: 'checkbox',
        placeholder: 'Yes, I want to receive updates'
      }
    ]
  };

  openCreateModal() {
    this.modalMode = 'create';
    this.modalConfig.title = 'Create New User';
    this.modalConfig.primaryButtonText = 'Create';
    this.showModal = true;
  }

  openEditModal(user: any) {
    this.modalMode = 'edit';
    this.editingUser = user;
    this.modalConfig.title = 'Edit User';
    this.modalConfig.primaryButtonText = 'Update';
    
    // Pre-populate form fields with existing data
    this.modalConfig.fields = this.modalConfig.fields?.map(field => ({
      ...field,
      value: this.getFieldValue(user, field.id)
    })) || [];
    
    this.showModal = true;
  }

  // Helper method for field mapping
  getFieldValue(data: any, fieldId: string): any {
    const fieldMapping: { [key: string]: string } = {
      'name': 'fullName',
      'email': 'emailAddress',
      'age': 'userAge',
      'gender': 'userGender',
      'bio': 'biography',
      'newsletter': 'subscribeNewsletter'
    };
    
    const mappedField = fieldMapping[fieldId] || fieldId;
    return data[mappedField] || '';
  }

  onPrimaryAction(formData: any) {
    if (this.modalMode === 'create') {
      this.createUser(formData);
    } else {
      this.updateUser(formData);
    }
    this.showModal = false;
  }

  onSecondaryAction() {
    this.showModal = false;
  }

  onFieldChange(event: { fieldId: string; value: any }) {
    console.log(`Field ${event.fieldId} changed to:`, event.value);
  }

  createUser(userData: any) {
    console.log('Creating user:', userData);
    // Implement user creation logic
  }

  updateUser(userData: any) {
    console.log('Updating user:', userData);
    // Implement user update logic
  }
}
```

### 3. File Upload Modal

```typescript
export class FileUploadModalComponent {
  showModal = false;

  modalConfig: ModalConfig = {
    title: 'Upload Documents',
    size: 'm',
    primaryButtonText: 'Upload',
    secondaryButtonText: 'Cancel',
    fields: [
      {
        id: 'documents',
        label: 'Select Documents',
        type: 'file',
        accept: '.pdf,.doc,.docx,.jpg,.png',
        multiple: true,
        required: true
      },
      {
        id: 'category',
        label: 'Document Category',
        type: 'select',
        required: true,
        options: [
          { value: 'identity', label: 'Identity Documents' },
          { value: 'education', label: 'Educational Certificates' },
          { value: 'experience', label: 'Experience Letters' }
        ]
      },
      {
        id: 'description',
        label: 'Description',
        type: 'textarea',
        rows: 3,
        placeholder: 'Optional description'
      }
    ]
  };

  onPrimaryAction(formData: any) {
    const files = formData.documents;
    const category = formData.category;
    const description = formData.description;
    
    this.uploadFiles(files, category, description);
    this.showModal = false;
  }

  uploadFiles(files: FileList, category: string, description: string) {
    // Implement file upload logic
    console.log('Uploading files:', files, 'Category:', category);
  }
}
```

### 4. Custom Content Modal

```typescript
export class CustomContentModalComponent {
  showModal = false;

  modalConfig: ModalConfig = {
    title: 'Terms and Conditions',
    size: 'xl',
    primaryButtonText: 'Accept',
    secondaryButtonText: 'Decline',
    content: `
      <div class="terms-content">
        <h6>1. Acceptance of Terms</h6>
        <p>By using this service, you agree to these terms...</p>
        
        <h6>2. Privacy Policy</h6>
        <p>Your privacy is important to us...</p>
        
        <h6>3. User Responsibilities</h6>
        <ul>
          <li>Maintain account security</li>
          <li>Provide accurate information</li>
          <li>Respect other users</li>
        </ul>
      </div>
    `
  };

  onPrimaryAction() {
    console.log('Terms accepted');
    this.showModal = false;
  }

  onSecondaryAction() {
    console.log('Terms declined');
    this.showModal = false;
  }
}
```

### 5. Radio Button Modal

```typescript
export class RadioModalComponent {
  showModal = false;

  modalConfig: ModalConfig = {
    title: 'Select Preference',
    size: 's',
    primaryButtonText: 'Save',
    fields: [
      {
        id: 'theme',
        label: 'Choose Theme',
        type: 'radio',
        required: true,
        options: [
          { value: 'light', label: 'Light Theme' },
          { value: 'dark', label: 'Dark Theme' },
          { value: 'auto', label: 'Auto (System)' }
        ]
      },
      {
        id: 'language',
        label: 'Language',
        type: 'radio',
        required: true,
        options: [
          { value: 'en', label: 'English' },
          { value: 'hi', label: 'Hindi' },
          { value: 'bn', label: 'Bengali' }
        ]
      }
    ]
  };

  onPrimaryAction(formData: any) {
    console.log('Preferences saved:', formData);
    this.savePreferences(formData);
    this.showModal = false;
  }

  savePreferences(preferences: any) {
    // Save to localStorage or API
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
  }
}
```

## Modal Sizes

| Size | Class | Max Width | Best For |
|------|-------|-----------|----------|
| `xs` | `modal-xs` | 300px | Confirmations, alerts |
| `s` | `modal-s` | 400px | Simple forms, settings |
| `m` | `modal-m` | 500px | Standard forms (default) |
| `l` | `modal-l` | 700px | Complex forms, detailed views |
| `xl` | `modal-xl` | 900px | Rich content, large forms |

## Field Types

### Text-based Fields

```typescript
// Text input
{ id: 'name', label: 'Name', type: 'text', placeholder: 'Enter name' }

// Email with validation
{ id: 'email', label: 'Email', type: 'email', required: true }

// Password
{ id: 'password', label: 'Password', type: 'password', required: true }

// Phone number
{ id: 'phone', label: 'Phone', type: 'tel', pattern: '[0-9]{10}' }

// Textarea
{ id: 'notes', label: 'Notes', type: 'textarea', rows: 5 }
```

### Number and Date Fields

```typescript
// Number with constraints
{ id: 'age', label: 'Age', type: 'number', min: 18, max: 100 }

// Date picker
{ id: 'birthdate', label: 'Birth Date', type: 'date' }
```

### Selection Fields

```typescript
// Single select
{
  id: 'country',
  label: 'Country',
  type: 'select',
  options: [
    { value: 'in', label: 'India' },
    { value: 'us', label: 'United States' }
  ]
}

// Multiple select
{
  id: 'skills',
  label: 'Skills',
  type: 'select',
  multiple: true,
  options: [
    { value: 'js', label: 'JavaScript' },
    { value: 'ts', label: 'TypeScript' },
    { value: 'angular', label: 'Angular' }
  ]
}

// Radio buttons
{
  id: 'gender',
  label: 'Gender',
  type: 'radio',
  options: [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' }
  ]
}

// Checkbox
{ id: 'agree', label: 'Terms', type: 'checkbox', placeholder: 'I agree to terms' }
```

### File Upload Fields

```typescript
// Single file
{ id: 'avatar', label: 'Profile Picture', type: 'file', accept: '.jpg,.png' }

// Multiple files
{
  id: 'documents',
  label: 'Documents',
  type: 'file',
  multiple: true,
  accept: '.pdf,.doc,.docx'
}
```

## Styling

### CSS Classes

| Class | Description |
|-------|-------------|
| `.modal-backdrop` | Semi-transparent overlay |
| `.modal` | Main modal container |
| `.modal-dialog` | Modal dialog wrapper |
| `.modal-content` | Modal content container |
| `.modal-header` | Header section |
| `.modal-title` | Title text |
| `.modal-body` | Body content |
| `.modal-footer` | Footer with buttons |
| `.btn-close` | Close button |
| `.form-fields` | Form fields container |
| `.view-mode` | View mode styling |

### Size Classes

```css
.modal-xs { max-width: 300px; }
.modal-s { max-width: 400px; }
.modal-m { max-width: 500px; }
.modal-l { max-width: 700px; }
.modal-xl { max-width: 900px; }
```

### Custom Styling

```css
/* Custom modal theme */
.modal-content {
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px 12px 0 0;
}

/* Custom field styling */
.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}
```

## Data Population for Edit Mode

When opening a modal in edit mode, it's crucial to properly populate the form fields with existing data. The modal component supports automatic data population through the `data` input and field value mapping.

### Basic Data Population

```typescript
// Simple approach - when field IDs match data properties
openEditModal(item: any) {
  this.modalMode = 'edit';
  this.modalConfig.title = 'Edit Item';
  this.modalConfig.primaryButtonText = 'Update';
  
  // Direct field population when IDs match
  this.modalConfig.fields = this.modalConfig.fields?.map(field => ({
    ...field,
    value: item[field.id] || ''
  })) || [];
  
  this.showModal = true;
}
```

### Advanced Field Mapping

When your data structure doesn't match the field IDs, use a mapping approach:

```typescript
export class TrainingCentreComponent {
  editTrainingCentre(centre: any) {
    this.modalMode = 'edit';
    this.selectedCentre = { ...centre };
    this.modalConfig.title = 'Edit Training Centre';
    this.modalConfig.primaryButtonText = 'Update';
    
    // Map data to form fields using helper method
    this.modalConfig.fields = this.modalConfig.fields?.map(field => ({
      ...field,
      value: this.getFieldValue(centre, field.id)
    })) || [];
    
    this.showModal = true;
  }

  // Field mapping helper method
  getFieldValue(data: any, fieldId: string): any {
    const fieldMapping: { [key: string]: string } = {
      'trainingInstituteName': 'name',
      'scheme': 'schemeName',
      'state': 'stateName',
      'district': 'districtName',
      'block': 'blockName',
      'contactPersonName': 'contactPerson',
      'contactNumber': 'phone',
      'emailId': 'email',
      'designation': 'position',
      'registrationId': 'regId'
    };
    
    const mappedField = fieldMapping[fieldId] || fieldId;
    return data[mappedField] || '';
  }

  // Handle form submission for updates
  onModalPrimaryAction(formData: any) {
    if (this.modalMode === 'edit') {
      this.updateTrainingCentre(formData);
    }
  }

  updateTrainingCentre(formData: any) {
    const updatedData = {
      ...this.selectedCentre,
      ...formData
    };
    
    this.adminService.updateTrainingInstitute(this.selectedCentre.id, updatedData)
      .subscribe({
        next: (response) => {
          // Update local data
          const index = this.trainingCentres.findIndex(c => c.id === this.selectedCentre.id);
          if (index !== -1) {
            this.trainingCentres[index] = { ...this.trainingCentres[index], ...formData };
          }
          this.closeModal();
        },
        error: (error) => {
          console.error('Error updating training centre:', error);
        }
      });
  }
}
```

### View-Only Mode

For read-only modals, simply set the mode to 'view':

```typescript
viewTrainingCentre(centre: any) {
  this.selectedCentre = centre;
  this.modalConfig.title = 'Training Centre Details';
  this.modalMode = 'view';
  
  // Data is automatically displayed in view mode
  // No need to populate form fields
  this.showModal = true;
}
```

### Template Configuration

```html
<app-modal
  [show]="showModal"
  [config]="modalConfig"
  [data]="selectedCentre"
  [mode]="modalMode"
  (close)="closeModal()"
  (primaryAction)="onModalPrimaryAction($event)">
</app-modal>
```

### Key Points for Data Population

1. **Always create a copy** of the original data to avoid unintended mutations
2. **Use field mapping** when data structure differs from form field IDs
3. **Handle missing values** with fallbacks (empty strings, default values)
4. **Validate data types** to ensure compatibility with form controls
5. **Update local state** after successful API calls to maintain consistency

## Best Practices

### 1. Modal Configuration

```typescript
// Good: Clear, descriptive configuration
modalConfig: ModalConfig = {
  title: 'Edit Training Centre',
  size: 'l',
  primaryButtonText: 'Save Changes',
  secondaryButtonText: 'Cancel',
  fields: this.getFormFields()
};

// Avoid: Vague or unclear configuration
modalConfig: ModalConfig = {
  title: 'Modal',
  primaryButtonText: 'OK'
};
```

### 2. Field Validation

```typescript
// Good: Comprehensive validation
{
  id: 'email',
  label: 'Email Address',
  type: 'email',
  required: true,
  placeholder: 'user@example.com',
  pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
}

// Good: Number constraints
{
  id: 'age',
  label: 'Age',
  type: 'number',
  required: true,
  min: 18,
  max: 100
}
```

### 3. Error Handling

```typescript
onPrimaryAction(formData: any) {
  try {
    // Validate required fields
    const requiredFields = this.modalConfig.fields?.filter(f => f.required);
    const missingFields = requiredFields?.filter(f => !formData[f.id]);
    
    if (missingFields?.length) {
      alert(`Please fill required fields: ${missingFields.map(f => f.label).join(', ')}`);
      return;
    }
    
    // Process form data
    this.saveData(formData);
    this.showModal = false;
    
  } catch (error) {
    console.error('Error saving data:', error);
    alert('An error occurred while saving. Please try again.');
  }
}
```

### 4. Dynamic Field Generation

```typescript
getUserFormFields(): ModalField[] {
  return [
    {
      id: 'name',
      label: 'Full Name',
      type: 'text',
      required: true,
      placeholder: 'Enter full name'
    },
    {
      id: 'role',
      label: 'Role',
      type: 'select',
      required: true,
      options: this.getRoleOptions() // Dynamic options
    },
    // Add conditional fields based on user role
    ...(this.selectedRole === 'admin' ? this.getAdminFields() : []),
    ...(this.selectedRole === 'user' ? this.getUserFields() : [])
  ];
}
```

### 5. Performance Optimization

```typescript
// Use OnPush change detection
@Component({
  // ... other config
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OptimizedModalComponent {
  // Use trackBy for dynamic fields
  trackByFieldId(index: number, field: ModalField): string {
    return field.id;
  }
}
```

```html
<!-- Use trackBy in template -->
<div *ngFor="let field of config.fields; trackBy: trackByFieldId">
  <!-- field content -->
</div>
```

## Advanced Usage

### 1. Conditional Field Display

```typescript
export class ConditionalFieldsComponent {
  modalConfig: ModalConfig = {
    title: 'User Registration',
    fields: [
      {
        id: 'userType',
        label: 'User Type',
        type: 'select',
        options: [
          { value: 'student', label: 'Student' },
          { value: 'teacher', label: 'Teacher' },
          { value: 'admin', label: 'Administrator' }
        ]
      }
      // Additional fields will be added dynamically
    ]
  };

  onFieldChange(event: { fieldId: string; value: any }) {
    if (event.fieldId === 'userType') {
      this.updateFieldsBasedOnUserType(event.value);
    }
  }

  updateFieldsBasedOnUserType(userType: string) {
    // Remove conditional fields
    this.modalConfig.fields = this.modalConfig.fields?.filter(f => 
      !['studentId', 'teacherId', 'adminLevel'].includes(f.id)
    );

    // Add fields based on user type
    switch (userType) {
      case 'student':
        this.modalConfig.fields?.push({
          id: 'studentId',
          label: 'Student ID',
          type: 'text',
          required: true
        });
        break;
      case 'teacher':
        this.modalConfig.fields?.push({
          id: 'teacherId',
          label: 'Teacher ID',
          type: 'text',
          required: true
        });
        break;
      case 'admin':
        this.modalConfig.fields?.push({
          id: 'adminLevel',
          label: 'Admin Level',
          type: 'select',
          options: [
            { value: '1', label: 'Level 1' },
            { value: '2', label: 'Level 2' },
            { value: '3', label: 'Level 3' }
          ]
        });
        break;
    }
  }
}
```

### 2. Custom Validation

```typescript
export class CustomValidationComponent {
  onPrimaryAction(formData: any) {
    const validationErrors = this.validateForm(formData);
    
    if (validationErrors.length > 0) {
      alert('Validation errors:\n' + validationErrors.join('\n'));
      return;
    }
    
    // Proceed with form submission
    this.submitForm(formData);
  }

  validateForm(formData: any): string[] {
    const errors: string[] = [];
    
    // Custom email validation
    if (formData.email && !this.isValidEmail(formData.email)) {
      errors.push('Please enter a valid email address');
    }
    
    // Password strength validation
    if (formData.password && !this.isStrongPassword(formData.password)) {
      errors.push('Password must be at least 8 characters with uppercase, lowercase, and numbers');
    }
    
    // Age validation
    if (formData.age && (formData.age < 18 || formData.age > 100)) {
      errors.push('Age must be between 18 and 100');
    }
    
    return errors;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isStrongPassword(password: string): boolean {
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return strongRegex.test(password);
  }
}
```

## Troubleshooting

### Common Issues

1. **Modal not showing**: Check that `show` input is set to `true`
2. **Form data not updating**: Ensure `FormsModule` is imported
3. **Styling issues**: Verify Bootstrap CSS is loaded
4. **File upload not working**: Check `accept` attribute and file size limits
5. **Events not firing**: Verify event handlers are properly bound

### Dependencies

- Angular Common Module
- Angular Forms Module (for form handling)
- Bootstrap CSS (for styling)
- Bootstrap Icons (for close button icon)

### Performance Tips

- Use `OnPush` change detection for better performance
- Implement `trackBy` functions for dynamic field lists
- Avoid complex computations in templates
- Consider lazy loading for large modal content

### Accessibility

- Modal includes proper ARIA attributes
- Focus management for keyboard navigation
- Screen reader compatible
- High contrast support

```html
<!-- Enhanced accessibility -->
<app-modal 
  [show]="showModal"
  [config]="modalConfig"
  role="dialog"
  aria-labelledby="modal-title"
  aria-describedby="modal-body">
</app-modal>
```

This modal component provides a comprehensive solution for all modal needs in your Angular application, from simple confirmations to complex multi-step forms.
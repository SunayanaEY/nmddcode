import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  isSignUp = false;
  signInForm: FormGroup;
  signUpForm: FormGroup;
  selectedFile: File | null = null;
  selectedImagePreview: string | null = null;
  isDragOver = false;
  showPassword = false;
  showSignUpPassword = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService, 
    private router: Router,
    private toastr: ToastrService
  ) {
    this.signInForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.signUpForm = this.fb.group({
      instituteName: ['', [Validators.required, Validators.minLength(3)]],
      state: ['', Validators.required],
      district: ['', Validators.required],
      block: ['', Validators.required],
      contactPersonName: ['', [Validators.required, Validators.minLength(2)]],
      designation: ['', Validators.required],
      contactNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)]] 
    });
  }

  onSignIn() {
    if (this.signInForm.invalid) {
      this.markFormGroupTouched(this.signInForm);
      this.toastr.error('Please fill in all required fields correctly', 'Validation Error');
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    
    const { email, password } = this.signInForm.value;
    
    this.authService.login(email, password).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response && response.data) {
          this.toastr.success('Login successful!', 'Welcome');
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = 'Invalid email or password';
          this.toastr.error('Invalid email or password', 'Login Failed');
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Login failed. Please try again.';
        this.toastr.error('Login failed. Please check your credentials.', 'Error');
        console.error('Login error:', error);
      }
    });
  }

  onSignUp() {
    if (this.signUpForm.invalid) {
      this.markFormGroupTouched(this.signUpForm);
      this.toastr.error('Please fill in all required fields correctly', 'Validation Error');
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    
    // Handle sign-up logic here
    console.log('Sign Up:', this.signUpForm.value);
    if (this.selectedFile) {
      console.log('Selected file:', this.selectedFile.name);
    }
    
    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
      this.toastr.success('Account created successfully!', 'Success');
      this.isSignUp = false; // Switch to sign in form
    }, 2000);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (PNG, JPG, JPEG)');
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      this.selectedFile = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedImagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  triggerFileInput() {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput?.click();
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files[0]) {
      const file = files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (PNG, JPG, JPEG)');
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      this.selectedFile = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedImagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.selectedFile = null;
    this.selectedImagePreview = null;
    
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleSignUpPassword() {
    this.showSignUpPassword = !this.showSignUpPassword;
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}
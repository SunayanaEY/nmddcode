import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header.component';
import { FooterComponent } from './footer.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  registerForm: FormGroup;
  submitted = false;
  credentialdata = '';
  showPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private auth: AuthService, 
    private router: Router
  ) {
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  // Convenience getter for easy access to form fields
  get f() { 
    return this.registerForm.controls; 
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.submitted = true;
    this.credentialdata = '';

    // Stop if form is invalid
    if (this.registerForm.invalid) {
      return;
    }

    const email = this.registerForm.value.email;
    const password = this.registerForm.value.password;

    this.auth.login(email, password).subscribe(success => {
      if (success) {
        this.router.navigate(['/dashboard']);
      } else {
        this.credentialdata = 'Invalid credentials. Please try again.';
      }
    });
  }
}
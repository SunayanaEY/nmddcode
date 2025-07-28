import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
 ///TODO - 111
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
///TODO - 111
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Output() collapsedChange = new EventEmitter<boolean>();
  collapsed = false;
  
  userLoginArray: any = new Array()
  loginUserData: any = new Array()
  credentialdata: any
  count: any
  adminRole: boolean = false;
  // csvUploadTime: any;
  userLogin: any;
  showPassword: boolean = false;
  constructor(private formBuilder: FormBuilder, private router: Router, public authService: AuthService) { }
  registerForm: any = FormGroup;
  submitted = false;

  //Add user form actions
  get f() { return this.registerForm.controls; }
  
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleSidebar() {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  onSubmit() {
    this.submitted = true;
    if (this.registerForm.invalid) {
      return;
    }

    if (this.submitted) {
      this.userLogin = '';

      ///TODO - 111
      const username = this.registerForm.value.usename;
      const password = this.registerForm.value.password;
      
      if (this.authService.login(username, password)) {
        // For now, just navigate to dashboard since AuthService returns boolean
        this.router.navigateByUrl("/dashboard");
      } else {
        this.credentialdata = "The username or password you entered isn't correct."
      }



    }

  }

  ///TODO - 111
  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      usename: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
    });
  }
}

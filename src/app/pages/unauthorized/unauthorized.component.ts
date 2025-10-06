// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router } from '@angular/router';
// import { AuthService } from '../../services/auth.service';

// @Component({
//   selector: 'app-unauthorized',
//   standalone: true,
//   imports: [CommonModule],
//   template: `
//     <div class="unauthorized-container">
//       <!-- Government Header -->
//       <div class="gov-header">
//         <div class="emblem-container">
//           <img src="assets/login/emblem.png" alt="Government Emblem" class="gov-emblem">
//         </div>
//         <div class="gov-text">
//           <h1 class="gov-title">भारत सरकार | GOVERNMENT OF INDIA</h1>
//           <p class="dept-text">पशुपालन और डेयरी विभाग | DEPARTMENT OF ANIMAL HUSBANDRY AND DAIRYING</p>
//         </div>
//       </div>

//       <!-- Main Content -->
//       <div class="main-content">
//         <div class="unauthorized-content" [class.animate]="isAnimated">
//           <!-- Security Icon -->
//           <div class="security-icon">
//             <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//               <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 7C13.1 7 14 7.9 14 9C14 10.1 13.1 11 12 11C10.9 11 10 10.1 10 9C10 7.9 10.9 7 12 7ZM12 17C10.33 17 8.94 16.16 8.24 14.9C8.26 13.58 11 12.9 12 12.9C13 12.9 15.74 13.58 15.76 14.9C15.06 16.16 13.67 17 12 17Z" fill="#dc3545"/>
//             </svg>
//           </div>
          
//           <!-- Error Information -->
//           <div class="error-info">
//             <div class="error-code">403</div>
//             <h1 class="error-title">पहुंच निषेध | Access Denied</h1>
//             <p class="error-description">
//               आपके पास इस पृष्ठ तक पहुंचने की अनुमति नहीं है।<br>
//               You don't have permission to access this page.
//             </p>
//           </div>

//           <!-- Action Buttons -->
//           <div class="action-buttons">
//             <button class="btn btn-primary" (click)="goToDashboard()">
//               <i class="fas fa-home"></i>
//               डैशबोर्ड पर जाएं | Go to Dashboard
//             </button>
//             <button class="btn btn-secondary" (click)="logout()">
//               <i class="fas fa-sign-out-alt"></i>
//               लॉग आउट | Logout
//             </button>
//           </div>
//         </div>
//       </div>

//       <!-- Footer -->
//       <div class="gov-footer">
//         <p>राष्ट्रीय डेयरी विकास कार्यक्रम | National Dairy Development Programme</p>
//         <p class="version">Version 1.0 | Developed by Government of India</p>
//       </div>
//     </div>
//   `,
//   styles: [`
//     @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
//     @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');
    
//     .unauthorized-container {
//       min-height: 100vh;
//       background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
//       font-family: 'Inter', sans-serif;
//       display: flex;
//       flex-direction: column;
//       position: relative;
//       overflow-x: hidden;
//     }
    
//     .unauthorized-container::before {
//       content: '';
//       position: absolute;
//       top: 0;
//       left: 0;
//       right: 0;
//       bottom: 0;
//       background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="0.5" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>') repeat;
//       pointer-events: none;
//     }
    
//     /* Government Header */
//     .gov-header {
//       background: linear-gradient(90deg, #495057 0%, #6c757d 100%);
//       padding: 1rem 2rem;
//       display: flex;
//       align-items: center;
//       box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
//       position: relative;
//       z-index: 2;
//     }
    
//     .emblem-container {
//       margin-right: 1.5rem;
//       animation: fadeInLeft 1s ease-out;
//     }
    
//     .gov-emblem {
//       padding: 6px 6px;
//       background-color: #fff;
//       border-radius: 5px;
//       width: 40px;
//       height: 60px;
//       filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
//     }
    
//     .gov-text {
//       flex: 1;
//       animation: fadeInRight 1s ease-out 0.2s both;
//     }
    
//     .gov-title {
//       color: #ffffff;
//       font-size: 1.5rem;
//       font-weight: 700;
//       margin: 0;
//       text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
//       letter-spacing: 0.5px;
//     }
    
//     .dept-text {
//       color: #f8f9fa;
//       font-size: 0.9rem;
//       margin: 0.25rem 0 0 0;
//       font-weight: 400;
//       opacity: 0.9;
//     }
    
//     /* Main Content */
//     .main-content {
//       flex: 1;
//       display: flex;
//       justify-content: center;
//       align-items: center;
//       padding: 2rem;
//       position: relative;
//       z-index: 2;
//     }
    
//     .unauthorized-content {
//       background: rgba(255, 255, 255, 0.98);
//       backdrop-filter: blur(10px);
//       border-radius: 16px;
//       padding: 3rem 2.5rem;
//       text-align: center;
//       max-width: 600px;
//       width: 100%;
//       box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06), 0 4px 16px rgba(0, 0, 0, 0.04);
//       border: 1px solid rgba(0, 0, 0, 0.05);
//       transform: translateY(20px);
//       opacity: 0;
//       transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
//     }
    
//     .unauthorized-content.animate {
//       transform: translateY(0);
//       opacity: 1;
//     }
    
//     /* Security Icon */
//     .security-icon {
//       margin-bottom: 2rem;
//       animation: bounceIn 1s ease-out 0.5s both;
//     }
    
//     .security-icon svg {
//       filter: drop-shadow(0 4px 8px rgba(220, 53, 69, 0.3));
//       animation: pulse 2s infinite;
//     }
    
//     /* Error Information */
//     .error-info {
//       margin-bottom: 2.5rem;
//     }
    
//     .error-code {
//       font-size: 5rem;
//       font-weight: 800;
//       background: linear-gradient(135deg, #6c757d, #495057);
//       -webkit-background-clip: text;
//       -webkit-text-fill-color: transparent;
//       background-clip: text;
//       margin-bottom: 1rem;
//       text-shadow: 0 2px 4px rgba(108, 117, 125, 0.2);
//       animation: slideInDown 0.8s ease-out 0.3s both;
//     }
    
//     .error-title {
//       color: #2c3e50;
//       font-size: 1.8rem;
//       font-weight: 600;
//       margin-bottom: 1rem;
//       line-height: 1.3;
//       animation: slideInUp 0.8s ease-out 0.4s both;
//     }
    
//     .error-description {
//       color: #5a6c7d;
//       font-size: 1rem;
//       line-height: 1.6;
//       margin-bottom: 1.5rem;
//       animation: fadeIn 0.8s ease-out 0.5s both;
//     }
    
//     .security-notice {
//       background: linear-gradient(135deg, #f8f9fa, #e9ecef);
//       border: 1px solid #dee2e6;
//       border-radius: 10px;
//       padding: 0.75rem 1rem;
//       color: #495057;
//       font-size: 0.9rem;
//       display: flex;
//       align-items: center;
//       justify-content: center;
//       gap: 0.5rem;
//       animation: slideInUp 0.8s ease-out 0.6s both;
//     }
    
//     .security-notice i {
//       color: #6c757d;
//     }
    
//     /* Action Buttons */
//     .action-buttons {
//       display: flex;
//       gap: 1rem;
//       justify-content: center;
//       flex-wrap: wrap;
//       animation: slideInUp 0.8s ease-out 0.7s both;
//     }
    
//     .btn {
//       padding: 0.875rem 1.5rem;
//       border: none;
//       border-radius: 12px;
//       cursor: pointer;
//       font-weight: 600;
//       font-size: 0.95rem;
//       display: flex;
//       align-items: center;
//       gap: 0.5rem;
//       transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
//       position: relative;
//       overflow: hidden;
//       min-width: 180px;
//       justify-content: center;
//     }
    
//     .btn::before {
//       content: '';
//       position: absolute;
//       top: 0;
//       left: -100%;
//       width: 100%;
//       height: 100%;
//       background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
//       transition: left 0.5s;
//     }
    
//     .btn:hover::before {
//       left: 100%;
//     }
    
//     .btn-primary {
//       background: linear-gradient(135deg, #495057, #343a40);
//       color: white;
//       box-shadow: 0 4px 15px rgba(73, 80, 87, 0.2);
//     }
    
//     .btn-primary:hover {
//       transform: translateY(-2px);
//       box-shadow: 0 8px 25px rgba(73, 80, 87, 0.3);
//     }
    
//     .btn-secondary {
//       background: linear-gradient(135deg, #adb5bd, #868e96);
//       color: white;
//       box-shadow: 0 4px 15px rgba(173, 181, 189, 0.2);
//     }
    
//     .btn-secondary:hover {
//       transform: translateY(-2px);
//       box-shadow: 0 8px 25px rgba(173, 181, 189, 0.3);
//     }
    
//     .btn:active {
//       transform: translateY(0);
//     }
    
//     /* Government Footer */
//     .gov-footer {
//       background: rgba(73, 80, 87, 0.95);
//       backdrop-filter: blur(10px);
//       padding: 1rem 2rem;
//       text-align: center;
//       color: #f8f9fa;
//       border-top: 1px solid rgba(255, 255, 255, 0.1);
//       position: relative;
//       z-index: 2;
//     }
    
//     .gov-footer p {
//       margin: 0.25rem 0;
//       font-size: 0.9rem;
//     }
    
//     .version {
//       opacity: 0.8;
//       font-size: 0.8rem !important;
//     }
    
//     /* Animations */
//     @keyframes fadeInLeft {
//       from {
//         opacity: 0;
//         transform: translateX(-30px);
//       }
//       to {
//         opacity: 1;
//         transform: translateX(0);
//       }
//     }
    
//     @keyframes fadeInRight {
//       from {
//         opacity: 0;
//         transform: translateX(30px);
//       }
//       to {
//         opacity: 1;
//         transform: translateX(0);
//       }
//     }
    
//     @keyframes slideInDown {
//       from {
//         opacity: 0;
//         transform: translateY(-30px);
//       }
//       to {
//         opacity: 1;
//         transform: translateY(0);
//       }
//     }
    
//     @keyframes slideInUp {
//       from {
//         opacity: 0;
//         transform: translateY(30px);
//       }
//       to {
//         opacity: 1;
//         transform: translateY(0);
//       }
//     }
    
//     @keyframes fadeIn {
//       from {
//         opacity: 0;
//       }
//       to {
//         opacity: 1;
//       }
//     }
    
//     @keyframes bounceIn {
//       0% {
//         opacity: 0;
//         transform: scale(0.3);
//       }
//       50% {
//         opacity: 1;
//         transform: scale(1.05);
//       }
//       70% {
//         transform: scale(0.9);
//       }
//       100% {
//         opacity: 1;
//         transform: scale(1);
//       }
//     }
    
//     @keyframes pulse {
//       0% {
//         transform: scale(1);
//       }
//       50% {
//         transform: scale(1.05);
//       }
//       100% {
//         transform: scale(1);
//       }
//     }
    
//     /* Responsive Design */
//     @media (max-width: 768px) {
//       .gov-header {
//         flex-direction: column;
//         text-align: center;
//         padding: 1rem;
//       }
      
//       .emblem-container {
//         margin-right: 0;
//         margin-bottom: 1rem;
//       }
      
//       .gov-title {
//         font-size: 1.2rem;
//       }
      
//       .dept-text {
//         font-size: 0.8rem;
//       }
      
//       .unauthorized-content {
//         margin: 1rem;
//         padding: 2rem 1.5rem;
//       }
      
//       .error-code {
//         font-size: 3.5rem;
//       }
      
//       .error-title {
//         font-size: 1.4rem;
//       }
      
//       .action-buttons {
//         flex-direction: column;
//         align-items: center;
//       }
      
//       .btn {
//         width: 100%;
//         max-width: 280px;
//       }
//     }
//   `]
// })export class UnauthorizedComponent implements OnInit {
//   isAnimated = false;

//   constructor(
//     private router: Router,
//     private authService: AuthService
//   ) {}

//   ngOnInit(): void {
//     // Trigger animation after component initialization
//     setTimeout(() => {
//       this.isAnimated = true;
//     }, 100);
//   }

//   goToDashboard(): void {
//     const userRole = this.authService.getUserRole();
//     if (userRole) {
//       switch (userRole) {
//         case 1: // Central Admin
//         case 3: // Training Institute Head
//           this.router.navigate(['/admin/training-module']);
//           break;
//         case 2: // Data Entry Operator 
//           this.router.navigate(['/admin/manual-training-upload']);
//           break;
//         default:
//           this.router.navigate(['/admin']);
//       }
//     } else {
//       this.router.navigate(['/admin']);
//     }
//   }

//   logout(): void {
//     this.authService.logout();
//     this.router.navigate(['/login']);
//   }
// }

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="unauthorized-container">
      <!-- Government Header -->
      <div class="gov-header">
        <div class="emblem-container">
          <img src="assets/login/emblem.png" alt="Government Emblem" class="gov-emblem">
        </div>
        <div class="gov-text">
          <h1 class="gov-title">भारत सरकार | GOVERNMENT OF INDIA</h1>
          <p class="dept-text">पशुपालन और डेयरी विभाग | DEPARTMENT OF ANIMAL HUSBANDRY AND DAIRYING</p>
        </div>
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <div class="unauthorized-content" [class.animate]="isAnimated">
          <!-- Security Icon -->
          <div class="security-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 7C13.1 7 14 7.9 14 9C14 10.1 13.1 11 12 11C10.9 11 10 10.1 10 9C10 7.9 10.9 7 12 7ZM12 17C10.33 17 8.94 16.16 8.24 14.9C8.26 13.58 11 12.9 12 12.9C13 12.9 15.74 13.58 15.76 14.9C15.06 16.16 13.67 17 12 17Z" fill="#dc3545"/>
            </svg>
          </div>
          
          <!-- Error Information -->
          <div class="error-info">
            <div class="error-code">403</div>
            <h1 class="error-title">पहुंच निषेध | Access Denied</h1>
            <p class="error-description">
              आपके पास इस पृष्ठ तक पहुंचने की अनुमति नहीं है।<br>
              You don't have permission to access this page.
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="action-buttons">
            <button class="btn btn-primary" (click)="goToDashboard()">
              <i class="fas fa-home"></i>
              डैशबोर्ड पर जाएं | Go to Dashboard
            </button>
            <button class="btn btn-secondary" (click)="logout()">
              <i class="fas fa-sign-out-alt"></i>
              लॉग आउट | Logout
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="gov-footer">
        <p>राष्ट्रीय डेयरी विकास कार्यक्रम | National Dairy Development Programme</p>
        <p class="version">Version 1.0 | Developed by Government of India</p>
      </div>
    </div>
  `,
  styles: [`
    /* Removed the Google Fonts import line from here */
    
    .unauthorized-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow-x: hidden;
    }
    
    .unauthorized-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="0.5" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>') repeat;
      pointer-events: none;
    }
    
    /* Government Header */
    .gov-header {
      background: linear-gradient(90deg, #495057 0%, #6c757d 100%);
      padding: 1rem 2rem;
      display: flex;
      align-items: center;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      position: relative;
      z-index: 2;
    }
    
    .emblem-container {
      margin-right: 1.5rem;
      animation: fadeInLeft 1s ease-out;
    }
    
    .gov-emblem {
      padding: 6px 6px;
      background-color: #fff;
      border-radius: 5px;
      width: 40px;
      height: 60px;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    }
    
    .gov-text {
      flex: 1;
      animation: fadeInRight 1s ease-out 0.2s both;
    }
    
    .gov-title {
      color: #ffffff;
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      letter-spacing: 0.5px;
    }
    
    .dept-text {
      color: #f8f9fa;
      font-size: 0.9rem;
      margin: 0.25rem 0 0 0;
      font-weight: 400;
      opacity: 0.9;
    }
    
    /* Main Content */
    .main-content {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem;
      position: relative;
      z-index: 2;
    }
    
    .unauthorized-content {
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 3rem 2.5rem;
      text-align: center;
      max-width: 600px;
      width: 100%;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06), 0 4px 16px rgba(0, 0, 0, 0.04);
      border: 1px solid rgba(0, 0, 0, 0.05);
      transform: translateY(20px);
      opacity: 0;
      transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .unauthorized-content.animate {
      transform: translateY(0);
      opacity: 1;
    }
    
    /* Security Icon */
    .security-icon {
      margin-bottom: 2rem;
      animation: bounceIn 1s ease-out 0.5s both;
    }
    
    .security-icon svg {
      filter: drop-shadow(0 4px 8px rgba(220, 53, 69, 0.3));
      animation: pulse 2s infinite;
    }
    
    /* Error Information */
    .error-info {
      margin-bottom: 2.5rem;
    }
    
    .error-code {
      font-size: 5rem;
      font-weight: 800;
      background: linear-gradient(135deg, #6c757d, #495057);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 1rem;
      text-shadow: 0 2px 4px rgba(108, 117, 125, 0.2);
      animation: slideInDown 0.8s ease-out 0.3s both;
    }
    
    .error-title {
      color: #2c3e50;
      font-size: 1.8rem;
      font-weight: 600;
      margin-bottom: 1rem;
      line-height: 1.3;
      animation: slideInUp 0.8s ease-out 0.4s both;
    }
    
    .error-description {
      color: #5a6c7d;
      font-size: 1rem;
      line-height: 1.6;
      margin-bottom: 1.5rem;
      animation: fadeIn 0.8s ease-out 0.5s both;
    }
    
    .security-notice {
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      border: 1px solid #dee2e6;
      border-radius: 10px;
      padding: 0.75rem 1rem;
      color: #495057;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      animation: slideInUp 0.8s ease-out 0.6s both;
    }
    
    .security-notice i {
      color: #6c757d;
    }
    
    /* Action Buttons */
    .action-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
      animation: slideInUp 0.8s ease-out 0.7s both;
    }
    
    .btn {
      padding: 0.875rem 1.5rem;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.95rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      min-width: 180px;
      justify-content: center;
    }
    
    .btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s;
    }
    
    .btn:hover::before {
      left: 100%;
    }
    
    .btn-primary {
      background: linear-gradient(135deg, #495057, #343a40);
      color: white;
      box-shadow: 0 4px 15px rgba(73, 80, 87, 0.2);
    }
    
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(73, 80, 87, 0.3);
    }
    
    .btn-secondary {
      background: linear-gradient(135deg, #adb5bd, #868e96);
      color: white;
      box-shadow: 0 4px 15px rgba(173, 181, 189, 0.2);
    }
    
    .btn-secondary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(173, 181, 189, 0.3);
    }
    
    .btn:active {
      transform: translateY(0);
    }
    
    /* Government Footer */
    .gov-footer {
      background: rgba(73, 80, 87, 0.95);
      backdrop-filter: blur(10px);
      padding: 1rem 2rem;
      text-align: center;
      color: #f8f9fa;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      position: relative;
      z-index: 2;
    }
    
    .gov-footer p {
      margin: 0.25rem 0;
      font-size: 0.9rem;
    }
    
    .version {
      opacity: 0.8;
      font-size: 0.8rem !important;
    }
    
    /* Animations */
    @keyframes fadeInLeft {
      from {
        opacity: 0;
        transform: translateX(-30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    @keyframes fadeInRight {
      from {
        opacity: 0;
        transform: translateX(30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    @keyframes slideInDown {
      from {
        opacity: 0;
        transform: translateY(-30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    
    @keyframes bounceIn {
      0% {
        opacity: 0;
        transform: scale(0.3);
      }
      50% {
        opacity: 1;
        transform: scale(1.05);
      }
      70% {
        transform: scale(0.9);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }
    
    @keyframes pulse {
      0% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.05);
      }
      100% {
        transform: scale(1);
      }
    }
    
    /* Responsive Design */
    @media (max-width: 768px) {
      .gov-header {
        flex-direction: column;
        text-align: center;
        padding: 1rem;
      }
      
      .emblem-container {
        margin-right: 0;
        margin-bottom: 1rem;
      }
      
      .gov-title {
        font-size: 1.2rem;
      }
      
      .dept-text {
        font-size: 0.8rem;
      }
      
      .unauthorized-content {
        margin: 1rem;
        padding: 2rem 1.5rem;
      }
      
      .error-code {
        font-size: 3.5rem;
      }
      
      .error-title {
        font-size: 1.4rem;
      }
      
      .action-buttons {
        flex-direction: column;
        align-items: center;
      }
      
      .btn {
        width: 100%;
        max-width: 280px;
      }
    }
  `]
})export class UnauthorizedComponent implements OnInit {
  isAnimated = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Trigger animation after component initialization
    setTimeout(() => {
      this.isAnimated = true;
    }, 100);
  }

  goToDashboard(): void {
    const userRole = this.authService.getUserRole();
    if (userRole) {
      switch (userRole) {
        case 1: // Central Admin
        case 3: // Training Institute Head
          this.router.navigate(['/admin/training-module']);
          break;
        case 2: // Data Entry Operator 
          this.router.navigate(['/admin/manual-training-upload']);
          break;
        default:
          this.router.navigate(['/admin']);
      }
    } else {
      this.router.navigate(['/admin']);
    }
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        console.log('Manual logout completed from unauthorized page');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Navigate to login even if logout API fails
        this.router.navigate(['/login']);
      }
    });
  }
}
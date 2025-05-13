import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private user: { name: string; avatarUrl?: string } | null = null;

  login(username: string, password: string): boolean {
    // Only allow hardcoded credentials
    if (username === 'admin@gmail.com' && password === 'password@12') {
      this.user = {
        name: 'Admin User',
        avatarUrl: undefined // You can set a default avatar URL here
      };
      return true;
    }
    return false;
  }

  logout() {
    this.user = null;
  }

  getUser() {
    return this.user;
  }

  isLoggedIn() {
    return !!this.user;
  }
} 
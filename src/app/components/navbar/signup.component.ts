import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../Services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page">
      <div class="auth-container">
        <div class="auth-header">
          <h1 class="auth-title">Create Account</h1>
          <p class="auth-subtitle">Sign up to get started with Task Manager</p>
        </div>
        
        <form (ngSubmit)="onSignup()" class="auth-form">
          <div class="form-group">
            <label for="name">Full Name</label>
            <div class="input-with-icon">
              <i class="input-icon">👤</i>
              <input 
                type="text" 
                id="name"
                class="form-control" 
                [(ngModel)]="name" 
                name="name" 
                placeholder="Your full name" 
                required
              >
            </div>
          </div>
          
          <div class="form-group">
            <label for="email">Email</label>
            <div class="input-with-icon">
              <i class="input-icon">✉️</i>
              <input 
                type="email" 
                id="email"
                class="form-control" 
                [(ngModel)]="email" 
                name="email" 
                placeholder="your@email.com" 
                required
              >
            </div>
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <div class="input-with-icon">
              <i class="input-icon">🔒</i>
              <input 
                [type]="showPassword ? 'text' : 'password'" 
                id="password"
                class="form-control" 
                [(ngModel)]="password" 
                name="password" 
                placeholder="Create a password" 
                required
              >
              <button 
                type="button" 
                class="password-toggle" 
                (click)="togglePasswordVisibility()"
              >
                {{ showPassword ? '👁️' : '👁️‍🗨️' }}
              </button>
            </div>
          </div>
          
          <div class="form-group">
            <label for="role">Account Type</label>
            <div class="input-with-icon">
              <i class="input-icon">🔑</i>
              <select 
                id="role"
                class="form-control" 
                [(ngModel)]="role" 
                name="role" 
                required
              >
                <option value="USER">Regular User</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>
          </div>
          
          <div *ngIf="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          
          <button type="submit" class="btn btn-primary btn-block" [disabled]="isLoading">
            {{ isLoading ? 'Creating account...' : 'Create Account' }}
          </button>
        </form>
        
        <div class="auth-footer">
          <p>Already have an account? <a routerLink="/login" class="auth-link">Log in</a></p>
        </div>
      </div>
    </div>
  `
})
export class SignupComponent {
  name = '';
  email = '';
  password = '';
  role: 'USER' | 'ADMIN' = 'USER';
  errorMessage = '';
  isLoading = false;
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSignup() {
    if (!this.name || !this.email || !this.password) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    
    const signupPayload = {
      name: this.name,
      email: this.email,
      password: this.password,
      role: this.role
    };

    this.authService.signup(signupPayload)
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/login'], { 
            queryParams: { registered: 'success' } 
          });
        },
        error: (error) => {
          console.error('Signup failed', error);
          this.errorMessage = error.status === 409 
            ? 'Email already in use' 
            : 'An error occurred. Please try again.';
          this.isLoading = false;
        }
      });
  }
}
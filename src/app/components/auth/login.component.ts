import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../Services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page">
      <div class="auth-container">
        <div class="auth-header">
          <h1 class="auth-title">Welcome Back</h1>
          <p class="auth-subtitle">Log in to your account to continue</p>
        </div>
        
        <div *ngIf="successMessage" class="success-message">
          {{ successMessage }}
        </div>
        
        <form (ngSubmit)="onLogin()" class="auth-form">
          <div class="form-group">
            <label for="email">Email</label>
            <div class="input-with-icon">
              <i class="input-icon"></i>
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
              <i class="input-icon"></i>
              <input 
                [type]="showPassword ? 'text' : 'password'" 
                id="password"
                class="form-control" 
                [(ngModel)]="password" 
                name="password" 
                placeholder="Your password" 
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
          
          <div *ngIf="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          
          <button type="submit" class="btn btn-primary btn-block" [disabled]="isLoading">
            {{ isLoading ? 'Logging in...' : 'Log In' }}
          </button>
        </form>
        
        <div class="auth-footer">
          <p>Don't have an account? <a routerLink="/signup" class="auth-link">Sign up</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .success-message {
      background-color: rgba(0, 255, 157, 0.1);
      color: var(--completed);
      padding: var(--spacing-md);
      border-radius: var(--radius-md);
      margin-bottom: var(--spacing-lg);
      text-align: center;
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Check for registration success message
    this.route.queryParams.subscribe(params => {
      if (params['registered'] === 'success') {
        this.successMessage = 'Registration successful! Please log in.';
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onLogin() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password';
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    
    this.authService.login(this.email, this.password)
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/tasks']);
        },
        error: (error) => {
          console.error('Login failed', error);
          this.errorMessage = 'Invalid email or password';
          this.isLoading = false;
        }
      });
  }
}
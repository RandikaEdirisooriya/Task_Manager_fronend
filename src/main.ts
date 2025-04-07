import { Component, NgModule } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouterModule, Routes, Router } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { importProvidersFrom } from '@angular/core';

// Models
interface User {
  id?: number;
  name: string;
  email: string;
  password: string;
  role: 'USER' | 'ADMIN';
}

interface Task {
  id?: number;
  title: string;
  description: string;
  status: 'PENDING' | 'COMPLETED';
  createdAt: Date;
}

// Components
@Component({
  selector: 'app-navbar',
  template: `
    <nav class="navbar">
      <div class="nav-brand">Task Manager</div>
      <div class="nav-search">
        <input 
          type="text" 
          class="search-input" 
          placeholder="Search tasks..."
          [(ngModel)]="searchQuery"
          (input)="onSearch()"
        >
      </div>
      <div class="nav-actions">
        <button class="btn-icon" (click)="showUserManagement = true">
         <i class="fas fa-user"></i>
        </button>
      </div>
    </nav>

    <!-- User Management Modal -->
    <div class="modal" *ngIf="showUserManagement">
      <div class="modal-content">
        <h2>User Management</h2>
        <div class="user-list">
          <div *ngFor="let user of users" class="user-item">
            <div>
              <strong>{{user.name}}</strong>
              <p>{{user.email}} - {{user.role}}</p>
            </div>
            <button class="btn btn-primary" (click)="editUser(user)">Edit</button>
          </div>
        </div>
        <button class="btn btn-primary" (click)="showUserManagement = false">Close</button>
      </div>
    </div>

    <!-- Edit User Modal -->
    <div class="modal" *ngIf="selectedUser">
      <div class="modal-content">
        <h2>Edit User</h2>
        <form (ngSubmit)="updateUser()">
          <div class="form-group">
            <input type="text" class="form-control" [(ngModel)]="selectedUser.name" name="name" placeholder="Name">
          </div>
          <div class="form-group">
            <input type="email" class="form-control" [(ngModel)]="selectedUser.email" name="email" placeholder="Email">
          </div>
          <div class="form-group">
            <select class="form-control" [(ngModel)]="selectedUser.role" name="role">
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="submit" class="btn btn-primary">Save</button>
            <button type="button" class="btn btn-primary" (click)="selectedUser = null">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule, FormsModule]
})
class NavbarComponent {
  searchQuery = '';
  showUserManagement = false;
  selectedUser: User | null = null;
  users: User[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com', password: '', role: 'USER' },
    { id: 2, name: 'Admin User', email: 'admin@example.com', password: '', role: 'ADMIN' }
  ];

  onSearch() {
    // Implement search logic
    console.log('Searching:', this.searchQuery);
  }

  editUser(user: User) {
    this.selectedUser = { ...user };
  }

  updateUser() {
    if (this.selectedUser) {
      const index = this.users.findIndex(u => u.id === this.selectedUser!.id);
      if (index !== -1) {
        this.users[index] = { ...this.selectedUser };
      }
      this.selectedUser = null;
    }
  }
}

@Component({
  selector: 'app-login',
  template: `
    <div class="container">
      <div class="form-container">
        <h2>Login</h2>
        <form (ngSubmit)="onLogin()">
          <div class="form-group">
            <input type="email" class="form-control" [(ngModel)]="email" name="email" placeholder="Email" required>
          </div>
          <div class="form-group">
            <input type="password" class="form-control" [(ngModel)]="password" name="password" placeholder="Password" required>
          </div>
          <button type="submit" class="btn btn-primary">Login</button>
        </form>
        <p>Don't have an account? <a routerLink="/signup">Sign up</a></p>
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
class LoginComponent {
  email = '';
  password = '';

  constructor(private router: Router) {}

  onLogin() {
    if (this.email && this.password) {
      this.router.navigate(['/tasks']);
    }
  }
}

@Component({
  selector: 'app-signup',
  template: `
    <div class="container">
      <div class="form-container">
        <h2>Sign Up</h2>
        <form (ngSubmit)="onSignup()">
          <div class="form-group">
            <input type="text" class="form-control" [(ngModel)]="name" name="name" placeholder="Name" required>
          </div>
          <div class="form-group">
            <input type="email" class="form-control" [(ngModel)]="email" name="email" placeholder="Email" required>
          </div>
          <div class="form-group">
            <input type="password" class="form-control" [(ngModel)]="password" name="password" placeholder="Password" required>
          </div>
          <div class="form-group">
            <select class="form-control" [(ngModel)]="role" name="role" required>
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary">Sign Up</button>
        </form>
        <p>Already have an account? <a routerLink="/login">Login</a></p>
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
class SignupComponent {
  name = '';
  email = '';
  password = '';
  role: 'USER' | 'ADMIN' = 'USER';

  constructor(private router: Router) {}

  onSignup() {
    if (this.name && this.email && this.password) {
      this.router.navigate(['/tasks']);
    }
  }
}


@Component({
  selector: 'app-root',
  template: `
    <router-outlet></router-outlet>
  `,
  standalone: true,
  imports: [RouterModule]
})
class App {
  name = 'Task Manager';
}

// Routes
const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },

];

bootstrapApplication(App, {
  providers: [
    importProvidersFrom(RouterModule.forRoot(routes)),
  ]
}).catch(err => console.error(err));
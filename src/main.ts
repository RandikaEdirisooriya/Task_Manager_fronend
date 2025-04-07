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
  selector: 'app-tasks',
  template: `
    <app-navbar></app-navbar>
    <div class="container">
  
      
      <!-- Add Task Form -->
      <div class="form-container">
        <h3>Add New Task</h3>
        <form (ngSubmit)="onAddTask()">
          <div class="form-group">
            <input type="text" class="form-control" [(ngModel)]="newTask.title" name="title" placeholder="Title" required>
          </div>
          <div class="form-group">
            <textarea class="form-control" [(ngModel)]="newTask.description" name="description" placeholder="Description" required></textarea>
          </div>
          <button type="submit" class="btn btn-primary">Add Task</button>
        </form>
      </div>

      <!-- Task List -->
      <div class="task-list">
        <div *ngFor="let task of tasks" class="task-card">
          <h3>{{task.title}}</h3>
          <p>{{task.description}}</p>
          <div class="task-meta">
            <span class="status-badge" [ngClass]="{'status-pending': task.status === 'PENDING', 'status-completed': task.status === 'COMPLETED'}">
              {{task.status}}
            </span>
            <span>Created: {{task.createdAt | date}}</span>
          </div>
          <div class="task-actions">
            <button class="btn btn-primary" (click)="editTask(task)">Edit</button>
            <button class="btn btn-primary" (click)="toggleStatus(task)">Toggle Status</button>
            <button class="btn btn-primary" (click)="deleteTask(task)">Delete</button>
          </div>
        </div>
      </div>

      <!-- Edit Task Modal -->
      <div class="modal" *ngIf="selectedTask">
        <div class="modal-content">
          <h2>Edit Task</h2>
          <form (ngSubmit)="updateTask()">
            <div class="form-group">
              <input type="text" class="form-control" [(ngModel)]="selectedTask.title" name="title" placeholder="Title" required>
            </div>
            <div class="form-group">
              <textarea class="form-control" [(ngModel)]="selectedTask.description" name="description" placeholder="Description" required></textarea>
            </div>
            <div class="form-group">
              <select class="form-control" [(ngModel)]="selectedTask.status" name="status">
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <div class="modal-actions">
              <button type="submit" class="btn btn-primary">Save</button>
              <button type="button" class="btn btn-primary" (click)="selectedTask = null">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent]
})
class TasksComponent {
  tasks: Task[] = [];
  newTask: Partial<Task> = {
    title: '',
    description: '',
    status: 'PENDING',
  };
  selectedTask: Task | null = null;

  onAddTask() {
    if (this.newTask.title && this.newTask.description) {
      const task: Task = {
        ...this.newTask as Task,
        createdAt: new Date(),
      };
      this.tasks.push(task);
      this.newTask = {
        title: '',
        description: '',
        status: 'PENDING',
      };
    }
  }

  editTask(task: Task) {
    this.selectedTask = { ...task };
  }

  updateTask() {
    if (this.selectedTask) {
      const index = this.tasks.findIndex(t => t === this.selectedTask);
      if (index !== -1) {
        this.tasks[index] = { ...this.selectedTask };
      }
      this.selectedTask = null;
    }
  }

  toggleStatus(task: Task) {
    task.status = task.status === 'PENDING' ? 'COMPLETED' : 'PENDING';
  }

  deleteTask(task: Task) {
    this.tasks = this.tasks.filter(t => t !== task);
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
  { path: 'tasks', component: TasksComponent },
];

bootstrapApplication(App, {
  providers: [
    importProvidersFrom(RouterModule.forRoot(routes)),
  ]
}).catch(err => console.error(err));
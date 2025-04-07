import { Component, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouterModule, Routes, Router } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule

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
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule] // Import HttpClientModule here as well
})
class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';

  constructor(private http: HttpClient, private router: Router) {}

  onLogin() {
    const loginPayload = {
      email: this.email,
      password: this.password
    };

    this.http.post<any>('http://localhost:8080/api/v1/auth/signin', loginPayload).subscribe({
      next: (response) => {
        // Save token if backend returns one
        if (response && response.token) {
          localStorage.setItem('authToken', response.token);
        }
        console.log('Login successful', response);
        // this.router.navigate(['/tasks']);
      },
      error: (error) => {
        console.error('Login failed', error);
        this.errorMessage = 'Invalid email or password';
      }
    });
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
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule]
})
class SignupComponent {
  name = '';
  email = '';
  password = '';
  role: 'USER' | 'ADMIN' = 'USER';
  errorMessage = '';

  constructor(private http: HttpClient, private router: Router) {}

  onSignup() {
    const signupPayload = {
      email: this.email,
      name: this.name,
      password: this.password,
      role: this.role
    };

    this.http.post<any>('http://localhost:8080/api/v1/auth/signup', signupPayload).subscribe({ // Corrected URL
      next: (response) => {
        console.log('Signup successful', response);
        this.router.navigate(['/tasks']); // Redirect after successful signup
      },
      error: (error) => {
        console.error('Signup failed', error);
        this.errorMessage = 'Signup failed. Please try again.';
        // Optionally display the error message to the user
      }
    });
  }
}

@Component({
  selector: 'app-tasks',
  template: `
    <app-navbar></app-navbar>
    <div class="container">


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
    importProvidersFrom(HttpClientModule), // Provide HttpClientModule here
  ]
}).catch(err => console.error(err));
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { AuthService } from '../../Services/auth.service';
import { TaskService } from '../../Services/task.service';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <div class="task-page">
      <app-navbar (search)="filterTasks($event)"></app-navbar>
      
      <div class="container">
        <div class="dashboard-header">
          <h1>Your Tasks</h1>
          <div class="task-stats">
            <div class="stat-card">
              <span class="stat-value">{{ tasks.length }}</span>
              <span class="stat-label">Total Tasks</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">{{ getPendingTasksCount() }}</span>
              <span class="stat-label">Pending</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">{{ getCompletedTasksCount() }}</span>
              <span class="stat-label">Completed</span>
            </div>
          </div>
        </div>

        <div class="task-container">
          <div class="task-form-container">
            <h2>Add New Task</h2>
            <form (ngSubmit)="onAddTask()" class="task-form">
              <div class="form-group">
                <label for="title">Title</label>
                <input 
                  type="text" 
                  id="title"
                  class="form-control" 
                  [(ngModel)]="newTask.title" 
                  name="title" 
                  placeholder="Task title" 
                  required
                >
              </div>
              <div class="form-group">
                <label for="description">Description</label>
                <textarea 
                  id="description"
                  class="form-control" 
                  [(ngModel)]="newTask.description" 
                  name="description" 
                  placeholder="Task description" 
                  required
                ></textarea>
              </div>
              <button type="submit" class="btn btn-primary btn-block">
                <i class="icon">➕</i> Add Task
              </button>
            </form>
          </div>

          <div class="task-list-container">
            <div class="task-list-header">
              <h2>{{ searchQuery ? 'Search Results' : 'All Tasks' }}</h2>
              <div class="task-filters">
                <button 
                  class="filter-btn" 
                  [class.active]="activeFilter === 'all'"
                  (click)="setFilter('all')"
                >
                  All
                </button>
                <button 
                  class="filter-btn" 
                  [class.active]="activeFilter === 'pending'"
                  (click)="setFilter('pending')"
                >
                  Pending
                </button>
                <button 
                  class="filter-btn" 
                  [class.active]="activeFilter === 'completed'"
                  (click)="setFilter('completed')"
                >
                  Completed
                </button>
              </div>
            </div>

            <div class="task-list">
              <div *ngIf="filteredTasks.length === 0" class="no-tasks">
                <p>No tasks found. {{ searchQuery ? 'Try a different search term.' : 'Add a new task to get started!' }}</p>
              </div>

              <div *ngFor="let task of filteredTasks; let i = index" class="task-card" [class.completed]="task.status === 'COMPLETED'">
                <div class="task-header">
                  <h3 class="task-title">{{ task.title }}</h3>
                  <div class="task-actions">
                    <button class="action-btn edit-btn" (click)="editTask(task)" title="Edit">
                      <i class="icon">✏️</i>
                    </button>
                    <button class="action-btn delete-btn" (click)="deleteTask(task.id!)" title="Delete">
                      <i class="icon">🗑️</i>
                    </button>
                  </div>
                </div>
                
                <p class="task-description">{{ task.description }}</p>
                
                <div class="task-footer">
                  <div class="task-meta">
                    <span class="task-id">ID: {{ task.id }}</span>
                    <span class="task-date">{{ task.createdAt | date:'medium' }}</span>
                  </div>
                  
                  <div class="task-status">
                    <span 
                      class="status-badge" 
                      [ngClass]="{'status-pending': task.status === 'PENDING', 'status-completed': task.status === 'COMPLETED'}"
                    >
                      {{ task.status }}
                    </span>
                    <button 
                      class="toggle-status-btn" 
                      (click)="toggleStatus(task)"
                      [title]="task.status === 'PENDING' ? 'Mark as Completed' : 'Mark as Pending'"
                    >
                      {{ task.status === 'PENDING' ? 'Complete' : 'Reopen' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-overlay" *ngIf="selectedTask" (click)="closeModal($event)">
        <div class="modal-container">
          <div class="modal-header">
            <h2>Edit Task</h2>
            <button class="close-button" (click)="selectedTask = null">✕</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="updateTask()">
              <div class="form-group">
                <label for="edit-title">Title</label>
                <input 
                  type="text" 
                  id="edit-title"
                  class="form-control" 
                  [(ngModel)]="selectedTask.title" 
                  name="title" 
                  required
                >
              </div>
              <div class="form-group">
                <label for="edit-description">Description</label>
                <textarea 
                  id="edit-description"
                  class="form-control" 
                  [(ngModel)]="selectedTask.description" 
                  name="description" 
                  required
                ></textarea>
              </div>
              <div class="form-group">
                <label for="edit-status">Status</label>
                <select 
                  id="edit-status"
                  class="form-control" 
                  [(ngModel)]="selectedTask.status" 
                  name="status"
                >
                  <option value="PENDING">Pending</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn btn-outline" (click)="selectedTask = null">Cancel</button>
                <button type="submit" class="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TasksComponent implements OnInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  newTask: Partial<Task> = {
    title: '',
    description: '',
    status: 'PENDING',
  };
  selectedTask: Task | null = null;
  searchQuery: string = '';
  activeFilter: 'all' | 'pending' | 'completed' = 'all';
  isLoading = false;

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.loadTasks();
  }

  loadTasks() {
    this.isLoading = true;
    this.taskService.getAllTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.isLoading = false;
      }
    });
  }

  filterTasks(query: string) {
    this.searchQuery = query;
    this.applyFilters();
  }

  setFilter(filter: 'all' | 'pending' | 'completed') {
    this.activeFilter = filter;
    this.applyFilters();
  }

  applyFilters() {
    // First apply search filter
    let result = this.tasks;
    
    if (this.searchQuery) {
      const searchId = parseInt(this.searchQuery, 10);
      if (!isNaN(searchId)) {
        result = result.filter(task => task.id === searchId);
      } else {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(task =>
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query)
        );
      }
    }
    
    // Then apply status filter
    if (this.activeFilter !== 'all') {
      const status = this.activeFilter.toUpperCase() as 'PENDING' | 'COMPLETED';
      result = result.filter(task => task.status === status);
    }
    
    this.filteredTasks = result;
  }

  getPendingTasksCount() {
    return this.tasks.filter(task => task.status === 'PENDING').length;
  }

  getCompletedTasksCount() {
    return this.tasks.filter(task => task.status === 'COMPLETED').length;
  }

  onAddTask() {
    if (!this.newTask.title || !this.newTask.description) {
      return;
    }
    
    const now = new Date();
    const taskData = {
      title: this.newTask.title,
      description: this.newTask.description,
      status: 'PENDING',
      createdAt: now.toISOString()
    };

    this.taskService.createTask(taskData).subscribe({
      next: () => {
        this.newTask = { title: '', description: '', status: 'PENDING' };
        this.loadTasks();
      },
      error: (error) => {
        console.error('Error adding task:', error);
      }
    });
  }

  editTask(task: Task) {
    this.selectedTask = { ...task };
    this.loadTasks();
  }

  updateTask() {
    if (!this.selectedTask) return;
    
    this.taskService.updateTask(this.selectedTask).subscribe({
      next: () => {
        this.selectedTask = null;
        this.loadTasks();
      },
      error: (error) => {
        console.error('Error updating task:', error);
      }
    });
  }

  toggleStatus(task: Task) {
    this.taskService.toggleTaskStatus(task).subscribe({
      next: () => {
        this.loadTasks();
      },
      error: (error) => {
        console.error('Error toggling task status:', error);
      }
    });
  }

  deleteTask(taskId: number) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(taskId).subscribe({
        next: () => {
          this.loadTasks();
        },
        error: (error) => {
          console.error('Error deleting task:', error);
        }
      });
    }
  }

  closeModal(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.selectedTask = null;
    }
  }
}


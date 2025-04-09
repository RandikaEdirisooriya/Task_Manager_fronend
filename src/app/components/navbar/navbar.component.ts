import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { AuthService } from '../../Services/auth.service';
import { ThemeService } from '../../Services/theme.service';
import { UserService } from '../../Services/user.service'; // Import UserService
import { User } from '../../models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <nav class="navbar">
      <div class="navbar-container">
        <div class="navbar-brand">
          <a routerLink="/tasks">
            <span class="brand-text">Task Manager</span>
          </a>
        </div>

        <div class="navbar-search" *ngIf="authService.isAuthenticated()">
          <div class="search-container">
            <i class="search-icon"></i>
            <input
              type="text"
              class="search-input"
              placeholder="Search tasks..."
              [(ngModel)]="searchQuery"
              (input)="onSearchInput()"
            >
            <button *ngIf="searchQuery" class="clear-search" (click)="clearSearch()">✕</button>
          </div>
        </div>

        <div class="navbar-actions">
          <button class="theme-toggle" (click)="toggleTheme()">
            <i class="theme-icon">{{ isDarkMode ? '☀️' : '🌙' }}</i>
          </button>

          <div class="user-menu" *ngIf="authService.isAuthenticated()">
            <button class="user-button" (click)="toggleUserMenu()">
              <div class="user-avatar">{{ getUserInitials() }}</div>
            </button>

            <div class="dropdown-menu" *ngIf="isUserMenuOpen">
              <div class="dropdown-item" (click)="loadUsersForManagement()">
                <i class="icon">👤</i> User Management
              </div>
              <div class="dropdown-item" (click)="authService.logout()">
                <i class="icon">🚪</i> Logout
              </div>
            </div>
          </div>

          <ng-container *ngIf="!authService.isAuthenticated()">
            <a class="btn btn-primary" routerLink="/login">Login</a>
            <a class="btn btn-outline" routerLink="/signup">Sign Up</a>
          </ng-container>
        </div>
      </div>
    </nav>

    <div class="modal-overlay" *ngIf="showUserManagement" (click)="closeModal($event)">
      <div class="modal-container">
        <div class="modal-header">
          <h2>User Management</h2>
          <button class="close-button" (click)="showUserManagement = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="user-list">
            <div *ngFor="let user of users$ | async" class="user-item">
              <div class="user-info">
                <div class="user-avatar">{{ getInitials(user.name) }}</div>
                <div class="user-details">
                  <p class="user-name">{{ user.name }}</p>
                  <p class="user-email">{{ user.email }}</p>
                  <span class="user-role" [ngClass]="{'role-admin': user.role === 'ADMIN'}">
                    {{ user.role }}
                  </span>
                </div>
              </div>
              <button class="btn btn-secondary" (click)="editUser(user)">Edit</button>
              <button class="btn btn-danger" >Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="modal-overlay" *ngIf="selectedUser" (click)="closeModal($event)">
      <div class="modal-container">
        <div class="modal-header">
          <h2>Edit User</h2>
          <button class="close-button" (click)="selectedUser = null">✕</button>
        </div>
        <div class="modal-body">
          <form (ngSubmit)="updateUser()">
            <div class="form-group">
              <label for="name">Name</label>
              <input type="text" id="name" class="form-control" [(ngModel)]="selectedUser.name" name="name" required>
            </div>
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" class="form-control" [(ngModel)]="selectedUser.email" name="email" required>
            </div>
            <div class="form-group">
              <label for="role">Role</label>
              <select id="role" class="form-control" [(ngModel)]="selectedUser.role" name="role">
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-outline" (click)="selectedUser = null">Cancel</button>
              <button type="submit" class="btn btn-primary">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class NavbarComponent implements OnInit {
  searchQuery = '';
  showUserManagement = false;
  selectedUser: User | null = null;
  isUserMenuOpen = false;
  isDarkMode = true;
  currentUser: User | null = null;

  private searchSubject = new Subject<string>();
  @Output() search = new EventEmitter<string>();

  // Use the observable from UserService
  users$ = this.userService.users$;

  constructor(
    public authService: AuthService,
    private themeService: ThemeService,
    private userService: UserService // Inject UserService
  ) {}

  ngOnInit() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.search.emit(searchTerm);
    });

    this.themeService.darkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    // Load users when the component initializes
    this.userService.getAllUsers().subscribe({
      next: () => {
        // Users are automatically updated in the users$ observable
        console.log('Users loaded on component initialization');
      },
      error: (error) => {
        console.error('Error fetching users on initialization:', error);
        // Optionally display an error message
      }
    });
  }

  onSearchInput() {
    this.searchSubject.next(this.searchQuery);
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchSubject.next('');
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  getUserInitials() {
    if (this.currentUser?.name) {
      return this.getInitials(this.currentUser.name);
    }
    return 'U';
  }

  getInitials(name: string) {
    return name.split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  }

  loadUsersForManagement() {
    // No need to call getAllUsers again here, as it's already done on ngOnInit
    this.showUserManagement = true;
    this.isUserMenuOpen = false; // Close the user menu after clicking
  }

  editUser(user: User) {
    this.selectedUser = { ...user };
    this.showUserManagement = false;
  }

  updateUser() {
    if (this.selectedUser) {
      this.userService.updateUser(this.selectedUser).subscribe({
        next: (updatedUser) => {
          console.log('User updated:', updatedUser);
          this.selectedUser = null;
          // The user list will be automatically updated because we are subscribing to users$
        },
        error: (error) => {
          console.error('Error updating user:', error);
          // Optionally display an error message
        }
      });
    }
  }

  closeModal(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.showUserManagement = false;
      this.selectedUser = null;
    }
  }
}
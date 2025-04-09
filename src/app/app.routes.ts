import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { 
    path: 'login', 
    loadComponent: () => import('./components/auth/login.component').then(m => m.LoginComponent) 
  },
  { 
    path: 'signup', 
    loadComponent: () => import('./components/auth/signup.component').then(m => m.SignupComponent) 
  },
  { 
    path: 'tasks', 
    loadComponent: () => import('./components/tasks/tasks.component').then(m => m.TasksComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/tasks' }
];
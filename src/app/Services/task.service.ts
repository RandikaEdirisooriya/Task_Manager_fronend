import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/enviroment';
import { Task, TaskCreateDto } from '../models/task.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  public tasks$ = this.tasksSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAllTasks(): Observable<Task[]> {
    const headers = this.getHeaders();
    
    return this.http.get<Task[]>(`${environment.apiUrl}/task/all`, { headers })
      .pipe(
        tap(tasks => {
          this.tasksSubject.next(tasks);
        })
      );
  }

  getTaskById(id: number): Observable<Task> {
    const headers = this.getHeaders();
    return this.http.get<Task>(`${environment.apiUrl}/task/${id}`, { headers });
  }

  createTask(task: TaskCreateDto): Observable<Task> {
    const headers = this.getHeaders();
    
    return this.http.post<Task>(`${environment.apiUrl}/task/save`, task, { headers })
      .pipe(
        tap(newTask => {
          const currentTasks = this.tasksSubject.value;
          this.tasksSubject.next([newTask, ...currentTasks]);
        })
      );
  }

  updateTask(task: Task): Observable<Task> {
    const headers = this.getHeaders();
    
    return this.http.put<Task>(`${environment.apiUrl}/task/update/${task.id}`, task, { headers })
      .pipe(
        tap(updatedTask => {
          const currentTasks = this.tasksSubject.value;
          const index = currentTasks.findIndex(t => t.id === updatedTask.id);
          
          if (index !== -1) {
            const updatedTasks = [...currentTasks];
            updatedTasks[index] = updatedTask;
            this.tasksSubject.next(updatedTasks);
          }
        })
      );
  }

  deleteTask(id: number): Observable<any> {
    const headers = this.getHeaders();
    
    return this.http.delete(`${environment.apiUrl}/task/delete/${id}`, { headers })
      .pipe(
        tap(() => {
          const currentTasks = this.tasksSubject.value;
          const updatedTasks = currentTasks.filter(task => task.id !== id);
          this.tasksSubject.next(updatedTasks);
        })
      );
  }

  toggleTaskStatus(task: Task): Observable<Task> {
    const updatedTask = { 
      ...task, 
      status: task.status === 'PENDING' ? 'COMPLETED' : 'PENDING' 
    };
    
    return this.updateTask(updatedTask);
  }

  searchTasks(query: string): Task[] {
    const tasks = this.tasksSubject.value;
    
    if (!query.trim()) {
      return tasks;
    }
    
    const searchId = parseInt(query, 10);
    if (!isNaN(searchId)) {
      return tasks.filter(task => task.id === searchId);
    }
    
    const lowercaseQuery = query.toLowerCase();
    return tasks.filter(task => 
      task.title.toLowerCase().includes(lowercaseQuery) || 
      task.description.toLowerCase().includes(lowercaseQuery)
    );
  }
}
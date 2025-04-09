import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/enviroment';
import { User, UserDto } from '../models/user.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userSubject = new BehaviorSubject<User[]>([]);
  public users$ = this.userSubject.asObservable();

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

  getAllUsers(): Observable<User[]> {
    const headers = this.getHeaders();

    return this.http.get<User[]>(`${environment.apiUrl}/users/all`, { headers })
      .pipe(
        tap(users => {
          this.userSubject.next(users);
        })
      );
  }

  updateUser(user: User): Observable<User> {
    const headers = this.getHeaders();
    return this.http.put<User>(`<span class="math-inline">\{environment\.apiUrl\}/users/update/</span>{user.id}`, user, { headers })
      .pipe(
        tap(updatedUser => {
          const currentUsers = this.userSubject.value;
          const index = currentUsers.findIndex(t => t.id === updatedUser.id);
  
          if (index !== -1) {
            const updatedUsers = [...currentUsers];
            updatedUsers[index] = updatedUser;
            this.userSubject.next(updatedUsers);
          }
        })
      );
  }
  deleteUser(id: number): Observable<void> {
    const headers = this.getHeaders();
    return this.http.delete<void>(`${environment.apiUrl}/users/delete/${id}`, { headers })
      .pipe(
        tap(() => {
          const currentUsers = this.userSubject.value;
          const updatedUsers = currentUsers.filter(user => user.id !== id);
          this.userSubject.next(updatedUsers);
        })
      );
  }
}
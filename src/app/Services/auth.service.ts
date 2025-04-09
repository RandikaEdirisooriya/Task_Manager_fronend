import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/enviroment';
import { User } from '../models/user.model';

interface AuthResponse {
  token: string;
  user?: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authTokenKey = 'authToken';
  private userKey = 'currentUser';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private router: Router, private http: HttpClient) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const userJson = localStorage.getItem(this.userKey);
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        this.currentUserSubject.next(user);
      } catch (e) {
        console.error('Error parsing user from localStorage', e);
        this.clearStorage();
      }
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.authTokenKey);
  }

  setToken(token: string): void {
    localStorage.setItem(this.authTokenKey, token);
  }

  clearStorage(): void {
    localStorage.removeItem(this.authTokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/signin`, { email, password })
      .pipe(
        tap(response => {
          if (response && response.token) {
            this.setToken(response.token);
            
            // If the API returns user info with the token
            if (response.user) {
              localStorage.setItem(this.userKey, JSON.stringify(response.user));
              this.currentUserSubject.next(response.user);
            }
          }
        })
      );
  }

  signup(user: Partial<User>): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/signup`, user);
  }

  logout(): void {
    this.clearStorage();
    this.router.navigate(['/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // This method can be used to fetch user profile from the API
  fetchUserProfile(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/user/profile`)
      .pipe(
        tap(user => {
          localStorage.setItem(this.userKey, JSON.stringify(user));
          this.currentUserSubject.next(user);
        })
      );
  }
}
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkModeKey = 'darkMode';
  private darkModeSubject = new BehaviorSubject<boolean>(true);
  public darkMode$ = this.darkModeSubject.asObservable();

  constructor() {
    this.loadThemeFromStorage();
  }

  private loadThemeFromStorage(): void {
    const storedPreference = localStorage.getItem(this.darkModeKey);
    
    if (storedPreference !== null) {
      const isDarkMode = storedPreference === 'true';
      this.darkModeSubject.next(isDarkMode);
      this.applyTheme(isDarkMode);
    } else {
      // Default to dark mode if no preference is stored
      this.darkModeSubject.next(true);
      this.applyTheme(true);
    }
  }

  toggleTheme(): void {
    const currentValue = this.darkModeSubject.value;
    const newValue = !currentValue;
    
    this.darkModeSubject.next(newValue);
    localStorage.setItem(this.darkModeKey, String(newValue));
    this.applyTheme(newValue);
  }

  private applyTheme(isDarkMode: boolean): void {
    if (isDarkMode) {
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
    }
  }

  isDarkMode(): boolean {
    return this.darkModeSubject.value;
  }
}
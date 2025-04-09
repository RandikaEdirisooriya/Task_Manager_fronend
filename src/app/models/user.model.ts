export interface User {
    id?: number;
    name: string;
    email: string;
    password?: string;
    role: 'USER' | 'ADMIN';
  }

  export interface UserDto {
    id?: number;
    name: string;
    email: string;
    role: 'USER' | 'ADMIN';
  }
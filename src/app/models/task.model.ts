export interface Task {
    id?: number;
    title: string;
    description: string;
    status: string;
    createdAt: Date | string;
  }
  
  export interface TaskCreateDto {
    title: string;
    description: string;
    status: string;
    createdAt: string;
  }
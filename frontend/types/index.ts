export interface User {
  id: string;
  google_id?: string;
  name: string;
  email: string;
  avatar_url?: string | null;
  created_at?: string;
}

export type TaskStatus = 'pending' | 'completed';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  created_by: string;
  assigned_to: string;
  created_at: string;
  completed_at: string | null;
  creator?: User;
  assignee?: User;
}

export interface CreateTaskRequest {
  title: string;
  description?: string | null;
  assigned_to: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  assigned_to?: string;
}

export interface ApiError {
  code: string;
  message: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

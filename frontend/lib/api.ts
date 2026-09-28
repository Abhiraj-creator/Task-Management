import { ApiResponse, CreateTaskRequest, Task, UpdateTaskRequest, User } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const config: RequestInit = {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || {
          code: `HTTP_${response.status}`,
          message: data.message || response.statusText || 'An unexpected error occurred',
        },
      };
    }

    return data;
  } catch (err: any) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: err.message || 'Unable to connect to backend API server',
      },
    };
  }
}

export async function getCurrentUser(): Promise<ApiResponse<User>> {
  return fetchApi<User>('/auth/me');
}

export async function getUsers(): Promise<ApiResponse<User[]>> {
  return fetchApi<User[]>('/users');
}

export async function getTasks(): Promise<ApiResponse<Task[]>> {
  return fetchApi<Task[]>('/tasks');
}

export async function getTask(id: string): Promise<ApiResponse<Task>> {
  return fetchApi<Task>(`/tasks/${id}`);
}

export async function createTask(data: CreateTaskRequest): Promise<ApiResponse<Task>> {
  return fetchApi<Task>('/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTask(id: string, data: UpdateTaskRequest): Promise<ApiResponse<Task>> {
  return fetchApi<Task>(`/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function completeTask(id: string): Promise<ApiResponse<Task>> {
  return updateTask(id, { status: 'completed' });
}

export async function deleteTask(id: string): Promise<ApiResponse<{ message: string }>> {
  return fetchApi<{ message: string }>(`/tasks/${id}`, {
    method: 'DELETE',
  });
}

export async function logout(): Promise<ApiResponse<{ message: string }>> {
  return fetchApi<{ message: string }>('/auth/logout', {
    method: 'POST',
  });
}

export function getGoogleLoginUrl(): string {
  return `${API_BASE_URL}/auth/google`;
}

import { User } from '@/types';
import { getCurrentUser } from '@/lib/api';

export async function checkAuth(): Promise<User | null> {
  try {
    const response = await getCurrentUser();
    if (response.success && response.data) {
      return response.data as User;
    }
    return null;
  } catch {
    return null;
  }
}

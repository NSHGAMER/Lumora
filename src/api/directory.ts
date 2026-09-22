import { apiFetch } from './client';
import type {
  DirectoryEntry,
  DirectoryListResponse,
  DirectoryProfileUpdate,
} from './types';
import type { SystemRole } from '../types';

export interface DirectoryListParams {
  query?: string;
  role?: SystemRole;
  department?: string;
  page?: number;
  page_size?: number;
}

export const directoryApi = {
  /**
   * Search and browse campus directory entries.
   * Requires active Bearer authentication.
   */
  async list(params?: DirectoryListParams): Promise<DirectoryListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.set('query', params.query);
    if (params?.role) searchParams.set('role', params.role);
    if (params?.department) searchParams.set('department', params.department);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.page_size) searchParams.set('page_size', String(params.page_size));

    const qs = searchParams.toString();
    const endpoint = qs ? `/api/v1/directory?${qs}` : '/api/v1/directory';
    return apiFetch<DirectoryListResponse>(endpoint);
  },

  /**
   * Retrieve distinct campus academic and administrative departments.
   */
  async getDepartments(): Promise<string[]> {
    return apiFetch<string[]>('/api/v1/directory/departments');
  },

  /**
   * Fetch current authenticated user's directory entry.
   */
  async getMe(): Promise<DirectoryEntry> {
    return apiFetch<DirectoryEntry>('/api/v1/directory/me');
  },

  /**
   * Update current authenticated user's campus directory profile.
   */
  async updateMe(payload: DirectoryProfileUpdate): Promise<DirectoryEntry> {
    return apiFetch<DirectoryEntry>('/api/v1/directory/me', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Fetch directory entry by target user ID.
   */
  async getById(userId: string): Promise<DirectoryEntry> {
    return apiFetch<DirectoryEntry>(`/api/v1/directory/${encodeURIComponent(userId)}`);
  },

  /**
   * Administratively update a user's directory profile.
   * Requires 'admin' or 'management' role.
   */
  async updateById(
    userId: string,
    payload: DirectoryProfileUpdate
  ): Promise<DirectoryEntry> {
    return apiFetch<DirectoryEntry>(`/api/v1/directory/${encodeURIComponent(userId)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
};

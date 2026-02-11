import { API_BASE_URL } from './constants';
import type { UserProfile, PracticeRecord, UserStats, FeedbackItem, RootUser } from '../types';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `API error: ${res.status}`);
  }
  return res.json();
}

export const api = {
  // ── Users ──
  createUser: (data: { studentId?: string; name?: string; phone?: string; adminCode?: string; rootCode?: string }) =>
    request<UserProfile>('/api/users', { method: 'POST', body: JSON.stringify(data) }),

  getUser: (id: number) =>
    request<UserProfile>(`/api/users/${id}`),

  // ── Records ──
  saveRecord: (data: Omit<PracticeRecord, 'id' | 'createdAt'>) =>
    request<PracticeRecord>('/api/records', { method: 'POST', body: JSON.stringify(data) }),

  getRecords: (userId: number) =>
    request<PracticeRecord[]>(`/api/records?user_id=${userId}`),

  // ── Stats ──
  getStats: (userId: number) =>
    request<UserStats>(`/api/stats/${userId}`),

  // ── Admin ──
  getStudents: (adminId: number) =>
    request<{ students: AdminStudent[]; generatedAt: string }>(`/api/admin/students?admin_id=${adminId}`),

  getStudentRecords: (studentId: number, adminId: number) =>
    request<PracticeRecord[]>(`/api/admin/students/${studentId}/records?admin_id=${adminId}`),

  // ── Feedback ──
  createFeedback: (data: { adminId: number; studentId: number; content: string; weekLabel?: string }) =>
    request<FeedbackItem>('/api/feedback', { method: 'POST', body: JSON.stringify(data) }),

  getFeedback: (studentId: number) =>
    request<FeedbackItem[]>(`/api/feedback?student_id=${studentId}`),

  // ── Root Admin ──
  getRootUsers: (rootId: number) =>
    request<{ users: RootUser[] }>(`/api/root/users?root_id=${rootId}`),

  updateUserRole: (userId: number, role: string, rootId: number) =>
    request<UserProfile>(`/api/root/users/${userId}/role?role=${role}&root_id=${rootId}`, { method: 'PATCH' }),

  deleteUser: (userId: number, rootId: number) =>
    request<{ message: string }>(`/api/root/users/${userId}?root_id=${rootId}`, { method: 'DELETE' }),

  // ── Settings ──
  getThreshold: () =>
    request<{ threshold: number; updatedAt: string | null; updatedBy: number | null }>(
      '/api/settings/threshold'
    ),

  updateThreshold: (value: number, adminId: number) =>
    request<{ threshold: number; updatedAt: string | null; updatedBy: number | null }>(
      `/api/settings/threshold?value=${value}&admin_id=${adminId}`,
      { method: 'PUT' }
    ),
};

// Admin student summary type
export interface AdminStudent {
  userId: number;
  studentId: string;
  name: string;
  phone: string;
  totalSessions: number;
  totalMinutes: number;
  correctRate: number;
  weeklyDays: number;
  meetsWeeklyGoal: boolean;
}

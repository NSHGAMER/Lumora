import { apiFetch } from './client';
import type { SystemRole } from '../types';

export interface Catalog {
  classes: { id: string; name: string; semester: string; section: string }[];
  rooms: { id: string; name: string; kind: 'lecture' | 'lab' }[];
  periods: { id: string; start: string; end: string }[];
  teachers: { user_id: string; max_periods: number; unavailable: { day: string; period: number }[] }[];
  subjects: { id: string; name: string; class_id: string; teacher_id: string; weekly_periods: number; block_size: number; kind: 'lecture' | 'lab' }[];
  enrollments: { user_id: string; class_id: string }[];
}
export interface TimetableSession { id: string; subject_id: string; day: string; period: number; room_id: string }
export interface Timetable {
  revision: number; catalog: Catalog; sessions: TimetableSession[]; faculty_names: Record<string, string>;
  published_at: string | null; has_unpublished_changes: boolean;
  requests: { id: string; session_id: string; user_id: string; reason: string; status: string; day: string; period: number; room_id: string }[];
}
export interface CampusRecord { _id: string; kind: 'announcement' | 'event' | 'document'; title: string; body: string; roles: SystemRole[]; starts_at?: string; ends_at?: string; approved: boolean }
export interface Notification { _id: string; title: string; body: string; read: boolean; created_at: string }
export interface Summary { role: SystemRole; scheduled_sessions: number; announcements: number; events: number; unread_notifications: number; published_at: string | null }
export interface Workflow { _id: string; name: string; trigger: string; action: 'notify'; enabled: boolean; max_attempts: number; run_at?: string | null; title?: string; body?: string; roles?: SystemRole[] }
export interface AutomationState { workflows: Workflow[]; runs: { _id: string; status: string; attempts: number; error: string | null; delivered?: number }[]; worker: { heartbeat: string } | null }
export interface JSRAnswer { answer: string; kind: string; generated: boolean; sources: { id: string; title: string; text: string }[] }

export const campusApi = {
  timetable: () => apiFetch<Timetable>('/api/v1/academics'),
  summary: () => apiFetch<Summary>('/api/v1/campus/summary'),
  records: () => apiFetch<CampusRecord[]>('/api/v1/campus/records'),
  notifications: () => apiFetch<Notification[]>('/api/v1/campus/notifications'),
  automation: () => apiFetch<AutomationState>('/api/v1/automation'),
  mutate: <T,>(path: string, body: unknown, method = 'POST') => apiFetch<T>(`/api/v1${path}`, { method, body: JSON.stringify(body) }),
};

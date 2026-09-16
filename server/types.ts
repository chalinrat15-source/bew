export type Role = 'admin' | 'member';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: Role;
  status: 'active' | 'suspended' | 'disabled';
  avatarUrl?: string;
  interests?: string[];
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface Category {
  id: string;
  name: string;
  nameTh: string;
  icon: string;
  color: string;
  description: string;
}

export interface ActivityStep {
  step: number;
  title: string;
  instruction: string;
  durationMinutes: number;
}

export interface Activity {
  id: string;
  title: string;
  titleTh: string;
  categoryId: string;
  description: string;
  durationMinutes: number;
  energyLevel: 'low' | 'medium' | 'high';
  equipment: string[];
  steps: ActivityStep[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type DeviceType = 'mobile' | 'desktop' | 'tablet';

export interface UserSession {
  id: string;
  userId?: string | null;
  sessionId: string;
  startedAt: string;
  lastActiveAt: string;
  endedAt?: string | null;
  durationSeconds: number;
  deviceType: DeviceType;
  browser: string;
  operatingSystem: string;
  currentPage: string;
  country?: string;
  region?: string;
  language?: string;
  referrer?: string;
}

export type EventType =
  | 'page_view'
  | 'login'
  | 'logout'
  | 'register'
  | 'search_activity'
  | 'get_recommendation'
  | 'view_activity'
  | 'start_activity'
  | 'complete_activity'
  | 'save_activity'
  | 'unsave_activity'
  | 'favorite_activity'
  | 'remove_favorite'
  | 'update_profile'
  | 'change_password';

export interface AnalyticsEvent {
  id: string;
  userId?: string | null;
  sessionId: string;
  eventType: EventType;
  page: string;
  activityId?: string | null;
  categoryId?: string | null;
  metadata?: Record<string, any>;
  createdAt: string;
  deviceType?: DeviceType;
  browser?: string;
  operatingSystem?: string;
  referrer?: string;
}

export interface DailyAnalytics {
  id: string;
  date: string; // YYYY-MM-DD
  visitors: number;
  uniqueVisitors: number;
  newMembers: number;
  returningMembers: number;
  sessions: number;
  recommendations: number;
  completedActivities: number;
  averageSessionDuration: number; // in seconds
}

export interface UserSavedActivity {
  id: string;
  userId: string;
  activityId: string;
  isFavorite: boolean;
  isSaved: boolean;
  createdAt: string;
}

export interface UserActivityProgress {
  id: string;
  userId: string;
  activityId: string;
  status: 'started' | 'completed' | 'abandoned';
  startedAt: string;
  completedAt?: string | null;
  durationSeconds: number;
  notes?: string;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: string;
  targetId?: string;
  description: string;
  metadata?: Record<string, any>;
  timestamp: string;
  ipAddress?: string;
}

export interface SystemLog {
  id: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  service: string;
  message: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface AdminAlert {
  id: string;
  type: 'peak_users' | 'new_members' | 'activity_surge' | 'db_usage' | 'error_spike';
  title: string;
  message: string;
  threshold: string;
  isRead: boolean;
  createdAt: string;
  severity: 'low' | 'medium' | 'high';
}

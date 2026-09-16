export type Role = 'admin' | 'member';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  status: 'active' | 'suspended' | 'disabled';
  avatarUrl?: string;
  interests?: string[];
  createdAt?: string;
  lastLoginAt?: string;
  completedActivities?: number;
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

export interface UserSavedActivity {
  id: string;
  userId: string;
  activityId: string;
  isFavorite: boolean;
  isSaved: boolean;
  createdAt: string;
  activity?: Activity;
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
  activity?: Activity;
}

export interface KPISummary {
  totalUsers: number;
  onlineNow: number;
  visitorsToday: number;
  newMembersToday: number;
  returningMembers: number;
  recommendationsToday: number;
  completedActivities: number;
  averageSessionDuration: string;
  avgSessionSeconds: number;
  totalSessions: number;
  sessionsPerUser: string;
  guestSessions: number;
  memberSessions: number;
  loginsToday: number;
  logoutsToday: number;
}

export interface HourlyData {
  hour: string;
  users: number;
  bar: string;
}

export interface HourlySummary {
  hours: HourlyData[];
  peakHourRange: string;
  peakAvgUsers: number;
  summaryText: string;
}

export interface DeviceAnalytics {
  devices: { name: string; value: number; color: string }[];
  operatingSystems: { name: string; value: number; color: string }[];
  browsers: { name: string; value: number; color: string }[];
}

export interface TrafficAnalytics {
  countries: { country: string; code: string; users: number; percentage: number }[];
  regions: { region: string; users: number; percentage: number }[];
  languages: { language: string; percentage: number }[];
  referrers: { name: string; users: number; percentage: number }[];
}

export interface PopularPage {
  path: string;
  title: string;
  views: number;
  uniqueViews: number;
  avgTime: string;
}

export interface PopularActivity {
  id: string;
  title: string;
  category: string;
  views: number;
  starts: number;
  completed: number;
  saved: number;
  completionRate: string;
}

export interface PopularCategory {
  name: string;
  nameTh: string;
  views: number;
  recommendations: number;
  starts: number;
  completions: number;
  saves: number;
  percentage: number;
}

export interface RecommendationAnalytics {
  recommendationsGenerated: number;
  recommendationClicks: number;
  activitiesStarted: number;
  activitiesCompleted: number;
  savedRecommendations: number;
  clickRate: string;
  startRate: string;
  completionRate: string;
  saveRate: string;
  categoryBreakdown: { category: string; percentage: number; count: number }[];
}

export interface LiveUser {
  sessionId: string;
  userId?: string | null;
  userName: string;
  isMember: boolean;
  currentPage: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  browser: string;
  operatingSystem: string;
  region: string;
  startedAt: string;
  lastActiveAt: string;
  secondsAgo: number;
  durationSeconds: number;
}

export interface AnalyticsEventItem {
  id: string;
  userId?: string | null;
  userName?: string;
  userEmail?: string;
  sessionId: string;
  eventType: string;
  page: string;
  activityId?: string | null;
  activityTitle?: string;
  categoryId?: string | null;
  categoryName?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  deviceType?: string;
  browser?: string;
  operatingSystem?: string;
}

export interface AdminAuditLogItem {
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

export interface SystemStatusData {
  services: {
    frontend: { status: string; label: string; color: string };
    backend: { status: string; label: string; color: string };
    database: { status: string; label: string; color: string; recordCount: number };
    authentication: { status: string; label: string; color: string };
    storage: { status: string; label: string; color: string };
    analytics: { status: string; label: string; color: string };
  };
  metrics: {
    lastDatabaseCheck: string;
    lastApiCheck: string;
    errorCount: number;
    failedRequests: number;
    averageResponseTimeMs: number;
    uptimeSeconds: number;
    memoryUsageMb: number;
    totalEventsStored: number;
    totalSessionsStored: number;
    dbFileSizeBytes: number;
  };
}

export interface AdminAlertItem {
  id: string;
  type: string;
  title: string;
  message: string;
  threshold: string;
  isRead: boolean;
  createdAt: string;
  severity: 'low' | 'medium' | 'high';
}

export type AdminTab =
  | 'dashboard'
  | 'analytics'
  | 'live-users'
  | 'members'
  | 'activities'
  | 'categories'
  | 'activity-history'
  | 'recommendations'
  | 'reports'
  | 'notifications'
  | 'audit-logs'
  | 'system-status'
  | 'settings'
  | 'admin-management';

export type UserTab =
  | 'home'
  | 'match'
  | 'recommend'
  | 'detail'
  | 'session'
  | 'my-activities'
  | 'dashboard'
  | 'profile'
  | 'search';

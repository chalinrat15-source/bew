import { User, Activity, Category, KPISummary, HourlySummary, DeviceAnalytics, TrafficAnalytics, PopularPage, PopularActivity, PopularCategory, RecommendationAnalytics, LiveUser, AnalyticsEventItem, AdminAuditLogItem, SystemStatusData, AdminAlertItem, UserSavedActivity, UserActivityProgress } from '../types';

// Detect client device environment safely
export function getDeviceInfo() {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  let deviceType: 'mobile' | 'desktop' | 'tablet' = 'desktop';
  if (/mobile/i.test(ua)) deviceType = 'mobile';
  else if (/tablet|ipad/i.test(ua)) deviceType = 'tablet';

  let browser = 'Chrome';
  if (/edg/i.test(ua)) browser = 'Edge';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
  else if (/firefox/i.test(ua)) browser = 'Firefox';

  let operatingSystem = 'Windows';
  if (/macintosh|mac os x/i.test(ua)) operatingSystem = 'macOS';
  else if (/iphone|ipad|ipod/i.test(ua)) operatingSystem = 'iOS';
  else if (/android/i.test(ua)) operatingSystem = 'Android';
  else if (/linux/i.test(ua)) operatingSystem = 'Linux';

  return { deviceType, browser, operatingSystem };
}

// Session persistence in localStorage
export function getSessionId(): string {
  const KEY = 'activity_match_session_id';
  let sid = localStorage.getItem(KEY);
  if (!sid) {
    sid = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(KEY, sid);
  }
  return sid;
}

class ApiService {
  private sessionId: string;
  private currentUser: User | null = null;
  private heartbeatTimer: any = null;
  private currentPage: string = '/home';

  constructor() {
    this.sessionId = getSessionId();
    const stored = localStorage.getItem('activity_match_user');
    if (stored) {
      try {
        this.currentUser = JSON.parse(stored);
      } catch (e) {
        this.currentUser = null;
      }
    }
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public setCurrentUser(user: User | null) {
    this.currentUser = user;
    if (user) {
      localStorage.setItem('activity_match_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('activity_match_user');
    }
  }

  public initHeartbeat() {
    this.startHeartbeat();
  }

  public trackPageView(page: string) {
    this.setCurrentPage(page);
  }

  public trackStartActivity(activityId: string, title?: string, categoryId?: string) {
    this.track('start_activity', this.currentPage, { title }, activityId, categoryId);
  }

  public trackViewActivity(activityId: string, title?: string, categoryId?: string) {
    this.track('view_activity', this.currentPage, { title }, activityId, categoryId);
  }

  public setCurrentPage(page: string) {
    this.currentPage = page;
    this.track('page_view', page);
  }

  public getCurrentPage(): string {
    return this.currentPage;
  }

  public startHeartbeat() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    // Send immediate heartbeat
    this.sendHeartbeat();
    // Repeat every 20 seconds
    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat();
    }, 20000);
  }

  public stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  public async sendHeartbeat() {
    const dev = getDeviceInfo();
    try {
      await fetch('/api/analytics/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.sessionId,
          userId: this.currentUser?.id || null,
          page: this.currentPage,
          deviceType: dev.deviceType,
          browser: dev.browser,
          operatingSystem: dev.operatingSystem,
          referrer: document.referrer || 'direct',
        }),
      });
    } catch (err) {
      // ignore transient network error
    }
  }

  public async track(
    eventType: string,
    page?: string,
    metadata?: Record<string, any>,
    activityId?: string,
    categoryId?: string
  ) {
    const dev = getDeviceInfo();
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: this.currentUser?.id || null,
          sessionId: this.sessionId,
          eventType,
          page: page || this.currentPage,
          activityId,
          categoryId,
          metadata,
          deviceType: dev.deviceType,
          browser: dev.browser,
          operatingSystem: dev.operatingSystem,
          referrer: document.referrer || 'direct',
        }),
      });
    } catch (e) {
      console.warn('Track event error:', e);
    }
  }

  // ===================== AUTH =====================
  public async login(email: string, password: string):Promise<{ user: User; token: string }> {
    const dev = getDeviceInfo();
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        sessionId: this.sessionId,
        page: this.currentPage,
        deviceType: dev.deviceType,
        browser: dev.browser,
        operatingSystem: dev.operatingSystem,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'เข้าสู่ระบบไม่สำเร็จ');
    }
    const data = await res.json();
    this.setCurrentUser(data.user);
    return data;
  }

  public async register(payload: { email: string; password: string; fullName: string; interests?: string[] }): Promise<{ user: User; token: string }> {
    const dev = getDeviceInfo();
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        sessionId: this.sessionId,
        page: this.currentPage,
        deviceType: dev.deviceType,
        browser: dev.browser,
        operatingSystem: dev.operatingSystem,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'ลงทะเบียนไม่สำเร็จ');
    }
    const data = await res.json();
    this.setCurrentUser(data.user);
    return data;
  }

  public async logout(): Promise<void> {
    const dev = getDeviceInfo();
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: this.currentUser?.id,
        sessionId: this.sessionId,
        page: this.currentPage,
        deviceType: dev.deviceType,
        browser: dev.browser,
        operatingSystem: dev.operatingSystem,
      }),
    });
    this.setCurrentUser(null);
  }

  public async updateProfile(fullName: string, interests: string[], avatarUrl?: string) {
    if (!this.currentUser) return;
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: this.currentUser.id,
        fullName,
        interests,
        avatarUrl,
        sessionId: this.sessionId,
        page: this.currentPage,
      }),
    });
    const data = await res.json();
    this.setCurrentUser(data.user);
    return data.user;
  }

  public async changePassword(oldPassword: string, newPassword: string) {
    if (!this.currentUser) return;
    const res = await fetch('/api/auth/change-password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: this.currentUser.id,
        oldPassword,
        newPassword,
        sessionId: this.sessionId,
        page: this.currentPage,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'เปลี่ยนรหัสผ่านไม่สำเร็จ');
    }
    return res.json();
  }

  // ===================== CORE APP =====================
  public async getCategories(): Promise<Category[]> {
    const res = await fetch('/api/categories');
    return res.json();
  }

  public async getActivities(params?: { category?: string; search?: string; energyLevel?: string; maxDuration?: number }): Promise<Activity[]> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.energyLevel) query.append('energyLevel', params.energyLevel);
    if (params?.maxDuration) query.append('maxDuration', params.maxDuration.toString());
    query.append('sessionId', this.sessionId);
    if (this.currentUser) query.append('userId', this.currentUser.id);
    query.append('page', this.currentPage);

    const res = await fetch(`/api/activities?${query.toString()}`);
    return res.json();
  }

  public async getActivityById(id: string): Promise<Activity> {
    const query = new URLSearchParams({
      sessionId: this.sessionId,
      page: `/activities/${id}`,
    });
    if (this.currentUser) query.append('userId', this.currentUser.id);

    const res = await fetch(`/api/activities/${id}?${query.toString()}`);
    if (!res.ok) throw new Error('Activity not found');
    return res.json();
  }

  public async generateRecommendations(params: {
    mood?: string;
    availableTime?: number;
    energyLevel?: string;
    categoryPreference?: string;
  }): Promise<{ activity: Activity; matchScore: number }[]> {
    const res = await fetch('/api/recommendations/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...params,
        sessionId: this.sessionId,
        userId: this.currentUser?.id,
        page: this.currentPage,
      }),
    });
    return res.json();
  }

  public async getSavedActivities(): Promise<UserSavedActivity[]> {
    if (!this.currentUser) return [];
    const res = await fetch(`/api/user/saved?userId=${this.currentUser.id}`);
    return res.json();
  }

  public async toggleSave(activityId: string, isSaved: boolean) {
    if (!this.currentUser) throw new Error('กรุณาเข้าสู่ระบบเพื่อบันทึกกิจกรรม');
    const res = await fetch('/api/user/saved/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: this.currentUser.id,
        activityId,
        isSaved,
        sessionId: this.sessionId,
        page: this.currentPage,
      }),
    });
    return res.json();
  }

  public async toggleFavorite(activityId: string, isFavorite: boolean) {
    if (!this.currentUser) throw new Error('กรุณาเข้าสู่ระบบเพื่อเพิ่มในรายการโปรด');
    const res = await fetch('/api/user/favorite/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: this.currentUser.id,
        activityId,
        isFavorite,
        sessionId: this.sessionId,
        page: this.currentPage,
      }),
    });
    return res.json();
  }

  public async startActivity(activityId: string) {
    if (!this.currentUser) {
      // Guest can also start activity! Track as guest event
      this.track('start_activity', `/session/${activityId}`, {}, activityId);
      return { id: `guest-prog-${Date.now()}`, status: 'started' };
    }
    const res = await fetch('/api/user/progress/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: this.currentUser.id,
        activityId,
        sessionId: this.sessionId,
        page: `/session/${activityId}`,
      }),
    });
    return res.json();
  }

  public async completeActivity(activityId: string, durationSeconds: number, notes?: string) {
    if (!this.currentUser) {
      this.track('complete_activity', `/session/${activityId}`, { durationSeconds, notes }, activityId);
      return { id: `guest-prog-${Date.now()}`, status: 'completed' };
    }
    const res = await fetch('/api/user/progress/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: this.currentUser.id,
        activityId,
        durationSeconds,
        notes,
        sessionId: this.sessionId,
        page: `/session/${activityId}`,
      }),
    });
    return res.json();
  }

  public async getUserProgressHistory(): Promise<UserActivityProgress[]> {
    if (!this.currentUser) return [];
    const res = await fetch(`/api/user/progress/history?userId=${this.currentUser.id}`);
    return res.json();
  }

  // ===================== ADMIN ANALYTICS =====================
  public async getDashboardSummary(): Promise<KPISummary> {
    const res = await fetch('/api/analytics/dashboard-summary');
    return res.json();
  }

  public async getVisitorChart(period: string = '7days'): Promise<any[]> {
    const res = await fetch(`/api/analytics/visitor-chart?period=${period}`);
    return res.json();
  }

  public async getHourly(): Promise<HourlySummary> {
    const res = await fetch('/api/analytics/hourly');
    return res.json();
  }

  public async getDevices(): Promise<DeviceAnalytics> {
    const res = await fetch('/api/analytics/devices');
    return res.json();
  }

  public async getTraffic(): Promise<TrafficAnalytics> {
    const res = await fetch('/api/analytics/traffic');
    return res.json();
  }

  public async getPopularPages(): Promise<PopularPage[]> {
    const res = await fetch('/api/analytics/popular-pages');
    return res.json();
  }

  public async getPopularActivities(): Promise<PopularActivity[]> {
    const res = await fetch('/api/analytics/popular-activities');
    return res.json();
  }

  public async getPopularCategories(): Promise<PopularCategory[]> {
    const res = await fetch('/api/analytics/popular-categories');
    return res.json();
  }

  public async getRecommendationAnalytics(): Promise<RecommendationAnalytics> {
    const res = await fetch('/api/analytics/recommendations');
    return res.json();
  }

  public async getLiveUsers(): Promise<{ onlineCount: number; users: LiveUser[]; timestamp: string }> {
    const res = await fetch('/api/analytics/live-users');
    return res.json();
  }

  public async getUserGrowth(scale: string = 'daily'): Promise<any[]> {
    const res = await fetch(`/api/analytics/user-growth?scale=${scale}`);
    return res.json();
  }

  public async getUserEngagement(): Promise<any> {
    const res = await fetch('/api/analytics/engagement');
    return res.json();
  }

  public async getEvents(filter?: {
    dateRange?: string;
    userType?: string;
    eventType?: string;
    activityId?: string;
    categoryId?: string;
    deviceType?: string;
    sort?: string;
    search?: string;
    page?: number;
  }): Promise<{ items: AnalyticsEventItem[]; total: number; page: number; limit: number; totalPages: number }> {
    const query = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
      });
    }
    const res = await fetch(`/api/analytics/events?${query.toString()}`);
    return res.json();
  }

  // ===================== ADMIN CRUD =====================
  public async getMembers(): Promise<User[]> {
    const res = await fetch('/api/admin/members');
    return res.json();
  }

  public async createMemberAdmin(data: {
    email: string;
    password: string;
    fullName: string;
    role?: 'admin' | 'member';
    status?: 'active' | 'suspended' | 'disabled';
    interests?: string[];
  }): Promise<User> {
    const res = await fetch('/api/admin/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        adminId: this.currentUser?.id,
        adminName: this.currentUser?.fullName,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'สร้างผู้ใช้งานไม่สำเร็จ');
    }
    return res.json();
  }

  public async updateMemberStatus(id: string, status: 'active' | 'suspended' | 'disabled') {
    const res = await fetch(`/api/admin/members/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        adminId: this.currentUser?.id,
        adminName: this.currentUser?.fullName,
      }),
    });
    return res.json();
  }

  public async getActivitiesAdmin(): Promise<Activity[]> {
    const res = await fetch('/api/admin/activities');
    return res.json();
  }

  public async createActivityAdmin(data: Partial<Activity>) {
    const res = await fetch('/api/admin/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        adminId: this.currentUser?.id,
        adminName: this.currentUser?.fullName,
      }),
    });
    return res.json();
  }

  public async updateActivityAdmin(id: string, data: Partial<Activity>) {
    const res = await fetch(`/api/admin/activities/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        adminId: this.currentUser?.id,
        adminName: this.currentUser?.fullName,
      }),
    });
    return res.json();
  }

  public async deleteActivityAdmin(id: string) {
    const res = await fetch(`/api/admin/activities/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminId: this.currentUser?.id,
        adminName: this.currentUser?.fullName,
      }),
    });
    return res.json();
  }

  public async getAuditLogs(action?: string, search?: string): Promise<AdminAuditLogItem[]> {
    const query = new URLSearchParams();
    if (action) query.append('action', action);
    if (search) query.append('search', search);
    const res = await fetch(`/api/admin/audit-logs?${query.toString()}`);
    return res.json();
  }

  public async getSystemStatus(): Promise<SystemStatusData> {
    const res = await fetch('/api/admin/system-status');
    return res.json();
  }

  public async getAlerts(): Promise<AdminAlertItem[]> {
    const res = await fetch('/api/admin/alerts');
    return res.json();
  }

  public async markAlertRead(id: string) {
    const res = await fetch(`/api/admin/alerts/${id}/read`, { method: 'PUT' });
    return res.json();
  }

  public async updateSettings(settings: Record<string, any>) {
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...settings,
        adminId: this.currentUser?.id,
        adminName: this.currentUser?.fullName,
      }),
    });
    return res.json();
  }

  public getExportCsvUrl(type: string): string {
    return `/api/export/csv/${type}`;
  }

  public getSchemaSqlUrl(): string {
    return `/api/export/schema.sql`;
  }
}

export const api = new ApiService();

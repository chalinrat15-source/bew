import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import { DeviceType, EventType } from './server/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper to parse device info from headers or payload
  const parseDevice = (req: Request) => {
    const ua = req.headers['user-agent'] || '';
    let deviceType: DeviceType = 'desktop';
    if (/mobile/i.test(ua)) deviceType = 'mobile';
    else if (/tablet|ipad/i.test(ua)) deviceType = 'tablet';

    let browser = 'Chrome';
    if (/edg/i.test(ua)) browser = 'Edge';
    else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
    else if (/firefox/i.test(ua)) browser = 'Firefox';

    let os = 'Windows';
    if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
    else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
    else if (/android/i.test(ua)) os = 'Android';
    else if (/linux/i.test(ua)) os = 'Linux';

    return { deviceType, browser, os };
  };

  // ===================== HEALTH CHECK =====================
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ===================== AUTH ROUTES =====================
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password, sessionId } = req.body;
    const user = db.getUserByEmail(email);

    if (!user || user.passwordHash !== password) {
      return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง (Invalid credentials)' });
    }

    if (user.status === 'disabled' || user.status === 'suspended') {
      return res.status(403).json({ error: 'บัญชีนี้ถูกระงับการใช้งานชั่วคราว (Account disabled)' });
    }

    db.updateUser(user.id, { lastLoginAt: new Date().toISOString() });

    const { deviceType, browser, os } = parseDevice(req);

    // Track login event
    if (sessionId) {
      db.recordEvent({
        userId: user.id,
        sessionId,
        eventType: 'login',
        page: req.body.page || '/login',
        deviceType: req.body.deviceType || deviceType,
        browser: req.body.browser || browser,
        operatingSystem: req.body.operatingSystem || os,
      });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        avatarUrl: user.avatarUrl,
        interests: user.interests,
      },
      token: `token-${user.id}-${Date.now()}`,
    });
  });

  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { email, password, fullName, interests, sessionId, page } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน (All fields required)' });
    }

    if (db.getUserByEmail(email)) {
      return res.status(400).json({ error: 'อีเมลนี้ถูกใช้งานแล้ว (Email already in use)' });
    }

    const newUser = db.createUser({
      email,
      passwordHash: password,
      fullName,
      role: 'member',
      status: 'active',
      interests: interests || ['Learning', 'Health & Fitness'],
      avatarUrl: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=150&auto=format&fit=crop&q=80`,
    });

    const { deviceType, browser, os } = parseDevice(req);

    if (sessionId) {
      db.recordEvent({
        userId: newUser.id,
        sessionId,
        eventType: 'register',
        page: page || '/register',
        deviceType: req.body.deviceType || deviceType,
        browser: req.body.browser || browser,
        operatingSystem: req.body.operatingSystem || os,
      });
    }

    res.json({
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
        status: newUser.status,
        avatarUrl: newUser.avatarUrl,
        interests: newUser.interests,
      },
      token: `token-${newUser.id}-${Date.now()}`,
    });
  });

  app.post('/api/auth/logout', (req: Request, res: Response) => {
    const { userId, sessionId, page } = req.body;
    const { deviceType, browser, os } = parseDevice(req);

    if (sessionId) {
      db.recordEvent({
        userId,
        sessionId,
        eventType: 'logout',
        page: page || '/logout',
        deviceType: req.body.deviceType || deviceType,
        browser: req.body.browser || browser,
        operatingSystem: req.body.operatingSystem || os,
      });
      db.endSession(sessionId);
    }

    res.json({ message: 'ออกจากระบบสำเร็จ (Logged out successfully)' });
  });

  app.put('/api/auth/profile', (req: Request, res: Response) => {
    const { userId, fullName, interests, avatarUrl, sessionId, page } = req.body;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });

    const updated = db.updateUser(userId, { fullName, interests, avatarUrl });
    if (!updated) return res.status(404).json({ error: 'User not found' });

    if (sessionId) {
      db.recordEvent({
        userId,
        sessionId,
        eventType: 'update_profile',
        page: page || '/profile',
      });
    }

    res.json({ user: updated });
  });

  app.put('/api/auth/change-password', (req: Request, res: Response) => {
    const { userId, oldPassword, newPassword, sessionId, page } = req.body;
    const user = db.getUserById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.passwordHash !== oldPassword) {
      return res.status(400).json({ error: 'รหัสผ่านเดิมไม่ถูกต้อง' });
    }

    db.updateUser(userId, { passwordHash: newPassword });

    if (sessionId) {
      db.recordEvent({
        userId,
        sessionId,
        eventType: 'change_password',
        page: page || '/profile',
      });
    }

    res.json({ message: 'เปลี่ยนรหัสผ่านสำเร็จ' });
  });

  // ===================== CORE APP: ACTIVITIES & CATEGORIES =====================
  app.get('/api/categories', (req: Request, res: Response) => {
    res.json(db.getCategories());
  });

  app.get('/api/activities', (req: Request, res: Response) => {
    const { category, search, energyLevel, maxDuration, sessionId, userId, page } = req.query;
    let activities = db.getActivities();

    if (category && category !== 'all') {
      activities = activities.filter((a) => a.categoryId === category);
    }
    if (energyLevel && energyLevel !== 'all') {
      activities = activities.filter((a) => a.energyLevel === energyLevel);
    }
    if (maxDuration) {
      const maxD = parseInt(maxDuration as string, 10);
      if (!isNaN(maxD)) {
        activities = activities.filter((a) => a.durationMinutes <= maxD);
      }
    }
    if (search) {
      const q = (search as string).toLowerCase();
      activities = activities.filter(
        (a) => a.title.toLowerCase().includes(q) || a.titleTh.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)
      );

      // Track search event if sessionId present
      if (sessionId) {
        db.recordEvent({
          userId: (userId as string) || null,
          sessionId: sessionId as string,
          eventType: 'search_activity',
          page: (page as string) || '/activity-match',
          metadata: { query: search, resultsCount: activities.length },
        });
      }
    }

    res.json(activities);
  });

  app.get('/api/activities/:id', (req: Request, res: Response) => {
    const act = db.getActivityById(req.params.id);
    if (!act) return res.status(404).json({ error: 'Activity not found' });

    const { sessionId, userId, page } = req.query;
    if (sessionId) {
      db.recordEvent({
        userId: (userId as string) || null,
        sessionId: sessionId as string,
        eventType: 'view_activity',
        page: (page as string) || `/activities/${act.id}`,
        activityId: act.id,
        categoryId: act.categoryId,
      });
    }

    res.json(act);
  });

  // Recommendation engine endpoint
  app.post('/api/recommendations/generate', (req: Request, res: Response) => {
    const { mood, availableTime, energyLevel, categoryPreference, sessionId, userId, page } = req.body;
    const allActivities = db.getActivities();

    // Match scored algorithm
    const scored = allActivities.map((act) => {
      let score = 50;
      if (categoryPreference && categoryPreference !== 'any' && act.categoryId === categoryPreference) score += 40;
      if (energyLevel && act.energyLevel === energyLevel) score += 30;
      if (availableTime && act.durationMinutes <= availableTime) score += 20;

      // Mood alignment
      if (mood === 'stressed' && (act.categoryId === 'cat-health' || act.categoryId === 'cat-nature')) score += 25;
      if (mood === 'energized' && (act.energyLevel === 'high' || act.categoryId === 'cat-health')) score += 25;
      if (mood === 'curious' && (act.categoryId === 'cat-learning' || act.categoryId === 'cat-technology')) score += 25;
      if (mood === 'creative' && (act.categoryId === 'cat-art' || act.categoryId === 'cat-music')) score += 25;

      return { activity: act, matchScore: Math.min(99, score + Math.floor(Math.random() * 5)) };
    });

    scored.sort((a, b) => b.matchScore - a.matchScore);
    const topMatches = scored.slice(0, 4);

    // Track recommendation event
    if (sessionId) {
      db.recordEvent({
        userId: userId || null,
        sessionId,
        eventType: 'get_recommendation',
        page: page || '/recommendations',
        activityId: topMatches[0]?.activity.id,
        categoryId: topMatches[0]?.activity.categoryId,
        metadata: { mood, availableTime, energyLevel, count: topMatches.length },
      });
    }

    res.json(topMatches);
  });

  // ===================== USER SAVED & FAVORITES =====================
  app.get('/api/user/saved', (req: Request, res: Response) => {
    const userId = req.query.userId as string;
    if (!userId) return res.json([]);
    const saved = db.getUserSaved(userId);
    const allActivities = db.getAllActivities();
    const enriched = saved.map((s) => ({
      ...s,
      activity: allActivities.find((a) => a.id === s.activityId),
    }));
    res.json(enriched);
  });

  app.post('/api/user/saved/toggle', (req: Request, res: Response) => {
    const { userId, activityId, isSaved, sessionId, page } = req.body;
    if (!userId || !activityId) return res.status(400).json({ error: 'Missing parameters' });

    const item = db.toggleSaveActivity(userId, activityId, isSaved);

    if (sessionId) {
      db.recordEvent({
        userId,
        sessionId,
        eventType: isSaved ? 'save_activity' : 'unsave_activity',
        page: page || '/activities',
        activityId,
      });
    }

    res.json(item);
  });

  app.post('/api/user/favorite/toggle', (req: Request, res: Response) => {
    const { userId, activityId, isFavorite, sessionId, page } = req.body;
    if (!userId || !activityId) return res.status(400).json({ error: 'Missing parameters' });

    const item = db.toggleFavoriteActivity(userId, activityId, isFavorite);

    if (sessionId) {
      db.recordEvent({
        userId,
        sessionId,
        eventType: isFavorite ? 'favorite_activity' : 'remove_favorite',
        page: page || '/activities',
        activityId,
      });
    }

    res.json(item);
  });

  // ===================== USER PROGRESS & ACTIVE SESSIONS =====================
  app.post('/api/user/progress/start', (req: Request, res: Response) => {
    const { userId, activityId, sessionId, page } = req.body;
    if (!userId || !activityId) return res.status(400).json({ error: 'Missing parameters' });

    const prog = db.startActivityProgress(userId, activityId);

    if (sessionId) {
      db.recordEvent({
        userId,
        sessionId,
        eventType: 'start_activity',
        page: page || `/session/${activityId}`,
        activityId,
      });
    }

    res.json(prog);
  });

  app.post('/api/user/progress/complete', (req: Request, res: Response) => {
    const { userId, activityId, durationSeconds, notes, sessionId, page } = req.body;
    if (!userId || !activityId) return res.status(400).json({ error: 'Missing parameters' });

    const prog = db.completeActivityProgress(userId, activityId, durationSeconds || 1800, notes);

    if (sessionId) {
      db.recordEvent({
        userId,
        sessionId,
        eventType: 'complete_activity',
        page: page || `/session/${activityId}`,
        activityId,
        metadata: { durationSeconds, notes },
      });
    }

    res.json(prog);
  });

  app.get('/api/user/progress/history', (req: Request, res: Response) => {
    const userId = req.query.userId as string;
    if (!userId) return res.json([]);
    const history = db.getUserProgressList(userId);
    const allActivities = db.getAllActivities();
    const enriched = history.map((h) => ({
      ...h,
      activity: allActivities.find((a) => a.id === h.activityId),
    }));
    res.json(enriched);
  });

  // ===================== ANALYTICS REALTIME & HEARTBEAT =====================
  app.post('/api/analytics/heartbeat', (req: Request, res: Response) => {
    const { sessionId, userId, page, deviceType, browser, operatingSystem, referrer, region } = req.body;
    if (!sessionId) return res.status(400).json({ error: 'Missing sessionId' });

    const session = db.pingSession({
      sessionId,
      userId: userId || null,
      page: page || '/home',
      deviceType,
      browser,
      operatingSystem,
      referrer,
      region,
    });

    res.json({ status: 'alive', session });
  });

  app.post('/api/analytics/track', (req: Request, res: Response) => {
    const { userId, sessionId, eventType, page, activityId, categoryId, metadata, deviceType, browser, operatingSystem, referrer } = req.body;
    if (!sessionId || !eventType) return res.status(400).json({ error: 'Missing required tracking data' });

    const event = db.recordEvent({
      userId: userId || null,
      sessionId,
      eventType: eventType as EventType,
      page: page || '/home',
      activityId: activityId || null,
      categoryId: categoryId || null,
      metadata,
      deviceType,
      browser,
      operatingSystem,
      referrer,
    });

    res.json({ success: true, eventId: event.id });
  });

  // ===================== ADMIN ANALYTICS DASHBOARD API =====================
  app.get('/api/analytics/dashboard-summary', (req: Request, res: Response) => {
    const kpis = db.getKPISummary();
    res.json(kpis);
  });

  app.get('/api/analytics/visitor-chart', (req: Request, res: Response) => {
    const period = (req.query.period as any) || '7days';
    const chartData = db.getVisitorChart(period);
    res.json(chartData);
  });

  app.get('/api/analytics/hourly', (req: Request, res: Response) => {
    const hourly = db.getHourlyActivity();
    res.json(hourly);
  });

  app.get('/api/analytics/devices', (req: Request, res: Response) => {
    const devices = db.getDeviceAnalytics();
    res.json(devices);
  });

  app.get('/api/analytics/traffic', (req: Request, res: Response) => {
    const traffic = db.getTrafficInfo();
    res.json(traffic);
  });

  app.get('/api/analytics/popular-pages', (req: Request, res: Response) => {
    const pages = db.getPopularPages();
    res.json(pages);
  });

  app.get('/api/analytics/popular-activities', (req: Request, res: Response) => {
    const activities = db.getPopularActivities();
    res.json(activities);
  });

  app.get('/api/analytics/popular-categories', (req: Request, res: Response) => {
    const categories = db.getPopularCategories();
    res.json(categories);
  });

  app.get('/api/analytics/recommendations', (req: Request, res: Response) => {
    const reco = db.getRecommendationAnalytics();
    res.json(reco);
  });

  app.get('/api/analytics/live-users', (req: Request, res: Response) => {
    const live = db.getLiveUsers();
    res.json({
      onlineCount: live.length,
      users: live,
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/analytics/user-growth', (req: Request, res: Response) => {
    const scale = (req.query.scale as any) || 'daily';
    const growth = db.getUserGrowth(scale);
    res.json(growth);
  });

  app.get('/api/analytics/engagement', (req: Request, res: Response) => {
    const engagement = db.getUserEngagement();
    res.json(engagement);
  });

  app.get('/api/analytics/events', (req: Request, res: Response) => {
    const { dateRange, userType, eventType, activityId, categoryId, deviceType, sort, search, page, limit } = req.query;
    const result = db.getFilteredEvents({
      dateRange: dateRange as any,
      userType: userType as any,
      eventType: eventType as string,
      activityId: activityId as string,
      categoryId: categoryId as string,
      deviceType: deviceType as string,
      sort: sort as any,
      search: search as string,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 20,
    });
    res.json(result);
  });

  // ===================== ADMIN MANAGEMENT CRUD =====================
  app.get('/api/admin/members', (req: Request, res: Response) => {
    const users = db.getUsers();
    const enriched = users.map((u) => {
      const progress = db.getUserProgressList(u.id);
      const completedCount = progress.filter((p) => p.status === 'completed').length;
      return {
        id: u.id,
        email: u.email,
        fullName: u.fullName,
        role: u.role,
        status: u.status,
        avatarUrl: u.avatarUrl,
        interests: u.interests,
        createdAt: u.createdAt,
        lastLoginAt: u.lastLoginAt,
        completedActivities: completedCount,
      };
    });
    res.json(enriched);
  });

  app.put('/api/admin/members/:id/status', (req: Request, res: Response) => {
    const { status, adminId, adminName } = req.body;
    const updated = db.updateUser(req.params.id, { status });
    if (!updated) return res.status(404).json({ error: 'User not found' });

    db.logAdminAction({
      adminId: adminId || 'usr-admin-1',
      adminName: adminName || 'Admin',
      action: 'Change Member Status',
      targetType: 'member',
      targetId: req.params.id,
      description: `เปลี่ยนสถานะสมาชิก ${updated.fullName} เป็น ${status}`,
    });

    res.json(updated);
  });

  app.post('/api/admin/members', (req: Request, res: Response) => {
    const { email, password, fullName, role, status, interests, adminId, adminName } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน (ชื่อ, อีเมล, รหัสผ่าน)' });
    }

    if (db.getUserByEmail(email)) {
      return res.status(400).json({ error: 'อีเมลนี้ถูกใช้งานแล้วในระบบ (Email already in use)' });
    }

    const newUser = db.createUser({
      email,
      passwordHash: password,
      fullName,
      role: role === 'admin' ? 'admin' : 'member',
      status: status || 'active',
      interests: Array.isArray(interests) && interests.length > 0 ? interests : ['Learning', 'Health & Fitness'],
      avatarUrl: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=150&auto=format&fit=crop&q=80`,
    });

    db.logAdminAction({
      adminId: adminId || 'usr-admin-1',
      adminName: adminName || 'Admin',
      action: 'Create Member',
      targetType: 'member',
      targetId: newUser.id,
      description: `สร้างผู้ใช้งานใหม่: ${newUser.fullName} (${newUser.email}) บทบาท ${newUser.role}`,
    });

    res.status(201).json(newUser);
  });

  app.get('/api/admin/activities', (req: Request, res: Response) => {
    res.json(db.getAllActivities());
  });

  app.post('/api/admin/activities', (req: Request, res: Response) => {
    const { adminId, adminName, ...actData } = req.body;
    const newAct = db.createActivity(actData);

    db.logAdminAction({
      adminId: adminId || 'usr-admin-1',
      adminName: adminName || 'Admin',
      action: 'Create Activity',
      targetType: 'activity',
      targetId: newAct.id,
      description: `สร้างกิจกรรมใหม่: ${newAct.titleTh}`,
    });

    res.json(newAct);
  });

  app.put('/api/admin/activities/:id', (req: Request, res: Response) => {
    const { adminId, adminName, ...actData } = req.body;
    const updated = db.updateActivity(req.params.id, actData);
    if (!updated) return res.status(404).json({ error: 'Activity not found' });

    db.logAdminAction({
      adminId: adminId || 'usr-admin-1',
      adminName: adminName || 'Admin',
      action: 'Edit Activity',
      targetType: 'activity',
      targetId: updated.id,
      description: `แก้ไขกิจกรรม: ${updated.titleTh}`,
    });

    res.json(updated);
  });

  app.delete('/api/admin/activities/:id', (req: Request, res: Response) => {
    const { adminId, adminName } = req.body;
    const act = db.getActivityById(req.params.id);
    const deleted = db.deleteActivity(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Activity not found' });

    db.logAdminAction({
      adminId: adminId || 'usr-admin-1',
      adminName: adminName || 'Admin',
      action: 'Delete Activity',
      targetType: 'activity',
      targetId: req.params.id,
      description: `ลบกิจกรรม: ${act?.titleTh || req.params.id}`,
    });

    res.json({ success: true });
  });

  app.get('/api/admin/audit-logs', (req: Request, res: Response) => {
    const { action, search } = req.query;
    const logs = db.getAdminAuditLogs({ action: action as string, search: search as string });
    res.json(logs);
  });

  app.get('/api/admin/system-status', (req: Request, res: Response) => {
    const status = db.getSystemStatus();
    res.json(status);
  });

  app.get('/api/admin/alerts', (req: Request, res: Response) => {
    res.json(db.getAdminAlerts());
  });

  app.put('/api/admin/alerts/:id/read', (req: Request, res: Response) => {
    const alert = db.markAlertAsRead(req.params.id);
    res.json(alert);
  });

  app.put('/api/admin/settings', (req: Request, res: Response) => {
    const { adminId, adminName, ...settings } = req.body;
    const updated = db.updateSettings(settings);

    db.logAdminAction({
      adminId: adminId || 'usr-admin-1',
      adminName: adminName || 'Admin',
      action: 'Change Settings',
      targetType: 'settings',
      description: 'แก้ไขค่าคอนฟิกูเรชันระบบและ Analytics Thresholds',
    });

    res.json(updated);
  });

  // ===================== EXPORT CSV & SCHEMA =====================
  app.get('/api/export/csv/:type', (req: Request, res: Response) => {
    const type = req.params.type as any;
    const csvContent = db.generateCSV(type);

    db.logAdminAction({
      adminId: 'usr-admin-1',
      adminName: 'Admin',
      action: 'Export Report',
      targetType: 'report',
      description: `ส่งออกไฟล์รายงาน CSV: ${type}.csv`,
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${type}_${Date.now()}.csv"`);
    // Add UTF-8 BOM so Excel opens Thai characters correctly
    res.send('\uFEFF' + csvContent);
  });

  app.get('/api/export/schema.sql', (req: Request, res: Response) => {
    const sqlPath = path.join(process.cwd(), 'supabase_migration.sql');
    if (fs.existsSync(sqlPath)) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="supabase_migration.sql"');
      res.sendFile(sqlPath);
    } else {
      res.status(404).send('Migration file not found');
    }
  });

  // ===================== VITE MIDDLEWARE (DEV VS PROD) =====================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Activity Match Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

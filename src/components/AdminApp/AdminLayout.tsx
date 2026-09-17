import React, { useState, useEffect } from 'react';
import { AdminTab, User } from '../../types';
import { AdminSidebar } from './AdminSidebar';
import { AdminDashboardView } from './AdminDashboardView';
import { AdminAnalyticsView } from './AdminAnalyticsView';
import { AdminLiveUsersView } from './AdminLiveUsersView';
import { AdminMembersView } from './AdminMembersView';
import { AdminActivitiesView } from './AdminActivitiesView';
import { AdminCategoriesView } from './AdminCategoriesView';
import { AdminActivityHistoryView } from './AdminActivityHistoryView';
import { AdminRecommendationsView } from './AdminRecommendationsView';
import { AdminReportsView } from './AdminReportsView';
import { AdminNotificationsView } from './AdminNotificationsView';
import { AdminAuditLogsView } from './AdminAuditLogsView';
import { AdminSystemStatusView } from './AdminSystemStatusView';
import { AdminSettingsView } from './AdminSettingsView';
import { AdminManagementView } from './AdminManagementView';
import { api } from '../../services/api';
import { ShieldCheck, LogIn } from 'lucide-react';

interface AdminLayoutProps {
  currentUser: User | null;
  onExitAdmin: () => void;
  onOpenAuth: () => void;
  onAuthSuccess?: (user: User) => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentUser,
  onExitAdmin,
  onOpenAuth,
  onAuthSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [onlineCount, setOnlineCount] = useState(1);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const [quickLoading, setQuickLoading] = useState(false);

  const handleQuickAdmin = async (email: string, pass: string) => {
    setQuickLoading(true);
    try {
      const res = await api.login(email, pass);
      if (onAuthSuccess) {
        onAuthSuccess(res.user);
      } else {
        window.location.reload();
      }
    } catch (e) {
      onOpenAuth();
    } finally {
      setQuickLoading(false);
    }
  };

  // Poll online count and unread alerts
  useEffect(() => {
    const updateStats = async () => {
      try {
        const live = await api.getLiveUsers();
        setOnlineCount(live.onlineCount);

        const alerts = await api.getAlerts();
        setUnreadAlerts(alerts.filter((a) => !a.isRead).length);
      } catch (e) {
        console.error(e);
      }
    };
    updateStats();
    const timer = setInterval(updateStats, 10000);
    return () => clearInterval(timer);
  }, []);

  // Track page change inside admin
  useEffect(() => {
    api.trackPageView(`/admin/${activeTab}`);
  }, [activeTab]);

  // If user is not logged in as admin, show login prompt
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 max-w-md w-full text-center shadow-xl">
          <div className="w-16 h-16 rounded-3xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">ต้องเข้าสู่ระบบด้วยบัญชีผู้ดูแลระบบ</h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            หน้านี้สงวนไว้สำหรับผู้ดูแลระบบ (Admin) เท่านั้น คุณสามารถกด 1-Click เพื่อเข้าสู่ระบบด้วยบัญชี Admin ได้ทันที
          </p>
          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => handleQuickAdmin('chalinrat15@gmail.com', '123456')}
              disabled={quickLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              ⚡ เข้าสู่ระบบ Admin (Chalinrat)
            </button>
            <button
              onClick={() => handleQuickAdmin('admin@activitymatch.com', 'admin123')}
              disabled={quickLoading}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              เข้าสู่ระบบ Admin กลาง (admin@activitymatch.com)
            </button>
            <button
              onClick={onOpenAuth}
              className="w-full py-2 text-blue-600 hover:underline text-xs font-medium cursor-pointer"
            >
              กรอกอีเมลและรหัสผ่านอื่น
            </button>
            <button
              onClick={onExitAdmin}
              className="w-full mt-2 py-2 text-slate-400 hover:text-slate-600 text-xs transition-colors cursor-pointer"
            >
              ← กลับไปยังหน้าผู้ใช้ทั่วไป
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-slate-100/70">
      {/* Sidebar Navigation */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onlineCount={onlineCount}
        unreadAlertsCount={unreadAlerts}
        currentUser={currentUser}
        onExitAdmin={onExitAdmin}
      />

      {/* Main Admin Content View */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {activeTab === 'dashboard' && <AdminDashboardView onNavigateTab={setActiveTab} />}
        {activeTab === 'analytics' && <AdminAnalyticsView />}
        {activeTab === 'live-users' && <AdminLiveUsersView />}
        {activeTab === 'members' && <AdminMembersView />}
        {activeTab === 'activities' && <AdminActivitiesView />}
        {activeTab === 'categories' && <AdminCategoriesView />}
        {activeTab === 'activity-history' && <AdminActivityHistoryView />}
        {activeTab === 'recommendations' && <AdminRecommendationsView />}
        {activeTab === 'reports' && <AdminReportsView />}
        {activeTab === 'notifications' && <AdminNotificationsView />}
        {activeTab === 'audit-logs' && <AdminAuditLogsView />}
        {activeTab === 'system-status' && <AdminSystemStatusView />}
        {activeTab === 'settings' && <AdminSettingsView />}
        {activeTab === 'admin-management' && <AdminManagementView />}
      </main>
    </div>
  );
};

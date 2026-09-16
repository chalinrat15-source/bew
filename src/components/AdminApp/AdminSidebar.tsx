import React from 'react';
import {
  LayoutDashboard,
  LineChart,
  Radio,
  Users,
  Compass,
  Layers,
  History,
  Sparkles,
  FileDown,
  Bell,
  ShieldAlert,
  Server,
  Settings,
  UserCog,
  LogOut,
  CheckCircle2,
} from 'lucide-react';
import { AdminTab, User } from '../../types';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onlineCount: number;
  unreadAlertsCount: number;
  currentUser: User | null;
  onExitAdmin: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  onlineCount,
  unreadAlertsCount,
  currentUser,
  onExitAdmin,
}) => {
  const menuItems: { id: AdminTab; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    { id: 'dashboard', label: 'ภาพรวมหลัก (Dashboard)', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'analytics', label: 'สถิติเชิงลึก (Analytics)', icon: <LineChart className="w-4 h-4" /> },
    {
      id: 'live-users',
      label: 'ผู้ใช้ Real-time (Live Users)',
      icon: <Radio className="w-4 h-4 text-emerald-500" />,
      badge: `${onlineCount}`,
    },
    { id: 'members', label: 'จัดการสมาชิก (Members)', icon: <Users className="w-4 h-4" /> },
    { id: 'activities', label: 'จัดการกิจกรรม (Activities)', icon: <Compass className="w-4 h-4" /> },
    { id: 'categories', label: 'จัดการหมวดหมู่ (Categories)', icon: <Layers className="w-4 h-4" /> },
    { id: 'activity-history', label: 'ประวัติการใช้งาน (History)', icon: <History className="w-4 h-4" /> },
    { id: 'recommendations', label: 'สถิติระบบแนะนำ (Recommendations)', icon: <Sparkles className="w-4 h-4 text-amber-500" /> },
    { id: 'reports', label: 'ส่งออกรายงาน (Reports & CSV)', icon: <FileDown className="w-4 h-4" /> },
    {
      id: 'notifications',
      label: 'การแจ้งเตือน (Notifications)',
      icon: <Bell className="w-4 h-4" />,
      badge: unreadAlertsCount > 0 ? unreadAlertsCount : undefined,
    },
    { id: 'audit-logs', label: 'บันทึกการทำงาน (Audit Logs)', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'system-status', label: 'สถานะระบบ (System Status)', icon: <Server className="w-4 h-4" /> },
    { id: 'settings', label: 'ตั้งค่าระบบ (Settings & SQL)', icon: <Settings className="w-4 h-4" /> },
    { id: 'admin-management', label: 'จัดการผู้ดูแล (Admins)', icon: <UserCog className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] border-r border-slate-800">
      {/* Top Admin Badge */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-blue-400">
            Admin Control Center
          </span>
          <p className="text-xs font-semibold text-white truncate">{currentUser?.fullName || 'ผู้ดูแลระบบ'}</p>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live Sync</span>
        </div>
      </div>

      {/* Menu Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {item.icon}
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <button
          onClick={onExitAdmin}
          className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>กลับไปยังหน้าผู้ใช้ทั่วไป</span>
        </button>
      </div>
    </aside>
  );
};

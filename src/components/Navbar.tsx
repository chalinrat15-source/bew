import React from 'react';
import {
  Compass,
  LayoutDashboard,
  User as UserIcon,
  LogOut,
  LogIn,
  Activity as ActivityIcon,
  ShieldCheck,
  Radio,
  Bookmark,
  Sparkles,
  SlidersHorizontal,
  UserPlus,
} from 'lucide-react';
import { User, AdminTab, UserTab } from '../types';

interface NavbarProps {
  currentView: 'user' | 'admin';
  onViewChange: (view: 'user' | 'admin') => void;
  user: User | null;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onLogout: () => void;
  userTab: UserTab;
  onUserTabChange: (tab: UserTab) => void;
  onOpenRecommend: () => void;
  adminTab: AdminTab;
  onlineCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  user,
  onOpenAuth,
  onLogout,
  userTab,
  onUserTabChange,
  onOpenRecommend,
  onlineCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onViewChange('user');
                onUserTabChange('home');
              }}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <span className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                  Activity Match
                  <span className="text-[11px] font-semibold uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    Live Analytics
                  </span>
                </span>
                <p className="text-xs text-slate-500 hidden sm:block">
                  ค้นหากิจกรรมที่ใช่ พร้อมระบบติดตามกิจกรรมผู้ใช้
                </p>
              </div>
            </button>
          </div>

          {/* User Nav Navigation (Visible in User View) */}
          {currentView === 'user' && (
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => onUserTabChange('home')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  userTab === 'home'
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                หน้าแรก (Home)
              </button>
              <button
                onClick={() => onUserTabChange('match')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  userTab === 'match'
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                ค้นหากิจกรรม (Match)
              </button>
              <button
                onClick={onOpenRecommend}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-blue-600" />
                แนะนำอัจฉริยะ
              </button>
              <button
                onClick={() => onUserTabChange('my-activities')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  userTab === 'my-activities'
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                กิจกรรมของฉัน
              </button>
              {user && (
                <button
                  onClick={() => onUserTabChange('dashboard')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    userTab === 'dashboard'
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <ActivityIcon className="w-4 h-4" />
                  สถิติส่วนตัว
                </button>
              )}
            </nav>
          )}

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">
            {/* Live Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Online: <strong>{onlineCount}</strong> คน</span>
            </div>

            {/* View Switcher: User vs Admin */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                id="btn-switch-user"
                onClick={() => onViewChange('user')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  currentView === 'user'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">โหมดผู้ใช้</span> (User)
              </button>
              <button
                id="btn-switch-admin"
                onClick={() => onViewChange('admin')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  currentView === 'admin'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ผู้ดูแลระบบ</span> (Admin)
              </button>
            </div>

            {/* User Account / Auth */}
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onViewChange('user');
                    onUserTabChange('profile');
                  }}
                  className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-left"
                >
                  <img
                    src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'}
                    alt={user.fullName}
                    className="w-7 h-7 rounded-full object-cover border border-slate-200"
                  />
                  <div className="hidden lg:block text-xs">
                    <p className="font-medium text-slate-800 leading-tight truncate max-w-[120px]">{user.fullName}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{user.role}</p>
                  </div>
                </button>
                <button
                  onClick={onLogout}
                  title="ออกจากระบบ"
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-500" />
                  <span>เข้าสู่ระบบ</span>
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-3 sm:px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>สมัครสมาชิก</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Clock,
  CheckCircle2,
  Flame,
  Bookmark,
  Heart,
  Layers,
  ArrowRight,
  LogIn,
  Sparkles,
  UserPlus,
} from 'lucide-react';
import { User, Activity, Category, UserActivityProgress } from '../../types';
import { api } from '../../services/api';

interface UserDashboardViewProps {
  user?: User | null;
  categories?: Category[];
  onGoToActivities?: () => void;
  onOpenRecommend?: () => void;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
}

export const UserDashboardView: React.FC<UserDashboardViewProps> = ({
  user,
  categories = [],
  onGoToActivities = () => {},
  onOpenRecommend = () => {},
  onOpenAuth = (_mode?: 'login' | 'register') => {},
}) => {
  const [history, setHistory] = useState<UserActivityProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await api.getUserProgressHistory();
        setHistory(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const completed = history.filter((h) => h.status === 'completed');
  const totalSeconds = completed.reduce((acc, c) => acc + (c.durationSeconds || 0), 0);
  const totalMinutes = Math.round(totalSeconds / 60);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-16">
      {/* Welcome Header */}
      <div className="bg-linear-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <span className="px-3 py-1 rounded-full bg-white/15 text-blue-200 text-xs font-semibold backdrop-blur-xs">
            สถิติและผลลัพธ์ส่วนบุคคล (Personal Activity Dashboard)
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
            สวัสดีคุณ {user ? user.fullName : 'ผู้เยี่ยมชม (Guest)'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-lg">
            ยินดีต้อนรับกลับมาสู่ระบบพัฒนาตนเองและคลายเครียดด้วยกิจกรรมที่ออกแบบเพื่อคุณ
          </p>

          {!user && (
            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-4 py-2 bg-white text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                เข้าสู่ระบบ
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-4 py-2 bg-blue-500 text-white rounded-xl text-xs font-bold hover:bg-blue-400 transition-colors flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                สมัครสมาชิกใหม่
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{completed.length}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">กิจกรรมที่ทำสำเร็จ (Completed)</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalMinutes}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">นาทีทั้งหมดที่ใช้ไป (Minutes)</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <Flame className="w-5 h-5" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {completed.length > 0 ? '3 วัน' : '0 วัน'}
          </p>
          <p className="text-xs text-slate-500 font-medium mt-1">ความต่อเนื่อง (Daily Streak)</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
            <Trophy className="w-5 h-5" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {completed.length > 5 ? 'ระดับเชี่ยวชาญ' : completed.length > 0 ? 'ผู้เริ่มต้น' : 'ยังไม่มีระดับ'}
          </p>
          <p className="text-xs text-slate-500 font-medium mt-1">ระดับความสำเร็จ (Level)</p>
        </div>
      </div>

      {/* History List */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">ประวัติกิจกรรมล่าสุด</h3>
            <p className="text-xs text-slate-500">กิจกรรมที่คุณเคยเริ่มทำหรือทำสำเร็จ</p>
          </div>
          <button
            onClick={onGoToActivities}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            ค้นหากิจกรรมใหม่
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">กำลังโหลดข้อมูล...</div>
        ) : history.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm font-semibold text-slate-700 mb-1">ยังไม่มีประวัติการทำกิจกรรม</p>
            <p className="text-xs text-slate-400 mb-4">
              เริ่มต้นเลือกกิจกรรมที่ชอบหรือใช้ระบบ AI ช่วยเจนคำแนะนำ
            </p>
            <button
              onClick={onOpenRecommend}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              รับคำแนะนำกิจกรรม
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {history.map((item) => (
              <div key={item.id} className="py-3.5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{item.activityTitleTh}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(item.startedAt).toLocaleDateString('th-TH', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">
                    {Math.round(item.durationSeconds / 60)} นาที
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      item.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {item.status === 'completed' ? 'สำเร็จแล้ว' : 'กำลังทำ'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

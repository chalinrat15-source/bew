import React, { useState, useEffect } from 'react';
import {
  Users,
  Radio,
  Eye,
  UserPlus,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Download,
  Smartphone,
  Monitor,
  Tablet,
  TrendingUp,
  Flame,
  Activity as ActivityIcon,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { KPISummary, HourlySummary, DeviceAnalytics, PopularActivity, PopularCategory } from '../../types';
import { api } from '../../services/api';

interface AdminDashboardViewProps {
  onNavigateTab: (tab: any) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onNavigateTab }) => {
  const [kpis, setKpis] = useState<KPISummary | null>(null);
  const [visitorPeriod, setVisitorPeriod] = useState<string>('7days');
  const [visitorChartData, setVisitorChartData] = useState<any[]>([]);
  const [hourly, setHourly] = useState<HourlySummary | null>(null);
  const [devices, setDevices] = useState<DeviceAnalytics | null>(null);
  const [popularActs, setPopularActs] = useState<PopularActivity[]>([]);
  const [popularCats, setPopularCats] = useState<PopularCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const loadAll = async () => {
    setLoading(true);
    try {
      const [k, v, h, d, pa, pc] = await Promise.all([
        api.getDashboardSummary(),
        api.getVisitorChart(visitorPeriod),
        api.getHourly(),
        api.getDevices(),
        api.getPopularActivities(),
        api.getPopularCategories(),
      ]);
      setKpis(k);
      setVisitorChartData(v);
      setHourly(h);
      setDevices(d);
      setPopularActs(pa);
      setPopularCats(pc);
      setLastRefreshed(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 15000); // Auto-refresh every 15s
    return () => clearInterval(interval);
  }, [visitorPeriod]);

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            ภาพรวมระบบและสถิติหลัก (Dashboard Overview)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
            <span>ข้อมูล Real-Time บันทึกลง Online Database</span>
            <span>•</span>
            <span>อัปเดตล่าสุด: {lastRefreshed.toLocaleTimeString('th-TH')}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={loadAll}
            className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            รีเฟรชข้อมูล
          </button>
          <a
            href={api.getExportCsvUrl('analytics')}
            download
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            ส่งออกสรุป CSV
          </a>
        </div>
      </div>

      {/* 8 Primary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* 1. Total Users */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">จำนวนผู้ใช้งานทั้งหมด</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{kpis?.totalUsers ?? '...'}</p>
          <p className="text-[11px] text-slate-400 mt-1">สมาชิกในระบบและผู้เข้าชม</p>
        </div>

        {/* 2. Online Now with live pulse */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-2xs bg-linear-to-br from-white to-emerald-50/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-800">กำลังออนไลน์ (Online Now)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <p className="text-2xl font-black text-emerald-700">{kpis?.onlineNow ?? '...'}</p>
            <span className="text-xs text-emerald-600 font-medium">คน</span>
          </div>
          <button
            onClick={() => onNavigateTab('live-users')}
            className="text-[11px] text-emerald-600 hover:text-emerald-800 font-semibold mt-1 flex items-center gap-0.5"
          >
            ดูผู้ใช้สด Real-time &rarr;
          </button>
        </div>

        {/* 3. Visitors Today */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">ผู้เข้าชมวันนี้ (Visitors)</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{kpis?.visitorsToday ?? '...'}</p>
          <p className="text-[11px] text-slate-400 mt-1">Unique Users ที่ Active วันนี้</p>
        </div>

        {/* 4. New Members Today */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">สมาชิกใหม่วันนี้</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">+{kpis?.newMembersToday ?? 0}</p>
          <p className="text-[11px] text-slate-400 mt-1">ลงทะเบียนในรอบ 24 ชม.</p>
        </div>

        {/* 5. Returning Members */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">สมาชิกเดิมที่กลับมา</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{kpis?.returningMembers ?? '...'}</p>
          <p className="text-[11px] text-slate-400 mt-1">เข้าสู่ระบบซ้ำ (Retention)</p>
        </div>

        {/* 6. Recommendations Today */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">คำแนะนำที่ถูกสร้างวันนี้</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{kpis?.recommendationsToday ?? '...'}</p>
          <p className="text-[11px] text-slate-400 mt-1">ครั้งที่กดขอคำแนะนำ</p>
        </div>

        {/* 7. Completed Activities */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">กิจกรรมที่ทำสำเร็จทั้งหมด</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{kpis?.completedActivities ?? '...'}</p>
          <p className="text-[11px] text-slate-400 mt-1">เสร็จสิ้นตามเวลาจริง</p>
        </div>

        {/* 8. Average Session Duration */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">เวลาเฉลี่ยต่อ Session</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{kpis?.averageSessionDuration ?? '...'}</p>
          <p className="text-[11px] text-slate-400 mt-1">เฉลี่ย {kpis?.sessionsPerUser || '1.8'} ครั้ง/คน</p>
        </div>
      </div>

      {/* Primary Chart: Visitor Analytics */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              สถิติผู้เข้าชมเว็บไซต์ (Visitor Overview)
            </h2>
            <p className="text-xs text-slate-500">
              เปรียบเทียบผู้เข้าชมรายวัน ผู้เข้าชมใหม่ และสมาชิกที่เข้าใช้งาน
            </p>
          </div>

          {/* Period selector */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto text-xs">
            {[
              { id: 'today', label: 'วันนี้' },
              { id: '7days', label: '7 วัน' },
              { id: '30days', label: '30 วัน' },
              { id: '3months', label: '3 เดือน' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setVisitorPeriod(p.id)}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  visitorPeriod === p.id
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={visitorChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Area
                type="monotone"
                dataKey="visitors"
                name="ผู้เข้าชมทั้งหมด"
                stroke="#3b82f6"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorVisitors)"
              />
              <Area
                type="monotone"
                dataKey="members"
                name="สมาชิกที่มีบัญชี"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorMembers)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: 24h Hourly Distribution & Device Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 24-Hour Active Users Distribution */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                ช่วงเวลาที่มีผู้ใช้งานมากที่สุด (Active Users by Time)
              </h3>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                Peak: {hourly?.peakHourRange || '18:00 - 22:00 น.'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">{hourly?.summaryText}</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourly?.hours || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} interval={1} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="users" name="จำนวนผู้ใช้" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
              <Smartphone className="w-4 h-4 text-blue-600" />
              สัดส่วนอุปกรณ์ (Device Usage)
            </h3>
            <p className="text-xs text-slate-500 mb-4">จำแนกตามมือถือ, คอมพิวเตอร์ และแท็บเล็ต</p>
          </div>

          <div className="h-44 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={devices?.devices || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                >
                  {devices?.devices?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend items */}
          <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-100">
            {devices?.devices?.map((d) => (
              <div key={d.name} className="p-2 rounded-xl bg-slate-50">
                <p className="text-xs text-slate-500 font-medium">{d.name}</p>
                <p className="text-sm font-black text-slate-900 mt-0.5">{d.value}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Activities Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-500" />
              กิจกรรมยอดนิยม (Popular Activities)
            </h3>
            <p className="text-xs text-slate-500">
              วิเคราะห์จำนวนการดู, การเริ่มทำ, การทำสำเร็จ และอัตราความสำเร็จ (Completion Rate)
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('activities')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 self-start sm:self-auto"
          >
            จัดการกิจกรรม &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                <th className="py-3 px-3">ชื่อกิจกรรม</th>
                <th className="py-3 px-3">หมวดหมู่</th>
                <th className="py-3 px-3 text-center">เข้าดู (Views)</th>
                <th className="py-3 px-3 text-center">เริ่มทำ (Starts)</th>
                <th className="py-3 px-3 text-center">สำเร็จ (Completed)</th>
                <th className="py-3 px-3 text-center">บันทึก (Saved)</th>
                <th className="py-3 px-3 text-right">ความสำเร็จ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {popularActs.slice(0, 5).map((act) => (
                <tr key={act.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-800">{act.title}</td>
                  <td className="py-3 px-3 text-slate-500">{act.category}</td>
                  <td className="py-3 px-3 text-center font-bold text-slate-700">{act.views}</td>
                  <td className="py-3 px-3 text-center font-bold text-blue-600">{act.starts}</td>
                  <td className="py-3 px-3 text-center font-bold text-emerald-600">{act.completed}</td>
                  <td className="py-3 px-3 text-center font-bold text-amber-600">{act.saved}</td>
                  <td className="py-3 px-3 text-right">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                      {act.completionRate}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Globe,
  MapPin,
  FileText,
  Smartphone,
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { DeviceAnalytics, TrafficAnalytics, PopularPage } from '../../types';
import { api } from '../../services/api';

export const AdminAnalyticsView: React.FC = () => {
  const [scale, setScale] = useState<string>('daily');
  const [growthData, setGrowthData] = useState<any[]>([]);
  const [devices, setDevices] = useState<DeviceAnalytics | null>(null);
  const [traffic, setTraffic] = useState<TrafficAnalytics | null>(null);
  const [popularPages, setPopularPages] = useState<PopularPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [g, d, t, p] = await Promise.all([
          api.getUserGrowth(scale),
          api.getDevices(),
          api.getTraffic(),
          api.getPopularPages(),
        ]);
        setGrowthData(g);
        setDevices(d);
        setTraffic(t);
        setPopularPages(p);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [scale]);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          สถิติการใช้งานเว็บไซต์เชิงลึก (Deep Analytics)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          วิเคราะห์อัตราการเติบโตของผู้ใช้ พฤติกรรมการเข้าชม อุปกรณ์ ระบบปฏิบัติการ และแหล่งที่มา
        </p>
      </div>

      {/* User Growth Chart (DAU/WAU/MAU) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              การเติบโตและการมีส่วนร่วมของผู้ใช้ (User Growth & Active Trends)
            </h2>
            <p className="text-xs text-slate-500">
              ติดตาม DAU (Daily Active Users), WAU (Weekly) และ MAU (Monthly)
            </p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto text-xs">
            {[
              { id: 'daily', label: 'รายวัน (Daily)' },
              { id: 'weekly', label: 'รายสัปดาห์ (Weekly)' },
              { id: 'monthly', label: 'รายเดือน (Monthly)' },
              { id: 'yearly', label: 'รายปี (Yearly)' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setScale(s.id)}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  scale === s.id
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} />
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
              <Bar dataKey="activeUsers" name="ผู้ใช้งานประจำ (Active Users)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="newUsers" name="ผู้ใช้ใหม่ (New Users)" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Operating Systems & Browsers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Operating Systems */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-purple-600" />
            ระบบปฏิบัติการ (Operating Systems)
          </h3>
          <div className="space-y-3">
            {devices?.operatingSystems.map((os) => (
              <div key={os.name} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>{os.name}</span>
                  <span>{os.value}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${os.value}%`, backgroundColor: os.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Browsers */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-600" />
            เว็บบราวเซอร์ (Web Browsers)
          </h3>
          <div className="space-y-3">
            {devices?.browsers.map((b) => (
              <div key={b.name} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>{b.name}</span>
                  <span>{b.value}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${b.value}%`, backgroundColor: b.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Traffic & Geographic + Popular Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Geographic / Regions (Privacy-first) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-500" />
                พื้นที่และภาษาการเข้าชม (Geographic & Languages)
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                เก็บข้อมูลระดับภูมิภาคโดยไม่ละเมิดความเป็นส่วนตัว (Privacy-friendly)
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                ภูมิภาคยอดนิยม (Top Regions)
              </h4>
              <div className="space-y-2">
                {traffic?.regions.map((r) => (
                  <div key={r.region} className="flex items-center justify-between text-xs py-1 border-b border-slate-50">
                    <span className="font-semibold text-slate-800">{r.region}</span>
                    <span className="font-mono text-slate-500">{r.users} คน ({r.percentage}%)</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                ภาษาที่ใช้งาน (Languages)
              </h4>
              <div className="flex gap-2">
                {traffic?.languages.map((l) => (
                  <div key={l.language} className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium">
                    <span className="font-bold text-slate-800">{l.language}</span>: {l.percentage}%
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Popular Pages Table */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-blue-600" />
            หน้าที่มีการเปิดดูสูงสุด (Popular Pages)
          </h3>
          <p className="text-xs text-slate-500 mb-4">จัดอันดับจากยอดการเปิดดู (Page Views)</p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                  <th className="py-2.5 px-2">เส้นทาง (Page)</th>
                  <th className="py-2.5 px-2 text-center">ยอดดู (Views)</th>
                  <th className="py-2.5 px-2 text-center">คนดู (Unique)</th>
                  <th className="py-2.5 px-2 text-right">เวลาเฉลี่ย</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {popularPages.map((page) => (
                  <tr key={page.path} className="hover:bg-slate-50">
                    <td className="py-2.5 px-2 font-medium text-slate-800">
                      <div>{page.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{page.path}</div>
                    </td>
                    <td className="py-2.5 px-2 text-center font-bold text-slate-800">{page.views}</td>
                    <td className="py-2.5 px-2 text-center font-medium text-slate-600">{page.uniqueViews}</td>
                    <td className="py-2.5 px-2 text-right text-slate-500">{page.avgTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

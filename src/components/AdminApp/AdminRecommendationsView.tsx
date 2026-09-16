import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  MousePointerClick,
  Play,
  CheckCircle2,
  Bookmark,
  TrendingUp,
  Percent,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { RecommendationAnalytics } from '../../types';
import { api } from '../../services/api';

export const AdminRecommendationsView: React.FC = () => {
  const [data, setData] = useState<RecommendationAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.getRecommendationAnalytics();
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          สถิติและประสิทธิภาพระบบแนะนำ (Recommendation Funnel)
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          ประเมินประสิทธิภาพ Conversion Funnel ของระบบแนะนำกิจกรรมอัจฉริยะแบบ Real-Time
        </p>
      </div>

      {/* Funnel Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">สร้างคำแนะนำ</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{data?.recommendationsGenerated ?? '...'}</p>
          <p className="text-[11px] text-slate-400 mt-1">ครั้งที่มีการประเมิน</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">คลิกดูรายละเอียด</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{data?.recommendationClicks ?? '...'}</p>
          <p className="text-[11px] text-slate-400 mt-1">CTR: {data?.clickRate || '0%'}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">เริ่มลงมือทำ</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Play className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{data?.activitiesStarted ?? '...'}</p>
          <p className="text-[11px] text-slate-400 mt-1">Start Rate: {data?.startRate || '0%'}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">ทำสำเร็จ</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{data?.activitiesCompleted ?? '...'}</p>
          <p className="text-[11px] text-slate-400 mt-1">Completion: {data?.completionRate || '0%'}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">บันทึกเก็บไว้</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{data?.savedRecommendations ?? '...'}</p>
          <p className="text-[11px] text-slate-400 mt-1">Save Rate: {data?.saveRate || '0%'}</p>
        </div>
      </div>

      {/* Visual Conversion Funnel Chart */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          ขั้นตอน Conversion Funnel
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          อัตราการเปลี่ยนผ่านตั้งแต่การเปิดคำแนะนำ &rarr; คลิกดูวิธีทำ &rarr; เริ่มกิจกรรม &rarr; ทำสำเร็จ
        </p>

        <div className="space-y-4 max-w-3xl">
          {[
            {
              stage: '1. สร้างและแสดงคำแนะนำ (Generated)',
              count: data?.recommendationsGenerated || 0,
              pct: 100,
              color: 'bg-purple-600',
            },
            {
              stage: '2. คลิกดูวิธีทำและขั้นตอน (CTR)',
              count: data?.recommendationClicks || 0,
              pct: data?.clickRate ? parseFloat(data.clickRate) : 0,
              color: 'bg-blue-600',
            },
            {
              stage: '3. เริ่มต้นทำกิจกรรมจริง (Start Activity)',
              count: data?.activitiesStarted || 0,
              pct: data?.startRate ? parseFloat(data.startRate) : 0,
              color: 'bg-indigo-600',
            },
            {
              stage: '4. ทำกิจกรรมสำเร็จครบถ้วน (Completed)',
              count: data?.activitiesCompleted || 0,
              pct: data?.completionRate ? parseFloat(data.completionRate) : 0,
              color: 'bg-emerald-600',
            },
            {
              stage: '5. บันทึกเก็บไว้ในรายการของฉัน (Saved)',
              count: data?.savedRecommendations || 0,
              pct: data?.saveRate ? parseFloat(data.saveRate) : 0,
              color: 'bg-amber-500',
            },
          ].map((step, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>{step.stage}</span>
                <span className="font-mono text-slate-900">
                  {step.count} ครั้ง ({step.pct}%)
                </span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${step.color}`}
                  style={{ width: `${Math.min(100, step.pct)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations by Category Breakdown */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-1">
          สัดส่วนการแนะนำตามหมวดหมู่ (Category Share)
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          หมวดหมู่ใดที่ผู้ใช้ได้รับการแนะนำมากที่สุดตามเวลา อารมณ์ และพลังงาน
        </p>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.categoryBreakdown || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="category" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip />
              <Bar dataKey="percentage" name="สัดส่วน (%)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

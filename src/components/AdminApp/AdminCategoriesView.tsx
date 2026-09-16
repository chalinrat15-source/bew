import React, { useState, useEffect } from 'react';
import {
  Layers,
  Sparkles,
  Eye,
  CheckCircle2,
  Bookmark,
  Play,
  TrendingUp,
} from 'lucide-react';
import { PopularCategory } from '../../types';
import { api } from '../../services/api';

export const AdminCategoriesView: React.FC = () => {
  const [categories, setCategories] = useState<PopularCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await api.getPopularCategories();
        setCategories(data);
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
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          วิเคราะห์และจัดการหมวดหมู่ (Categories Analytics)
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          สถิติความสนใจต่อแต่ละหมวดหมู่ การดู คำแนะนำ การเริ่มทำ และการทำสำเร็จ
        </p>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-slate-100 font-bold text-slate-800 text-xs">
                  {cat.percentage}% ของการเข้าชม
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-base">{cat.nameTh}</h3>
              <p className="text-xs text-slate-400 mb-4">{cat.name}</p>

              {/* Progress bar */}
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${cat.percentage}%` }}
                />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <div>
                    <p className="text-slate-400 text-[10px]">ยอดเข้าดู</p>
                    <p className="font-bold text-slate-900">{cat.views} ครั้ง</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <div>
                    <p className="text-slate-400 text-[10px]">แนะนำ</p>
                    <p className="font-bold text-slate-900">{cat.recommendations} ครั้ง</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 flex items-center gap-2">
                  <Play className="w-3.5 h-3.5 text-blue-500" />
                  <div>
                    <p className="text-slate-400 text-[10px]">เริ่มทำ</p>
                    <p className="font-bold text-slate-900">{cat.starts} ครั้ง</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <div>
                    <p className="text-slate-400 text-[10px]">ทำสำเร็จ</p>
                    <p className="font-bold text-slate-900">{cat.completions} ครั้ง</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Bookmark className="w-3.5 h-3.5 text-blue-500" />
                บันทึกเก็บไว้: {cat.saves} ครั้ง
              </span>
              <span className="text-[11px] font-semibold text-emerald-600">
                อัตราสำเร็จ {cat.starts > 0 ? Math.round((cat.completions / cat.starts) * 100) : 0}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

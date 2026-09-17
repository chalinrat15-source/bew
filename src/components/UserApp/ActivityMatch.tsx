import React, { useState, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  Clock,
  Zap,
  Bookmark,
  Heart,
  ArrowRight,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Activity, Category } from '../../types';
import { api } from '../../services/api';

interface ActivityMatchProps {
  categories: Category[];
  initialCategory?: string;
  onOpenActivityDetail: (activity: Activity) => void;
  onStartActivity: (activity: Activity) => void;
  savedIds: string[];
  favoriteIds: string[];
  onToggleSave: (activityId: string) => void;
  onToggleFavorite: (activityId: string) => void;
  onOpenRecommend: () => void;
}

export const ActivityMatch: React.FC<ActivityMatchProps> = ({
  categories,
  initialCategory,
  onOpenActivityDetail,
  onStartActivity,
  savedIds,
  favoriteIds,
  onToggleSave,
  onToggleFavorite,
  onOpenRecommend,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [selectedEnergy, setSelectedEnergy] = useState<string>('all');
  const [maxDuration, setMaxDuration] = useState<number | undefined>(undefined);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  // Synchronize when initialCategory changes
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const data = await api.getActivities({
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: search.trim() || undefined,
        energyLevel: selectedEnergy !== 'all' ? selectedEnergy : undefined,
        maxDuration: maxDuration,
      });
      setActivities(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [selectedCategory, selectedEnergy, maxDuration]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadActivities();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleReset = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedEnergy('all');
    setMaxDuration(undefined);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            ค้นหาและแมตช์กิจกรรม (Activity Matching)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            ค้นหากิจกรรมตามหมวดหมู่ เวลาว่าง และระดับพลังงาน พร้อมบันทึกพฤติกรรมการค้นหาจริง
          </p>
        </div>
        <button
          onClick={onOpenRecommend}
          className="self-start md:self-auto px-4 py-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          ผู้ช่วยแนะนำกิจกรรมอัตโนมัติ
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อกิจกรรม หรือคำอธิบาย เช่น อ่านหนังสือ, ออกกำลังกาย, ภาษา..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-3 text-xs text-slate-400 hover:text-slate-600"
            >
              ล้างคำค้น
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-2">หมวดหมู่กิจกรรม (Category)</label>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ทั้งหมด ({categories.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.nameTh}
              </button>
            ))}
          </div>
        </div>

        {/* Sub Filters: Energy & Duration */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Energy */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">ระดับพลังงาน:</span>
              <div className="flex bg-slate-100 p-0.5 rounded-lg">
                {[
                  { id: 'all', label: 'ทั้งหมด' },
                  { id: 'low', label: 'เบา (Low)' },
                  { id: 'medium', label: 'กลาง (Medium)' },
                  { id: 'high', label: 'สูง (High)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedEnergy(item.id)}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                      selectedEnergy === item.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Max Duration */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">เวลาสูงสุด:</span>
              <div className="flex bg-slate-100 p-0.5 rounded-lg">
                {[
                  { val: undefined, label: 'ไม่จำกัด' },
                  { val: 20, label: '≤ 20 นาที' },
                  { val: 30, label: '≤ 30 นาที' },
                  { val: 45, label: '≤ 45 นาที' },
                  { val: 60, label: '≤ 60 นาที' },
                ].map((d, i) => (
                  <button
                    key={i}
                    onClick={() => setMaxDuration(d.val)}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                      maxDuration === d.val ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            รีเซ็ตตัวกรอง
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div>
        <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
          <span>พบกิจกรรมทั้งหมด <strong>{activities.length}</strong> รายการ</span>
          {search && <span>ค้นหาคำว่า: &quot;{search}&quot;</span>}
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm">
            กำลังโหลดรายการกิจกรรม...
          </div>
        ) : activities.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8">
            <SlidersHorizontal className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-800 text-sm">ไม่พบกิจกรรมที่ตรงกับเงื่อนไข</p>
            <p className="text-xs text-slate-500 mt-1">ลองเปลี่ยนคำค้นหาหรือปรับระดับพลังงาน/เวลาใหม่</p>
            <button
              onClick={handleReset}
              className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition-colors"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activities.map((act) => {
              const isSaved = savedIds.includes(act.id);
              const isFav = favoriteIds.includes(act.id);
              const category = categories.find((c) => c.id === act.categoryId);

              return (
                <div
                  key={act.id}
                  className="bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className="px-2.5 py-0.5 rounded-md text-xs font-semibold text-white"
                        style={{ backgroundColor: category?.color || '#3b82f6' }}
                      >
                        {category?.nameTh || 'กิจกรรม'}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onToggleFavorite(act.id)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            isFav
                              ? 'bg-rose-50 border-rose-200 text-rose-600'
                              : 'bg-white border-slate-200 text-slate-400 hover:text-rose-500'
                          }`}
                          title="รายการโปรด"
                        >
                          <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500' : ''}`} />
                        </button>
                        <button
                          onClick={() => onToggleSave(act.id)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            isSaved
                              ? 'bg-blue-50 border-blue-200 text-blue-600'
                              : 'bg-white border-slate-200 text-slate-400 hover:text-blue-500'
                          }`}
                          title="บันทึกไว้"
                        >
                          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-blue-500' : ''}`} />
                        </button>
                      </div>
                    </div>

                    <h3
                      onClick={() => onOpenActivityDetail(act)}
                      className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors cursor-pointer line-clamp-1"
                    >
                      {act.titleTh}
                    </h3>
                    <p className="text-xs text-slate-400 mb-2">{act.title}</p>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                      {act.description}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 pt-3 border-t border-slate-100 mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {act.durationMinutes} นาที
                      </span>
                      <span className="flex items-center gap-1 capitalize">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        ระดับ: {act.energyLevel === 'low' ? 'เบา' : act.energyLevel === 'medium' ? 'ปานกลาง' : 'สูง'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onOpenActivityDetail(act)}
                        className="w-full py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-center"
                      >
                        ดูขั้นตอน
                      </button>
                      <button
                        onClick={() => onStartActivity(act)}
                        className="w-full py-2 px-3 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors text-center flex items-center justify-center gap-1"
                      >
                        เริ่มเลย
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

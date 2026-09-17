import React, { useState, useEffect } from 'react';
import {
  Bookmark,
  Heart,
  CheckCircle2,
  Clock,
  Zap,
  ArrowRight,
  Trash2,
  Calendar,
  Layers,
} from 'lucide-react';
import { Activity, Category, UserActivityProgress, UserSavedActivity } from '../../types';
import { api } from '../../services/api';

interface MyActivitiesViewProps {
  categories: Category[];
  onOpenActivityDetail: (activity: Activity) => void;
  onStartActivity: (activity: Activity) => void;
  onToggleSave: (activityId: string) => void;
  onToggleFavorite: (activityId: string) => void;
  onOpenRecommend: () => void;
}

export const MyActivitiesView: React.FC<MyActivitiesViewProps> = ({
  categories,
  onOpenActivityDetail,
  onStartActivity,
  onToggleSave,
  onToggleFavorite,
  onOpenRecommend,
}) => {
  const [activeTab, setActiveTab] = useState<'saved' | 'favorites' | 'history'>('saved');
  const [savedItems, setSavedItems] = useState<UserSavedActivity[]>([]);
  const [historyItems, setHistoryItems] = useState<UserActivityProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [saved, history] = await Promise.all([
        api.getSavedActivities(),
        api.getUserProgressHistory(),
      ]);
      setSavedItems(saved);
      setHistoryItems(history);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const savedList = savedItems.filter((s) => s.isSaved && s.activity);
  const favoriteList = savedItems.filter((s) => s.isFavorite && s.activity);
  const completedList = historyItems.filter((h) => h.status === 'completed' && h.activity);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs} วินาที`;
    return `${mins} นาที ${secs > 0 ? `${secs} วิ` : ''}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-20">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            กิจกรรมของฉัน (My Activities)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            จัดการกิจกรรมที่บันทึกไว้ รายการโปรด และประวัติกิจกรรมที่คุณทำสำเร็จ
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'saved'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-blue-600" />
            บันทึกไว้ ({savedList.length})
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'favorites'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            รายการโปรด ({favoriteList.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ประวัติทำสำเร็จ ({completedList.length})
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">กำลังโหลดข้อมูล...</div>
      ) : activeTab === 'saved' ? (
        savedList.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8">
            <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-base">ยังไม่มีกิจกรรมที่บันทึกไว้</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              เมื่อคุณเจอกิจกรรมที่น่าสนใจ สามารถกดปุ่มบันทึกเพื่อเก็บไว้ทำในเวลาว่างได้ตลอดเวลา
            </p>
            <button
              onClick={onOpenRecommend}
              className="mt-4 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-colors"
            >
              ค้นหากิจกรรมแนะนำ
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedList.map((item) => {
              const act = item.activity!;
              const cat = categories.find((c) => c.id === act.categoryId);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between group hover:border-slate-300 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className="px-2.5 py-0.5 rounded text-[11px] font-semibold text-white"
                        style={{ backgroundColor: cat?.color || '#3b82f6' }}
                      >
                        {cat?.nameTh}
                      </span>
                      <button
                        onClick={async () => {
                          await onToggleSave(act.id);
                          loadData();
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
                        title="นำออกจากที่บันทึก"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h3
                      onClick={() => onOpenActivityDetail(act)}
                      className="font-bold text-slate-900 text-base hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      {act.titleTh}
                    </h3>
                    <p className="text-xs text-slate-400 mb-2">{act.title}</p>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {act.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {act.durationMinutes} นาที
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenActivityDetail(act)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                      >
                        วิธีทำ
                      </button>
                      <button
                        onClick={() => onStartActivity(act)}
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center gap-1"
                      >
                        เริ่ม
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : activeTab === 'favorites' ? (
        favoriteList.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8">
            <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-base">ยังไม่มีกิจกรรมรายการโปรด</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              กดหัวใจที่กิจกรรมเพื่อเพิ่มลงในรายการโปรดที่คุณชื่นชอบมากที่สุด
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoriteList.map((item) => {
              const act = item.activity!;
              const cat = categories.find((c) => c.id === act.categoryId);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between group hover:border-slate-300 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className="px-2.5 py-0.5 rounded text-[11px] font-semibold text-white"
                        style={{ backgroundColor: cat?.color || '#3b82f6' }}
                      >
                        {cat?.nameTh}
                      </span>
                      <button
                        onClick={async () => {
                          await onToggleFavorite(act.id);
                          loadData();
                        }}
                        className="p-1.5 text-rose-500 hover:text-slate-400 rounded-lg transition-colors"
                        title="นำออกจากรายการโปรด"
                      >
                        <Heart className="w-4 h-4 fill-rose-500" />
                      </button>
                    </div>

                    <h3
                      onClick={() => onOpenActivityDetail(act)}
                      className="font-bold text-slate-900 text-base hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      {act.titleTh}
                    </h3>
                    <p className="text-xs text-slate-400 mb-2">{act.title}</p>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {act.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {act.durationMinutes} นาที
                    </span>
                    <button
                      onClick={() => onStartActivity(act)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center gap-1"
                    >
                      เริ่มกิจกรรม
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Completed History Tab */
        completedList.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8">
            <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-base">ยังไม่มีประวัติกิจกรรมที่ทำสำเร็จ</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              ลองเลือกกิจกรรมและกด &quot;เริ่มกิจกรรม&quot; พร้อมจับเวลาทำจนเสร็จสิ้นเพื่อสะสมประวัติ
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {completedList.map((item) => {
              const act = item.activity!;
              const cat = categories.find((c) => c.id === act.categoryId);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-semibold text-white"
                          style={{ backgroundColor: cat?.color || '#3b82f6' }}
                        >
                          {cat?.nameTh}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(item.completedAt || item.startedAt).toLocaleDateString('th-TH', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base">{act.titleTh}</h4>
                      {item.notes && (
                        <p className="text-xs text-slate-500 italic mt-0.5">&quot;{item.notes}&quot;</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="text-right">
                      <p className="text-xs font-semibold text-slate-800">
                        {formatDuration(item.durationSeconds)}
                      </p>
                      <p className="text-[11px] text-slate-400">เวลาที่ใช้จริง</p>
                    </div>
                    <button
                      onClick={() => onStartActivity(act)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                    >
                      ทำซ้ำอีกครั้ง
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
};

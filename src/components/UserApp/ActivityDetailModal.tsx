import React from 'react';
import {
  X,
  Clock,
  Zap,
  Bookmark,
  Heart,
  ArrowRight,
  CheckCircle2,
  Package,
  ListOrdered,
  Share2,
} from 'lucide-react';
import { Activity, Category } from '../../types';

interface ActivityDetailModalProps {
  activity: Activity | null;
  onClose: () => void;
  categories: Category[];
  onStartActivity: (activity: Activity) => void;
  isSaved: boolean;
  isFavorite: boolean;
  onToggleSave: (activityId: string) => void;
  onToggleFavorite: (activityId: string) => void;
}

export const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
  activity,
  onClose,
  categories,
  onStartActivity,
  isSaved,
  isFavorite,
  onToggleSave,
  onToggleFavorite,
}) => {
  if (!activity) return null;

  const category = categories.find((c) => c.id === activity.categoryId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header Banner */}
        <div
          className="p-6 text-white relative"
          style={{ backgroundColor: category?.color || '#3b82f6' }}
        >
          <div className="flex items-center justify-between gap-4 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-xs">
              {category?.nameTh || 'กิจกรรม'}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onToggleFavorite(activity.id)}
                className={`p-2 rounded-full backdrop-blur-xs transition-colors ${
                  isFavorite ? 'bg-white text-rose-500' : 'bg-black/20 text-white hover:bg-white/30'
                }`}
                title="รายการโปรด"
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
              </button>
              <button
                onClick={() => onToggleSave(activity.id)}
                className={`p-2 rounded-full backdrop-blur-xs transition-colors ${
                  isSaved ? 'bg-white text-blue-600' : 'bg-black/20 text-white hover:bg-white/30'
                }`}
                title="บันทึกกิจกรรม"
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-blue-600' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-black/20 text-white hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight text-white">{activity.titleTh}</h2>
          <p className="text-xs text-white/80 mt-0.5">{activity.title}</p>

          <div className="flex items-center gap-4 text-xs font-medium text-white/90 mt-4">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              เวลาโดยประมาณ: <strong>{activity.durationMinutes} นาที</strong>
            </span>
            <span className="flex items-center gap-1.5 capitalize">
              <Zap className="w-4 h-4 text-amber-300" />
              ระดับพลังงาน: <strong>{activity.energyLevel === 'low' ? 'เบา (Low)' : activity.energyLevel === 'medium' ? 'ปานกลาง' : 'สูง'}</strong>
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Description */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              คำอธิบายและประโยชน์ของกิจกรรม
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
              {activity.description}
            </p>
          </div>

          {/* Equipment */}
          {activity.equipment && activity.equipment.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                <Package className="w-4 h-4 text-blue-600" />
                อุปกรณ์หรือสิ่งที่ต้องเตรียม (Equipment Needed)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activity.equipment.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200/80 bg-white flex items-center gap-2 text-xs font-medium text-slate-700"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Steps */}
          {activity.steps && activity.steps.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                <ListOrdered className="w-4 h-4 text-blue-600" />
                ขั้นตอนการทำกิจกรรม (Step-by-Step Guide)
              </h3>
              <div className="space-y-2.5">
                {activity.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-white flex items-start gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {step.step || idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{step.title}</h4>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {step.durationMinutes} นาที
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{step.instruction}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition-colors"
          >
            ปิดหน้าต่าง
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onStartActivity(activity);
              }}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-blue-500/20 flex items-center gap-2"
            >
              <span>เริ่มทำกิจกรรมตอนนี้</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

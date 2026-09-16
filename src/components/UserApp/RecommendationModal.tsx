import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Clock,
  Zap,
  Bookmark,
  ArrowRight,
  CheckCircle2,
  Smile,
  BatteryCharging,
  Hourglass,
  Layers,
} from 'lucide-react';
import { Activity, Category } from '../../types';
import { api } from '../../services/api';

interface RecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onStartActivity: (activity: Activity) => void;
  onOpenActivityDetail: (activity: Activity) => void;
  savedIds: string[];
  onToggleSave: (activityId: string) => void;
}

export const RecommendationModal: React.FC<RecommendationModalProps> = ({
  isOpen,
  onClose,
  categories,
  onStartActivity,
  onOpenActivityDetail,
  savedIds,
  onToggleSave,
}) => {
  const [mood, setMood] = useState('stressed');
  const [availableTime, setAvailableTime] = useState(30);
  const [energyLevel, setEnergyLevel] = useState('low');
  const [categoryPref, setCategoryPref] = useState('any');
  const [results, setResults] = useState<{ activity: Activity; matchScore: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      const data = await api.generateRecommendations({
        mood,
        availableTime,
        energyLevel,
        categoryPreference: categoryPref,
      });
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setHasSearched(false);
    setResults([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-xs">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">ระบบแนะนำกิจกรรมอัจฉริยะ</h2>
              <p className="text-xs text-blue-100">
                ประเมินความพร้อมและรับคำแนะนำที่ตรงกับความต้องการของคุณทันที
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!hasSearched ? (
            <div className="space-y-6">
              {/* Question 1: Mood */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                  <Smile className="w-4 h-4 text-blue-600" />
                  1. ตอนนี้คุณรู้สึกอย่างไร? (Current Mood)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'stressed', label: 'เครียด / อยากผ่อนคลาย', desc: 'ต้องการความสงบ นิ่ง และฟื้นฟูพลัง' },
                    { id: 'energized', label: 'สดชื่น / มีพลังงานเหลือล้น', desc: 'พร้อมเคลื่อนไหวหรือออกกำลังกาย' },
                    { id: 'curious', label: 'อยากเรียนรู้สิ่งใหม่', desc: 'เปิดรับความรู้ ภาษา และทักษะ' },
                    { id: 'creative', label: 'อยากปลดปล่อยจินตนาการ', desc: 'ศิลปะ ดนตรี ทำอาหาร งานอดิเรก' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMood(m.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        mood === m.id
                          ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-1 ring-blue-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <p className={`text-xs font-bold ${mood === m.id ? 'text-blue-700' : 'text-slate-800'}`}>
                        {m.label}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{m.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 2: Available Time */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                  <Hourglass className="w-4 h-4 text-blue-600" />
                  2. มีเวลาว่างเท่าไรในตอนนี้? (Available Time)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { val: 15, label: '15 นาที', sub: 'สั้นกระชับ' },
                    { val: 30, label: '30 นาที', sub: 'กำลังพอดี' },
                    { val: 45, label: '45 นาที', sub: 'ทำได้ต่อเนื่อง' },
                    { val: 60, label: '60+ นาที', sub: 'เจาะลึกเต็มที่' },
                  ].map((t) => (
                    <button
                      key={t.val}
                      type="button"
                      onClick={() => setAvailableTime(t.val)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        availableTime === t.val
                          ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-1 ring-blue-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <p className={`text-xs font-bold ${availableTime === t.val ? 'text-blue-700' : 'text-slate-800'}`}>
                        {t.label}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{t.sub}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 3: Energy Level */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                  <BatteryCharging className="w-4 h-4 text-blue-600" />
                  3. ระดับพลังงานที่ต้องการใช้ (Energy Level)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'low', label: 'เบาๆ สบายๆ (Low)', desc: 'ไม่ต้องใช้แรงมาก ผ่อนคลาย' },
                    { id: 'medium', label: 'ปานกลาง (Medium)', desc: 'เคลื่อนไหวพอเหมาะ' },
                    { id: 'high', label: 'เต็มที่จริงจัง (High)', desc: 'ท้าทาย ใช้พลังงานเต็มที่' },
                  ].map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => setEnergyLevel(e.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        energyLevel === e.id
                          ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-1 ring-blue-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <p className={`text-xs font-bold ${energyLevel === e.id ? 'text-blue-700' : 'text-slate-800'}`}>
                        {e.label}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{e.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 4: Category (Optional) */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                  <Layers className="w-4 h-4 text-blue-600" />
                  4. เจาะจงหมวดหมู่เป็นพิเศษหรือไม่? (Optional)
                </label>
                <select
                  value={categoryPref}
                  onChange={(e) => setCategoryPref(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 bg-white"
                >
                  <option value="any">ให้ระบบช่วยเลือก (Any category / AI Select)</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameTh} ({c.name})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-3 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                คำนวณและสร้างคำแนะนำกิจกรรม
              </button>
            </div>
          ) : (
            /* Results View */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    กิจกรรมที่คำนวณแล้วว่าเหมาะกับคุณที่สุด ({results.length} รายการ)
                  </h3>
                  <p className="text-xs text-slate-500">
                    บันทึก event `get_recommendation` ลง Online Database เรียบร้อยแล้ว
                  </p>
                </div>
                <button
                  onClick={handleReset}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  ประเมินใหม่
                </button>
              </div>

              <div className="space-y-3">
                {results.map(({ activity: act, matchScore }) => {
                  const isSaved = savedIds.includes(act.id);
                  const cat = categories.find((c) => c.id === act.categoryId);

                  return (
                    <div
                      key={act.id}
                      className="p-4 rounded-2xl border border-slate-200 hover:border-blue-300 bg-white hover:bg-blue-50/20 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="px-2 py-0.5 rounded text-[11px] font-semibold text-white"
                            style={{ backgroundColor: cat?.color || '#3b82f6' }}
                          >
                            {cat?.nameTh}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                            {matchScore}% Match
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                          {act.titleTh}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {act.description}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {act.durationMinutes} นาที
                          </span>
                          <span className="flex items-center gap-1">
                            <Zap className="w-3.5 h-3.5 text-amber-500" />
                            พลังงาน: {act.energyLevel === 'low' ? 'เบา' : act.energyLevel === 'medium' ? 'ปานกลาง' : 'สูง'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => onToggleSave(act.id)}
                          className={`p-2 rounded-xl border transition-colors ${
                            isSaved
                              ? 'bg-blue-50 border-blue-200 text-blue-600'
                              : 'bg-white border-slate-200 text-slate-400 hover:text-blue-500'
                          }`}
                          title="บันทึกกิจกรรม"
                        >
                          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-blue-500' : ''}`} />
                        </button>
                        <button
                          onClick={() => {
                            onClose();
                            onOpenActivityDetail(act);
                          }}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                        >
                          ดูวิธีทำ
                        </button>
                        <button
                          onClick={() => {
                            onClose();
                            onStartActivity(act);
                          }}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
                        >
                          เริ่มกิจกรรม
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

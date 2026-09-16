import React, { useState } from 'react';
import {
  Sparkles,
  Clock,
  Zap,
  Bookmark,
  Heart,
  ArrowRight,
  TrendingUp,
  Compass,
  CheckCircle2,
  BookOpen,
  HeartPulse,
  Palette,
  Music,
  UtensilsCrossed,
  Leaf,
  Code,
  Languages,
  Gamepad2,
  RefreshCw,
  Sliders,
  Filter,
} from 'lucide-react';
import { Activity, Category } from '../../types';
import { api } from '../../services/api';

interface UserHomeProps {
  categories?: Category[];
  activities?: Activity[];
  onSelectCategory?: (categoryId: string) => void;
  onOpenActivityDetail?: (activity: Activity) => void;
  onStartActivity?: (activity: Activity) => void;
  onOpenRecommend?: () => void;
  onGoToMatch?: () => void;
  savedIds?: string[];
  favoriteIds?: string[];
  onToggleSave?: (activityId: string) => void;
  onToggleFavorite?: (activityId: string) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  BookOpen: <BookOpen className="w-5 h-5" />,
  HeartPulse: <HeartPulse className="w-5 h-5" />,
  Sparkles: <Sparkles className="w-5 h-5" />,
  Palette: <Palette className="w-5 h-5" />,
  Music: <Music className="w-5 h-5" />,
  UtensilsCrossed: <UtensilsCrossed className="w-5 h-5" />,
  Leaf: <Leaf className="w-5 h-5" />,
  Code: <Code className="w-5 h-5" />,
  Languages: <Languages className="w-5 h-5" />,
  Gamepad2: <Gamepad2 className="w-5 h-5" />,
};

export const UserHome: React.FC<UserHomeProps> = ({
  categories = [],
  activities = [],
  onSelectCategory = (_id: string) => {},
  onOpenActivityDetail = (_act: Activity) => {},
  onStartActivity = (_act: Activity) => {},
  onOpenRecommend = () => {},
  onGoToMatch = () => {},
  savedIds = [],
  favoriteIds = [],
  onToggleSave = (_id: string) => {},
  onToggleFavorite = (_id: string) => {},
}) => {
  // Quick instant generator state on the front page
  const [quickMood, setQuickMood] = useState('stressed');
  const [quickTime, setQuickTime] = useState(30);
  const [quickEnergy, setQuickEnergy] = useState('low');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResults, setGeneratedResults] = useState<{ activity: Activity; matchScore: number }[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleQuickGenerate = async () => {
    setIsGenerating(true);
    setHasGenerated(true);
    try {
      const results = await api.generateRecommendations({
        mood: quickMood,
        availableTime: quickTime,
        energyLevel: quickEnergy,
      });
      setGeneratedResults(results);
    } catch (e) {
      console.error('Quick generate failed', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const safeActivities = activities || [];
  const safeCategories = categories || [];
  const featuredActivities = safeActivities.slice(0, 6);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 pb-20">
      {/* Hero Banner with Rich Deep Color Contrast */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-indigo-950 to-blue-900 text-white p-8 sm:p-12 shadow-2xl border border-slate-800">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-200 text-xs font-semibold mb-4 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-amber-300" />
            ระบบเจนและแนะนำกิจกรรมอัจฉริยะแบบ Real-Time
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            ค้นหากิจกรรมที่สร้างสรรค์ <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-300 via-sky-200 to-indigo-200">
              เติมเต็มพลังใจในทุกช่วงเวลา
            </span>
          </h1>
          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            ไม่รู้จะทำอะไรดีวันนี้? ให้ระบบ Activity Match แนะนำกิจกรรมที่เหมาะสมกับอารมณ์ ระดับพลังงาน และเวลาว่างของคุณ
            พร้อมระบบติดตามผลการใช้งานและการวิเคราะห์ข้อมูลแบบเรียลไทม์
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={onOpenRecommend}
              className="px-6 py-3.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              เริ่มแบบสอบถามและรับคำแนะนำ
            </button>
            <button
              onClick={onGoToMatch}
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl text-sm border border-white/20 transition-all flex items-center gap-2 backdrop-blur-sm cursor-pointer active:scale-95"
            >
              <Compass className="w-4 h-4 text-sky-300" />
              ค้นหากิจกรรมทั้งหมด ({safeActivities.length})
            </button>
          </div>
        </div>

        {/* Glowing visual ambient orbs */}
        <div className="absolute -right-16 -top-16 w-96 h-96 rounded-full bg-blue-500/25 blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-20 w-80 h-80 rounded-full bg-indigo-500/25 blur-3xl pointer-events-none" />
      </section>

      {/* QUICK INSTANT GENERATOR WIDGET (แก้ปัญหา "งานไม่เจน" ด้วยปุ่มเจนทันทีบนหน้าแรก) */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              ⚡ เจนกิจกรรมด่วนทันใจ (Quick AI Generator)
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              สุ่มและสร้างกิจกรรมที่เหมาะกับคุณตอนนี้ทันที
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              เลือกอารมณ์และเวลาว่างของคุณ แล้วกดปุ่มเพื่อให้ระบบคำนวณกิจกรรมที่เข้ากันได้ดีที่สุด
            </p>
          </div>

          <button
            onClick={handleQuickGenerate}
            disabled={isGenerating}
            className="px-6 py-3.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl text-sm transition-all shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'กำลังเจนกิจกรรม...' : '✨ เจนกิจกรรมที่ใช่ทันที'}
          </button>
        </div>

        {/* Generator Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          {/* Mood Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5">
              1. สภาพอารมณ์ตอนนี้
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'stressed', label: '😫 เครียด / ล้า' },
                { id: 'bored', label: '🥱 เบื่อ / ว่าง' },
                { id: 'motivated', label: '⚡ อยากลุย' },
                { id: 'calm', label: '🧘 อยากพักใจ' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setQuickMood(m.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-medium text-left border transition-all cursor-pointer ${
                    quickMood === m.id
                      ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5">
              2. มีเวลาว่างเท่าไหร่
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[15, 30, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setQuickTime(mins)}
                  className={`py-2 px-2 rounded-xl text-xs font-medium text-center border transition-all cursor-pointer ${
                    quickTime === mins
                      ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 mx-auto mb-1 text-slate-500" />
                  {mins} นาที
                </button>
              ))}
            </div>
          </div>

          {/* Energy Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5">
              3. ระดับพลังงาน
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'low', label: 'เบาๆ สบาย', icon: '🔋' },
                { id: 'medium', label: 'ปานกลาง', icon: '⚡' },
                { id: 'high', label: 'แอคทีฟสูง', icon: '🔥' },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => setQuickEnergy(lvl.id)}
                  className={`py-2 px-2 rounded-xl text-xs font-medium text-center border transition-all cursor-pointer ${
                    quickEnergy === lvl.id
                      ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="block text-sm mb-0.5">{lvl.icon}</span>
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results of Quick Generation */}
        {hasGenerated && (
          <div className="mt-8 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                กิจกรรมที่ระบบวิเคราะห์และเจนให้คุณ ({generatedResults.length} รายการ)
              </h3>
              <span className="text-xs text-slate-500">เรียงตามเปอร์เซ็นต์ความเข้ากัน</span>
            </div>

            {generatedResults.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-sm font-semibold text-slate-600">ไม่พบกิจกรรมที่ตรงเงื่อนไขพอดี</p>
                <button
                  onClick={onGoToMatch}
                  className="mt-2 text-xs text-blue-600 font-bold hover:underline"
                >
                  ค้นหากิจกรรมทั้งหมดในระบบ
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {generatedResults.map(({ activity, matchScore }) => {
                  const category = safeCategories.find((c) => c.id === activity.categoryId);
                  return (
                    <div
                      key={activity.id}
                      className="p-4 rounded-2xl bg-linear-to-b from-blue-50/50 to-slate-50 border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className="px-2 py-0.5 rounded-md text-[11px] font-semibold text-white"
                            style={{ backgroundColor: category?.color || '#3b82f6' }}
                          >
                            {category?.nameTh || 'กิจกรรม'}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800">
                            เข้ากัน {matchScore}%
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm line-clamp-1">
                          {activity.titleTh}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {activity.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                        <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {activity.durationMinutes} นาที
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onOpenActivityDetail(activity)}
                            className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                          >
                            วิธีทำ
                          </button>
                          <button
                            onClick={() => onStartActivity(activity)}
                            className="px-3 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          >
                            เริ่มเลย
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Explore Categories with Rich Colors & Icons */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">หมวดหมู่กิจกรรมยอดนิยม</h2>
            <p className="text-xs text-slate-500">เลือกหมวดหมู่เพื่อค้นหากิจกรรมที่ตรงใจคุณ</p>
          </div>
          <button
            onClick={onGoToMatch}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            ดูทั้งหมด ({safeCategories.length})
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
          {safeCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                onSelectCategory(cat.id);
                onGoToMatch();
              }}
              className="group p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition-all text-left flex flex-col justify-between cursor-pointer"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white mb-3 shadow-xs group-hover:scale-105 transition-transform"
                style={{ backgroundColor: cat.color }}
              >
                {iconMap[cat.icon] || <Compass className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                  {cat.nameTh}
                </p>
                <p className="text-[11px] text-slate-400">{cat.name}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Trending Activities */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">กิจกรรมแนะนำประจำวัน</h2>
              <p className="text-xs text-slate-500">กิจกรรมที่ผู้ใช้งานเริ่มทำและบอกต่อมากที่สุด</p>
            </div>
          </div>
          <button
            onClick={onGoToMatch}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            ดูกิจกรรมทั้งหมด
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredActivities.map((act) => {
            const isSaved = (savedIds || []).includes(act.id);
            const isFav = (favoriteIds || []).includes(act.id);
            const category = safeCategories.find((c) => c.id === act.categoryId);

            return (
              <div
                key={act.id}
                className="bg-white rounded-3xl border border-slate-200/90 hover:border-blue-300 p-5 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className="px-2.5 py-0.5 rounded-lg text-xs font-semibold text-white shadow-2xs"
                      style={{ backgroundColor: category?.color || '#3b82f6' }}
                    >
                      {category?.nameTh || 'กิจกรรม'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onToggleFavorite(act.id)}
                        className={`p-2 rounded-xl border transition-colors cursor-pointer ${
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
                        className={`p-2 rounded-xl border transition-colors cursor-pointer ${
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
                      พลังงาน: {act.energyLevel === 'low' ? 'เบา' : act.energyLevel === 'medium' ? 'ปานกลาง' : 'สูง'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onOpenActivityDetail(act)}
                      className="w-full py-2.5 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-center cursor-pointer"
                    >
                      ดูวิธีทำ
                    </button>
                    <button
                      onClick={() => onStartActivity(act)}
                      className="w-full py-2.5 px-3 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors text-center flex items-center justify-center gap-1 cursor-pointer"
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
      </section>

      {/* Real-Time Analytics Banner */}
      <section className="rounded-3xl bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 text-blue-300 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base sm:text-lg">
              ระบบวิเคราะห์ข้อมูลและ Event Tracking ทำงานแบบ Real-Time 100%
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              ทุกครั้งที่เปิดหน้าเว็บ ค้นหา ขอรับคำแนะนำ หรือบันทึกกิจกรรม ข้อมูลจะถูกเชื่อมโยงลง Database และแสดงผลใน Admin Dashboard ทันที
            </p>
          </div>
        </div>
        <button
          onClick={onOpenRecommend}
          className="shrink-0 px-5 py-3 bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-md"
        >
          เปิดแบบสอบถามแนะนำกิจกรรม
        </button>
      </section>
    </div>
  );
};

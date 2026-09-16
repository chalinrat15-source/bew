import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  CheckSquare,
  Square,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { Activity } from '../../types';
import { api } from '../../services/api';

interface ActiveSessionDrawerProps {
  activity: Activity | null;
  onClose: () => void;
  onComplete: () => void;
}

export const ActiveSessionDrawer: React.FC<ActiveSessionDrawerProps> = ({
  activity,
  onClose,
  onComplete,
}) => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  if (!activity) return null;

  const toggleStep = (stepIdx: number) => {
    if (completedSteps.includes(stepIdx)) {
      setCompletedSteps(completedSteps.filter((s) => s !== stepIdx));
    } else {
      setCompletedSteps([...completedSteps, stepIdx]);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      await api.completeActivity(activity.id, seconds, notes);
      setShowCelebration(true);
    } catch (e) {
      console.error(e);
      alert('บันทึกสำเร็จ');
      onComplete();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {!showCelebration ? (
          <>
            {/* Header with Stopwatch */}
            <div className="bg-slate-900 text-white p-6 text-center relative">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                กำลังทำกิจกรรม (Live Session Tracker)
              </div>

              <h2 className="text-xl font-bold tracking-tight">{activity.titleTh}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{activity.title}</p>

              {/* Stopwatch display */}
              <div className="my-5 flex items-center justify-center gap-4">
                <div className="text-5xl font-mono font-extrabold tracking-wider text-blue-400">
                  {formatTime(seconds)}
                </div>
              </div>

              {/* Timer controls */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setIsActive(!isActive)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  }`}
                >
                  {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isActive ? 'หยุดชั่วคราว' : 'ทำต่อ'}
                </button>
                <button
                  onClick={() => setSeconds(0)}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  รีเซ็ตเวลา
                </button>
              </div>
            </div>

            {/* Step-by-step interactive checklist */}
            <div className="p-6 space-y-5 max-h-[50vh] overflow-y-auto">
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span>ขั้นตอนที่กำลังทำ (ติ๊กเลือกเมื่อทำเสร็จ)</span>
                  <span className="text-blue-600 font-semibold lowercase">
                    {completedSteps.length}/{activity.steps?.length || 0} ขั้นตอน
                  </span>
                </h3>

                <div className="space-y-2">
                  {activity.steps?.map((step, idx) => {
                    const isDone = completedSteps.includes(idx);
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleStep(idx)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                          isDone
                            ? 'bg-emerald-50/60 border-emerald-300 text-slate-800'
                            : 'bg-white border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <button type="button" className="mt-0.5 text-blue-600 shrink-0">
                          {isDone ? (
                            <CheckSquare className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-300" />
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className={`text-xs font-bold ${isDone ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                              ขั้นตอน {idx + 1}: {step.title}
                            </p>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {step.durationMinutes} นาที
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{step.instruction}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reflection Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  บันทึกความรู้สึกหรือผลลัพธ์ (Notes & Reflection)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="วันนี้รู้สึกอย่างไรหลังจากทำกิจกรรมนี้เสร็จแล้ว..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Action Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800"
              >
                บันทึกไว้ทำต่อทีหลัง
              </button>
              <button
                onClick={handleFinish}
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'กำลังบันทึก...' : 'เสร็จสิ้นกิจกรรม (Complete)'}</span>
              </button>
            </div>
          </>
        ) : (
          /* Celebration modal state */
          <div className="p-8 text-center space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <Trophy className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              ยินดีด้วย! คุณทำกิจกรรมสำเร็จแล้ว
            </h2>
            <p className="text-sm text-slate-600 max-w-sm mx-auto">
              คุณใช้เวลาไปทั้งสิ้น <strong>{formatTime(seconds)}</strong> ในการทำกิจกรรม &quot;{activity.titleTh}&quot;
              ข้อมูลความสำเร็จนี้ถูกบันทึกและส่งเข้า Online Database เรียบร้อยแล้ว
            </p>

            <div className="pt-4">
              <button
                onClick={() => {
                  onComplete();
                  onClose();
                }}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors shadow-md shadow-blue-500/20"
              >
                ไปยังหน้ารายการกิจกรรมของฉัน
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

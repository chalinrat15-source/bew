import React, { useState } from 'react';
import { X, Lock, Mail, User, Sparkles, Check, ArrowRight, KeyRound, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { User as UserType } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: UserType) => void;
  onAuthSuccess?: (user: UserType) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onAuthSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Learning', 'Health & Fitness']);

  React.useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSuccessCallback = (user: UserType) => {
    if (onSuccess) onSuccess(user);
    if (onAuthSuccess) onAuthSuccess(user);
  };

  const interestsList = [
    'Learning',
    'Health & Fitness',
    'Technology & Coding',
    'Art & Creativity',
    'Music & Instruments',
    'Cooking & Baking',
    'Language Exchange',
    'Nature & Gardening',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setEmailExists(false);
    setLoading(true);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    const cleanFullName = fullName.trim();

    try {
      if (mode === 'login') {
        const res = await api.login(cleanEmail, cleanPassword);
        handleSuccessCallback(res.user);
        onClose();
      } else if (mode === 'register') {
        const res = await api.register({
          email: cleanEmail,
          password: cleanPassword,
          fullName: cleanFullName || 'สมาชิกใหม่',
          interests: selectedInterests,
        });
        handleSuccessCallback(res.user);
        onClose();
      } else if (mode === 'reset') {
        const res = await api.resetPassword(cleanEmail, cleanPassword);
        setSuccessMsg(res.message || 'ตั้งรหัสผ่านใหม่และเข้าสู่ระบบสำเร็จ');
        setTimeout(() => {
          handleSuccessCallback(res.user);
          onClose();
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการดำเนินการ');
      if (err.emailExists) {
        setEmailExists(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string, demoPass: string) => {
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const res = await api.login(demoEmail, demoPass);
      handleSuccessCallback(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveExistingEmail = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.register({
        email: email.trim(),
        password: password.trim(),
        fullName: fullName.trim(),
        interests: selectedInterests,
        overwriteIfExists: true,
      });
      handleSuccessCallback(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'เข้าสู่ระบบไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (item: string) => {
    if (selectedInterests.includes(item)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== item));
    } else {
      setSelectedInterests([...selectedInterests, item]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 pt-5 pb-3 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {mode === 'login' && 'เข้าสู่ระบบ (Sign In)'}
              {mode === 'register' && 'สมัครสมาชิกใหม่ (Register)'}
              {mode === 'reset' && 'ตั้งรหัสผ่านใหม่ (Reset Password)'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {mode === 'login' && 'เข้าสู่ระบบเพื่อบันทึกประวัติกิจกรรมและสถิติส่วนบุคคล'}
              {mode === 'register' && 'กรอกข้อมูลเพื่อสร้างบัญชีผู้ใช้งานใหม่'}
              {mode === 'reset' && 'กำหนดรหัสผ่านใหม่สำหรับอีเมลของคุณเพื่อเข้าสู่ระบบ'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prominent Tab Switcher */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100 border-b border-slate-200 text-xs font-semibold shrink-0">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
              setEmailExists(false);
            }}
            className={`py-2 px-3 rounded-xl transition-all cursor-pointer text-center ${
              mode === 'login'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            เข้าสู่ระบบ (Sign In)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError('');
              setEmailExists(false);
            }}
            className={`py-2 px-3 rounded-xl transition-all cursor-pointer text-center ${
              mode === 'register'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            สมัครสมาชิกใหม่ (Sign Up)
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto">
          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              {successMsg}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
              <div>{error}</div>
              {emailExists && (
                <div className="mt-2.5 pt-2.5 border-t border-rose-200/60 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleResolveExistingEmail}
                    className="px-3 py-1.5 bg-rose-700 text-white rounded-lg font-semibold hover:bg-rose-800 transition-colors shadow-xs"
                  >
                    อัปเดตรหัสผ่านและเข้าสู่ระบบทันที
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError('');
                      setEmailExists(false);
                    }}
                    className="px-3 py-1.5 bg-white border border-rose-300 text-rose-800 rounded-lg font-semibold hover:bg-rose-100 transition-colors"
                  >
                    สลับไปเข้าสู่ระบบ
                  </button>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อ-นามสกุล (Full Name)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="เช่น สมชาย ใจดี หรือ Chalinrat"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                อีเมล (Email)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  {mode === 'reset' ? 'รหัสผ่านใหม่ (New Password)' : 'รหัสผ่าน (Password)'}
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('reset');
                      setError('');
                    }}
                    className="text-[11px] text-blue-600 hover:underline"
                  >
                    ลืมรหัสผ่าน?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ความสนใจเบื้องต้น (Interests)
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                  {interestsList.map((interest) => {
                    const active = selectedInterests.includes(interest);
                    return (
                      <button
                        type="button"
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 ${
                          active
                            ? 'bg-blue-50 border-blue-300 text-blue-700 font-medium'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {active && <Check className="w-3 h-3 text-blue-600" />}
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>กำลังดำเนินการ...</span>
              ) : (
                <>
                  <span>
                    {mode === 'login' && 'เข้าสู่ระบบ'}
                    {mode === 'register' && 'สร้างบัญชีผู้ใช้'}
                    {mode === 'reset' && 'บันทึกรหัสผ่านใหม่และเข้าสู่ระบบ'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Test Buttons */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              ⚡ ทดสอบระบบด้วยบัญชีตัวอย่าง (คลิกเดียวเข้าสู่ระบบทันที)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('chalinrat15@gmail.com', '123456')}
                className="px-3 py-2 text-left rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/50 transition-colors text-xs group cursor-pointer"
              >
                <div className="font-semibold text-blue-900 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Chalinrat (Admin)
                </div>
                <div className="text-[10px] text-blue-600/80">chalinrat15@gmail.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin@activitymatch.com', 'admin123')}
                className="px-3 py-2 text-left rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-slate-50 transition-colors text-xs group cursor-pointer"
              >
                <div className="font-semibold text-slate-800 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Admin กลาง
                </div>
                <div className="text-[10px] text-slate-400">admin@activitymatch.com</div>
              </button>
            </div>
          </div>

          {/* Toggle mode links */}
          <div className="mt-4 text-center">
            {mode === 'login' ? (
              <p className="text-xs text-slate-500">
                ยังไม่มีบัญชี?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError('');
                    setEmailExists(false);
                  }}
                  className="font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  สมัครสมาชิกที่นี่
                </button>
              </p>
            ) : mode === 'register' ? (
              <p className="text-xs text-slate-500">
                มีบัญชีอยู่แล้ว?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                    setEmailExists(false);
                  }}
                  className="font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  เข้าสู่ระบบ
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                จำรหัสผ่านได้แล้ว?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                    setEmailExists(false);
                  }}
                  className="font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  กลับไปเข้าสู่ระบบ
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

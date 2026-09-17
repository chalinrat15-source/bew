import React, { useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Lock,
  Shield,
  Check,
  Calendar,
  Save,
  KeyRound,
  CheckCircle2,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { User } from '../../types';
import { api } from '../../services/api';

interface UserProfileViewProps {
  user?: User | null;
  onUpdateUser?: (user: User) => void;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  user,
  onUpdateUser = (_u: User) => {},
  onOpenAuth = (_mode?: 'login' | 'register') => {},
}) => {
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [interests, setInterests] = useState<string[]>(
    user?.interests || ['Learning', 'Health & Fitness']
  );
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const allInterests = [
    'Learning',
    'Health & Fitness',
    'Technology & Coding',
    'Art & Creativity',
    'Music & Instruments',
    'Cooking & Baking',
    'Language Exchange',
    'Nature & Gardening',
  ];

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">โปรไฟล์ผู้ใช้งาน</h2>
          <p className="text-xs text-slate-500 mb-6 max-w-md mx-auto">
            คุณยังไม่ได้เข้าสู่ระบบ เข้าสู่ระบบเพื่อปรับแต่งข้อมูลส่วนตัว เลือกกิจกรรมที่สนใจ และบันทึกประวัติการใช้งาน
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onOpenAuth('login')}
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              เข้าสู่ระบบ (Sign In)
            </button>
            <button
              onClick={() => onOpenAuth('register')}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              สมัครสมาชิกใหม่ (Register)
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    setError('');
    setLoading(true);
    try {
      const updated = await api.updateProfile(fullName, interests, avatarUrl);
      if (updated) {
        onUpdateUser(updated);
      }
      setMsg('อัปเดตข้อมูลโปรไฟล์เรียบร้อยแล้ว');
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    setError('');
    setLoading(true);
    try {
      await api.changePassword(oldPassword, newPassword);
      setMsg('เปลี่ยนรหัสผ่านเรียบร้อยแล้ว');
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      setError(err.message || 'รหัสผ่านเดิมไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-16">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-center gap-5">
        <img
          src={
            user.avatarUrl ||
            `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`
          }
          alt={user.fullName}
          className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200 shadow-xs"
        />
        <div className="text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-900">{user.fullName}</h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                user.role === 'admin'
                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}
            >
              {user.role === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : 'สมาชิก (Member)'}
            </span>
          </div>
          <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1">
            <Mail className="w-3.5 h-3.5" />
            {user.email}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-center sm:justify-start gap-1">
            <Calendar className="w-3.5 h-3.5" />
            เป็นสมาชิกเมื่อ{' '}
            {new Date(user.createdAt).toLocaleDateString('th-TH', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {msg}
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl">
          {error}
        </div>
      )}

      {/* Profile Edit Form */}
      <form
        onSubmit={handleUpdateProfile}
        className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4"
      >
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-600" />
          ข้อมูลส่วนตัว (Personal Details)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ชื่อ-นามสกุล (Full Name)
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              อีเมล (Email)
            </label>
            <input
              type="email"
              disabled
              value={user.email}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            URL รูปภาพโปรไฟล์ (Avatar Image URL)
          </label>
          <input
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            หมวดหมู่ที่สนใจ (Interests for Smart Recommendations)
          </label>
          <div className="flex flex-wrap gap-2">
            {allInterests.map((interest) => {
              const active = interests.includes(interest);
              return (
                <button
                  type="button"
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition-colors flex items-center gap-1.5 cursor-pointer ${
                    active
                      ? 'bg-blue-600 border-blue-600 text-white font-medium shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {active && <Check className="w-3.5 h-3.5" />}
                  {interest}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            บันทึกข้อมูลโปรไฟล์
          </button>
        </div>
      </form>

      {/* Password Change Form */}
      <form
        onSubmit={handleChangePassword}
        className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4"
      >
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-blue-600" />
          เปลี่ยนรหัสผ่าน (Change Password)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">รหัสผ่านเดิม</label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">รหัสผ่านใหม่</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
        >
          อัปเดตรหัสผ่านใหม่
        </button>
      </form>
    </div>
  );
};

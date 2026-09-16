import React, { useState, useEffect } from 'react';
import {
  Radio,
  RefreshCw,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  MapPin,
  Clock,
  User,
  UserCheck,
  Shield,
} from 'lucide-react';
import { LiveUser } from '../../types';
import { api } from '../../services/api';

export const AdminLiveUsersView: React.FC = () => {
  const [liveData, setLiveData] = useState<{ onlineCount: number; users: LiveUser[] }>({
    onlineCount: 0,
    users: [],
  });
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'member' | 'guest'>('all');

  const loadLiveUsers = async () => {
    try {
      const data = await api.getLiveUsers();
      setLiveData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLiveUsers();
    let interval: any = null;
    if (autoRefresh) {
      interval = setInterval(loadLiveUsers, 5000); // 5 seconds polling
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const filteredUsers = liveData.users.filter((u) => {
    if (filterType === 'member') return u.isMember;
    if (filterType === 'guest') return !u.isMember;
    return true;
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} นาที ${secs} วิ`;
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              ผู้ใช้งานแบบ Real-time (Live Active Users)
            </h1>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            ตรวจจับการเคลื่อนไหวผ่าน Heartbeat ทุก 20 วินาที และแสดงผู้ใช้ที่มีการตอบสนองภายใน 5 นาที
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span>Auto Refresh (5s)</span>
          </label>

          <button
            onClick={loadLiveUsers}
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 transition-colors shadow-2xs"
            title="รีเฟรชตอนนี้"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Online KPI Summary Box */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-linear-to-br from-white to-emerald-50/30 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="text-xs font-semibold text-emerald-800">กำลังใช้งานอยู่ตอนนี้</p>
            <p className="text-3xl font-black text-emerald-700">{liveData.onlineCount}</p>
            <p className="text-[10px] text-emerald-600">คนออนไลน์ในขณะนี้</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">สมาชิกที่ล็อกอินอยู่</p>
            <p className="text-3xl font-black text-slate-900">
              {liveData.users.filter((u) => u.isMember).length}
            </p>
            <p className="text-[10px] text-slate-400">เข้าสู่ระบบด้วยบัญชีสมาชิก</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <User className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">ผู้เยี่ยมชมทั่วไป (Guest)</p>
            <p className="text-3xl font-black text-slate-900">
              {liveData.users.filter((u) => !u.isMember).length}
            </p>
            <p className="text-[10px] text-slate-400">ใช้นามแฝง Anonymous Session</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 w-fit text-xs">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
            filterType === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          ทั้งหมด ({liveData.users.length})
        </button>
        <button
          onClick={() => setFilterType('member')}
          className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
            filterType === 'member' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          สมาชิก ({liveData.users.filter((u) => u.isMember).length})
        </button>
        <button
          onClick={() => setFilterType('guest')}
          className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
            filterType === 'guest' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          ผู้เยี่ยมชมทั่วไป ({liveData.users.filter((u) => !u.isMember).length})
        </button>
      </div>

      {/* Live Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-400 uppercase font-semibold">
                <th className="py-3 px-4">ผู้ใช้ / Session ID</th>
                <th className="py-3 px-4">สถานะ</th>
                <th className="py-3 px-4">หน้าที่กำลังเปิดอยู่</th>
                <th className="py-3 px-4">อุปกรณ์ & เบราว์เซอร์</th>
                <th className="py-3 px-4">ภูมิภาค</th>
                <th className="py-3 px-4">เวลาตอบสนองล่าสุด</th>
                <th className="py-3 px-4 text-right">ระยะเวลาในเว็บ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    ไม่มีผู้ใช้งานที่กำลังออนไลน์ในสถานะนี้
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.sessionId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        {user.isMember ? (
                          <UserCheck className="w-4 h-4 text-blue-600" />
                        ) : (
                          <User className="w-4 h-4 text-slate-400" />
                        )}
                        {user.userName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-[180px]">
                        {user.sessionId}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Online
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-mono text-[11px] text-slate-700 font-semibold">
                        {user.currentPage}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      <div className="flex items-center gap-1 font-medium text-slate-800">
                        {user.deviceType === 'mobile' ? (
                          <Smartphone className="w-3.5 h-3.5 text-blue-500" />
                        ) : user.deviceType === 'tablet' ? (
                          <Tablet className="w-3.5 h-3.5 text-purple-500" />
                        ) : (
                          <Monitor className="w-3.5 h-3.5 text-slate-500" />
                        )}
                        <span className="capitalize">{user.deviceType}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {user.browser} • {user.operatingSystem}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      <div className="flex items-center gap-1 font-medium">
                        <MapPin className="w-3 h-3 text-rose-500" />
                        <span>{user.region}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-700">
                      <span className="font-semibold text-emerald-600">
                        {user.secondsAgo < 5 ? 'เมื่อสักครู่' : `${user.secondsAgo} วินาทีที่แล้ว`}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      {formatDuration(user.durationSeconds)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

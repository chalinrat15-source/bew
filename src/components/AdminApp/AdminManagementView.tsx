import React, { useState, useEffect } from 'react';
import {
  UserCog,
  Shield,
  UserPlus,
  Mail,
  CheckCircle2,
  Calendar,
  Lock,
} from 'lucide-react';
import { User } from '../../types';
import { api } from '../../services/api';

export const AdminManagementView: React.FC = () => {
  const [admins, setAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMembers().then((users) => {
      setAdmins(users.filter((u) => u.role === 'admin'));
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            จัดการบัญชีผู้ดูแลระบบ (Admin Team & RBAC)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            กำหนดสิทธิ์การเข้าถึง ดูรายชื่อผู้ดูแลระบบ และนโยบายการควบคุมความปลอดภัย
          </p>
        </div>
      </div>

      {/* Admins Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {admins.map((admin) => (
          <div
            key={admin.id}
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex items-start gap-4"
          >
            <img
              src={admin.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={admin.fullName}
              className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold text-slate-900 text-sm truncate">{admin.fullName}</h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold uppercase shrink-0">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <Mail className="w-3 h-3" />
                {admin.email}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  สิทธิ์การเข้าถึงระดับสูงสุด
                </span>
                <span className="font-mono text-[11px] text-slate-400">
                  เข้าใช้ล่าสุด: {admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleDateString('th-TH') : 'วันนี้'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Role Permission Matrix Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
          <Shield className="w-4 h-4 text-purple-600" />
          ระดับสิทธิ์การใช้งานในระบบ (Role-Based Access Control)
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          นโยบายสิทธิ์ตามเงื่อนไข RLS และระบบความปลอดภัย
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-500 uppercase font-semibold">
                <th className="py-2.5 px-3">สิทธิ์และฟังก์ชัน</th>
                <th className="py-2.5 px-3 text-center">ผู้เยี่ยมชมทั่วไป (Guest)</th>
                <th className="py-2.5 px-3 text-center">สมาชิกทั่วไป (Member)</th>
                <th className="py-2.5 px-3 text-center">ผู้ดูแลระบบ (Admin)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-800">ค้นหากิจกรรม & ดูรายละเอียด</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-800">ขอคำแนะนำกิจกรรม (Match Generator)</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-800">จับเวลาและบันทึกประวัติการทำเสร็จ</td>
                <td className="py-2.5 px-3 text-center text-slate-300">✕ (ต้องล็อกอิน)</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-800">เข้าถึง Admin Dashboard & Live Users</td>
                <td className="py-2.5 px-3 text-center text-slate-300">✕</td>
                <td className="py-2.5 px-3 text-center text-slate-300">✕</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-800">จัดการข้อมูลกิจกรรม & ส่งออกไฟล์ CSV</td>
                <td className="py-2.5 px-3 text-center text-slate-300">✕</td>
                <td className="py-2.5 px-3 text-center text-slate-300">✕</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-800">ตรวจสอบ Admin Audit Logs</td>
                <td className="py-2.5 px-3 text-center text-slate-300">✕</td>
                <td className="py-2.5 px-3 text-center text-slate-300">✕</td>
                <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

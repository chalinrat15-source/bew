import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  ShieldAlert,
  Ban,
  Download,
  Mail,
  Calendar,
  Clock,
  MoreVertical,
} from 'lucide-react';
import { User } from '../../types';
import { api } from '../../services/api';

export const AdminMembersView: React.FC = () => {
  const [members, setMembers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const data = await api.getMembers();
      setMembers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleStatusChange = async (userId: string, newStatus: 'active' | 'suspended' | 'disabled') => {
    try {
      await api.updateMemberStatus(userId, newStatus);
      loadMembers();
    } catch (e) {
      console.error(e);
      alert('เปลี่ยนสถานะไม่สำเร็จ');
    }
  };

  const filteredMembers = members.filter((m) => {
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return m.fullName.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            จัดการสมาชิก (Members Management)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            ตรวจสอบข้อมูลสมาชิก สถานะการใช้งาน ประวัติกิจกรรม และการระงับบัญชี
          </p>
        </div>

        <a
          href={api.getExportCsvUrl('members')}
          download
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          ดาวน์โหลดรายชื่อสมาชิก (CSV)
        </a>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อ หรืออีเมลสมาชิก..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
          <span className="text-slate-500 font-medium">สถานะ:</span>
          <div className="flex bg-slate-100 p-0.5 rounded-lg">
            {['all', 'active', 'suspended', 'disabled'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-md capitalize font-medium transition-colors ${
                  statusFilter === s ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s === 'all' ? 'ทั้งหมด' : s === 'active' ? 'ปกติ' : s === 'suspended' ? 'ระงับชั่วคราว' : 'ปิดใช้งาน'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-400 uppercase font-semibold">
                <th className="py-3 px-4">สมาชิก</th>
                <th className="py-3 px-4">บทบาท</th>
                <th className="py-3 px-4">สถานะ</th>
                <th className="py-3 px-4 text-center">กิจกรรมที่ทำสำเร็จ</th>
                <th className="py-3 px-4">วันที่สมัคร</th>
                <th className="py-3 px-4">เข้าสู่ระบบล่าสุด</th>
                <th className="py-3 px-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={member.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80'}
                        alt={member.fullName}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <p className="font-bold text-slate-900">{member.fullName}</p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {member.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        member.role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {member.role}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        member.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : member.status === 'suspended'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {member.status === 'active' ? 'ปกติ (Active)' : member.status === 'suspended' ? 'ระงับชั่วคราว' : 'ถูกปิดใช้งาน'}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      {member.completedActivities ?? 0} กิจกรรม
                    </span>
                  </td>

                  <td className="py-3 px-4 text-slate-500">
                    {new Date(member.createdAt || Date.now()).toLocaleDateString('th-TH')}
                  </td>

                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    {member.lastLoginAt ? new Date(member.lastLoginAt).toLocaleString('th-TH') : 'ยังไม่เคยเข้าใช้'}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <select
                      value={member.status}
                      onChange={(e) => handleStatusChange(member.id, e.target.value as any)}
                      className="px-2 py-1 text-xs rounded-lg border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="active">ปกติ (Active)</option>
                      <option value="suspended">ระงับชั่วคราว (Suspend)</option>
                      <option value="disabled">ปิดใช้งาน (Disable)</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

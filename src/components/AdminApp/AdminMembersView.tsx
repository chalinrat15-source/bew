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
  UserPlus,
  X,
  Lock,
  User as UserIcon,
  Shield,
} from 'lucide-react';
import { User } from '../../types';
import { api } from '../../services/api';

export const AdminMembersView: React.FC = () => {
  const [members, setMembers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Add Member Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'member' | 'admin'>('member');
  const [newStatus, setNewStatus] = useState<'active' | 'suspended'>('active');
  const [newInterests, setNewInterests] = useState<string[]>(['Learning', 'Health & Fitness']);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [successToast, setSuccessToast] = useState('');

  const availableInterests = [
    'Learning',
    'Health & Fitness',
    'Technology & Coding',
    'Art & Creativity',
    'Music & Instruments',
    'Cooking & Baking',
    'Language Exchange',
    'Nature & Gardening',
  ];

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

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    setModalLoading(true);

    try {
      await api.createMemberAdmin({
        fullName: newFullName.trim(),
        email: newEmail.trim(),
        password: newPassword,
        role: newRole,
        status: newStatus,
        interests: newInterests,
      });

      // Reset form
      setNewFullName('');
      setNewEmail('');
      setNewPassword('');
      setNewRole('member');
      setNewStatus('active');
      setNewInterests(['Learning', 'Health & Fitness']);
      setIsAddModalOpen(false);

      setSuccessToast('สร้างบัญชีผู้ใช้งานใหม่สำเร็จแล้ว!');
      setTimeout(() => setSuccessToast(''), 4000);
      loadMembers();
    } catch (err: any) {
      setModalError(err.message || 'เกิดข้อผิดพลาดในการสร้างผู้ใช้งาน');
    } finally {
      setModalLoading(false);
    }
  };

  const toggleInterest = (item: string) => {
    if (newInterests.includes(item)) {
      setNewInterests(newInterests.filter((i) => i !== item));
    } else {
      setNewInterests([...newInterests, item]);
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
      {/* Toast */}
      {successToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {successToast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            จัดการสมาชิก (Members Management)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            ตรวจสอบข้อมูลสมาชิก สร้างบัญชีผู้ใช้ใหม่ และควบคุมสิทธิ์การใช้งาน
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            เพิ่มผู้ใช้งานใหม่ (Add User)
          </button>

          <a
            href={api.getExportCsvUrl('members')}
            download
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            ส่งออก CSV
          </a>
        </div>
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

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    เพิ่มผู้ใช้งานใหม่ (Create New User)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    สร้างบัญชีผู้ใช้ใหม่โดยผู้ดูแลระบบ พร้อมกำหนดสิทธิ์และบทบาท
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateMember} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                  {modalError}
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อ-นามสกุล (Full Name) *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    placeholder="เช่น สมศักดิ์ มุ่งมั่น"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  อีเมล (Email) *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  รหัสผ่าน (Password) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="กำหนดรหัสผ่าน (อย่างน้อย 4 ตัวอักษร)"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Role & Status Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    บทบาท (Role)
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 bg-white"
                  >
                    <option value="member">สมาชิกทั่วไป (Member)</option>
                    <option value="admin">ผู้ดูแลระบบ (Admin)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    สถานะเริ่มต้น (Status)
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 bg-white"
                  >
                    <option value="active">ปกติ (Active)</option>
                    <option value="suspended">ระงับชั่วคราว (Suspended)</option>
                  </select>
                </div>
              </div>

              {/* Interests Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ความสนใจเบื้องต้น (Interests)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {availableInterests.map((item) => {
                    const isChecked = newInterests.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleInterest(item)}
                        className={`px-2.5 py-1 text-[11px] rounded-lg border transition-colors cursor-pointer ${
                          isChecked
                            ? 'bg-blue-50 text-blue-700 border-blue-200 font-semibold'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {item} {isChecked && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {modalLoading ? (
                    'กำลังสร้าง...'
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      บันทึกและสร้างผู้ใช้
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

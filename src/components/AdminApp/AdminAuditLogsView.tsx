import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  Calendar,
  User,
  Activity,
  FileDown,
  RefreshCw,
} from 'lucide-react';
import { AdminAuditLogItem } from '../../types';
import { api } from '../../services/api';

export const AdminAuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AdminAuditLogItem[]>([]);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getAuditLogs(
        actionFilter !== 'all' ? actionFilter : undefined,
        search.trim() || undefined
      );
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [actionFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(loadLogs, 350);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            บันทึกการทำงานของผู้ดูแลระบบ (Admin Audit Logs)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            บันทึกความปลอดภัย ตรวจสอบย้อนหลังได้ทุกการดำเนินการที่กระทำโดยผู้ดูแลระบบ
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 transition-colors shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาข้อความ หรือผู้กระทำ..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
          <span className="text-slate-500 font-medium">การกระทำ:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-blue-100 text-xs"
          >
            <option value="all">ทุกการกระทำ (All Actions)</option>
            <option value="Admin Login">Admin Login</option>
            <option value="Create Activity">Create Activity</option>
            <option value="Edit Activity">Edit Activity</option>
            <option value="Delete Activity">Delete Activity</option>
            <option value="Change Member Status">Change Member Status</option>
            <option value="Export Report">Export Report</option>
            <option value="Change Settings">Change Settings</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-400 uppercase font-semibold">
                <th className="py-3 px-4">วัน-เวลา</th>
                <th className="py-3 px-4">ผู้ดูแลระบบ</th>
                <th className="py-3 px-4">การกระทำ (Action)</th>
                <th className="py-3 px-4">เป้าหมาย (Target)</th>
                <th className="py-3 px-4">รายละเอียด (Description)</th>
                <th className="py-3 px-4 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    ไม่พบบันทึกการทำงานที่ตรงกับเงื่อนไข
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('th-TH')}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-purple-600" />
                      <span>{log.adminName}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold border border-blue-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 capitalize font-medium text-slate-600">
                      {log.targetType} {log.targetId ? `(${log.targetId})` : ''}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {log.description}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400 text-[11px]">
                      {log.ipAddress || '127.0.0.1'}
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

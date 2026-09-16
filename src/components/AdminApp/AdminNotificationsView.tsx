import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldAlert,
  Flame,
  Check,
} from 'lucide-react';
import { AdminAlertItem } from '../../types';
import { api } from '../../services/api';

export const AdminNotificationsView: React.FC = () => {
  const [alerts, setAlerts] = useState<AdminAlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await api.getAlerts();
      setAlerts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await api.markAlertRead(id);
      loadAlerts();
    } catch (e) {
      console.error(e);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            การแจ้งเตือนระบบและการเตือนภัย (System Alerts)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            ตรวจจับอัตราผู้ใช้สูงสุด ข้อผิดพลาดของระบบ และเกณฑ์การแจ้งเตือน (Threshold Alerts)
          </p>
        </div>

        {unreadCount > 0 && (
          <span className="px-3 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-xl self-start sm:self-auto">
            มีการแจ้งเตือนใหม่ {unreadCount} รายการ
          </span>
        )}
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`bg-white rounded-2xl border p-5 shadow-xs transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              alert.isRead ? 'border-slate-200 opacity-80' : 'border-blue-300 ring-1 ring-blue-100'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  alert.severity === 'high'
                    ? 'bg-rose-100 text-rose-600'
                    : alert.severity === 'medium'
                    ? 'bg-amber-100 text-amber-600'
                    : 'bg-blue-100 text-blue-600'
                }`}
              >
                {alert.severity === 'high' ? (
                  <ShieldAlert className="w-5 h-5" />
                ) : alert.severity === 'medium' ? (
                  <Flame className="w-5 h-5" />
                ) : (
                  <Info className="w-5 h-5" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getSeverityBadge(
                      alert.severity
                    )}`}
                  >
                    {alert.severity}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    เกณฑ์: {alert.threshold}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(alert.createdAt).toLocaleString('th-TH')}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm">{alert.title}</h3>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{alert.message}</p>
              </div>
            </div>

            <div className="shrink-0 self-end sm:self-center">
              {!alert.isRead ? (
                <button
                  onClick={() => handleMarkRead(alert.id)}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  ทำเครื่องหมายว่าอ่านแล้ว
                </button>
              ) : (
                <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  อ่านแล้ว
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import React from 'react';
import {
  FileDown,
  Download,
  Users,
  History,
  TrendingUp,
  Compass,
  Layers,
  Radio,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../../services/api';

export const AdminReportsView: React.FC = () => {
  const reports = [
    {
      type: 'members',
      title: 'รายชื่อและสถานะสมาชิก (Members Report)',
      description: 'รหัสสมาชิก, อีเมล, ชื่อ-นามสกุล, บทบาท, สถานะ, ความสนใจ, วันที่สมัคร, เข้าใช้ล่าสุด',
      icon: <Users className="w-5 h-5 text-blue-600" />,
      size: '~5 KB',
    },
    {
      type: 'activity_history',
      title: 'ประวัติกิจกรรมและการเข้าชม (Event Logs)',
      description: 'วัน-เวลา, Session ID, User ID, Event Type, กิจกรรม, หมวดหมู่, หน้าเว็บ, อุปกรณ์, เบราว์เซอร์',
      icon: <History className="w-5 h-5 text-purple-600" />,
      size: '~45 KB',
    },
    {
      type: 'analytics',
      title: 'สรุปดัชนีชี้วัดหลัก (KPI & Analytics Summary)',
      description: 'ยอดผู้ใช้, ผู้เข้าชมวันนี้, คำแนะนำ, กิจกรรมสำเร็จ, เวลาเฉลี่ย, สัดส่วนอุปกรณ์, แหล่งที่มา',
      icon: <TrendingUp className="w-5 h-5 text-emerald-600" />,
      size: '~3 KB',
    },
    {
      type: 'popular_activities',
      title: 'รายงานกิจกรรมยอดนิยม (Popular Activities)',
      description: 'รหัสกิจกรรม, ชื่อภาษาไทย, ชื่ออังกฤษ, หมวดหมู่, ยอดเข้าดู, เริ่มทำ, สำเร็จ, บันทึก, Completion Rate',
      icon: <Compass className="w-5 h-5 text-rose-500" />,
      size: '~8 KB',
    },
    {
      type: 'popular_categories',
      title: 'รายงานสถิติตามหมวดหมู่ (Category Performance)',
      description: 'ชื่อหมวดหมู่, สัดส่วน %, ยอดดู, แนะนำ, เริ่มทำ, สำเร็จ, บันทึก',
      icon: <Layers className="w-5 h-5 text-indigo-600" />,
      size: '~4 KB',
    },
    {
      type: 'user_sessions',
      title: 'ประวัติการเข้าใช้งาน (User Sessions)',
      description: 'Session ID, User ID, หน้าเว็บล่าสุด, อุปกรณ์, เบราว์เซอร์, OS, ภูมิภาค, เวลาเริ่ม, ระยะเวลา',
      icon: <Radio className="w-5 h-5 text-amber-500" />,
      size: '~25 KB',
    },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          ศูนย์ส่งออกรายงานและข้อมูล (Reports & Export Center)
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          ส่งออกรายงานจริงในรูปแบบไฟล์ CSV พร้อมรองรับภาษาไทยสำหรับ Microsoft Excel และ Google Sheets
        </p>
      </div>

      {/* Info Notice */}
      <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-center gap-3">
        <FileSpreadsheet className="w-6 h-6 text-blue-600 shrink-0" />
        <div className="text-xs text-blue-900 leading-relaxed">
          <strong>UTF-8 BOM Supported:</strong> ไฟล์ CSV ที่ดาวน์โหลดจากระบบนี้ถูกฝัง Byte Order Mark (BOM)
          เพื่อให้โปรแกรม Microsoft Excel เปิดไฟล์ภาษาไทยได้โดยอัตโนมัติ ไม่เกิดปัญหาตัวอักษรต่างดาว
          พร้อมบันทึกการดาวน์โหลดลง Audit Logs อัตโนมัติ
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((r) => (
          <div
            key={r.type}
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
          >
            <div>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100">
                  {r.icon}
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 font-mono text-[11px] text-slate-600 font-medium">
                  {r.size}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-base mb-1">{r.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{r.description}</p>
            </div>

            <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                พร้อมดาวน์โหลดทันที
              </span>

              <a
                href={api.getExportCsvUrl(r.type)}
                download={`${r.type}.csv`}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                ดาวน์โหลด CSV
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Settings,
  Database,
  Copy,
  Check,
  Shield,
  Sliders,
  CheckCircle2,
  FileCode,
  Download,
} from 'lucide-react';
import { api } from '../../services/api';

export const AdminSettingsView: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [savedSettings, setSavedSettings] = useState(false);
  const [heartbeatInterval, setHeartbeatInterval] = useState(20);
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [anonymizeIp, setAnonymizeIp] = useState(true);

  const supabaseSchemaSql = `-- ==========================================================
-- ActivityMatch Database Schema & Analytics Engine (PostgreSQL / Supabase)
-- ==========================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar_url TEXT,
  interests TEXT[] DEFAULT ARRAY[]::TEXT[],
  preferred_time TEXT DEFAULT 'afternoon',
  energy_preference TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'disabled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_th TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  display_order INT DEFAULT 0
);

-- 4. Activities Table
CREATE TABLE IF NOT EXISTS public.activities (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  title_th TEXT NOT NULL,
  category_id TEXT REFERENCES public.categories(id),
  description TEXT,
  duration_minutes INT NOT NULL,
  energy_level TEXT CHECK (energy_level IN ('low', 'medium', 'high')),
  equipment TEXT[],
  steps JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. User Sessions Table (Real-time tracking)
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  user_name TEXT,
  is_member BOOLEAN DEFAULT FALSE,
  ip_address TEXT,
  user_agent TEXT,
  device_type TEXT,
  browser TEXT,
  operating_system TEXT,
  region TEXT,
  language TEXT,
  current_page TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
  duration_seconds INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- 6. Analytics Events Log (Audit Trail)
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  user_name TEXT,
  event_type TEXT NOT NULL,
  activity_id TEXT REFERENCES public.activities(id) ON DELETE SET NULL,
  activity_title TEXT,
  category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  category_name TEXT,
  page TEXT NOT NULL,
  device_type TEXT,
  browser TEXT,
  operating_system TEXT,
  region TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Admin Audit Logs
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES public.users(id),
  admin_name TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  description TEXT NOT NULL,
  ip_address TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow users to read/update their own profile
CREATE POLICY "Users can manage own profile"
  ON public.users
  FOR ALL
  USING (auth.uid() = id);

-- Allow public analytics insertion
CREATE POLICY "Public can log analytics events"
  ON public.analytics_events
  FOR INSERT
  WITH CHECK (true);

-- Only Admins can view analytics events and audit logs
CREATE POLICY "Admins full access to analytics"
  ON public.analytics_events
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins read audit logs"
  ON public.admin_audit_logs
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(supabaseSchemaSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSettings(true);
    setTimeout(() => setSavedSettings(false), 2500);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          ตั้งค่าระบบและฐานข้อมูล (Settings & Database SQL)
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          จัดการพารามิเตอร์การเก็บสถิติ Heartbeat และสคริปต์สกีมาฐานข้อมูล Supabase / PostgreSQL
        </p>
      </div>

      {/* Tracking Configuration Form */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-600" />
          พารามิเตอร์การเก็บข้อมูลสถิติ (Tracking Parameters)
        </h2>
        <p className="text-xs text-slate-500 mb-5">
          ปรับความถี่ในการส่งสัญญาณ Heartbeat และนโยบายความเป็นส่วนตัวของผู้ใช้
        </p>

        <form onSubmit={handleSaveSettings} className="space-y-4 max-w-xl">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">
              ความถี่ในการส่ง Heartbeat (วินาที)
            </label>
            <input
              type="number"
              min={5}
              max={60}
              value={heartbeatInterval}
              onChange={(e) => setHeartbeatInterval(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600"
            />
            <p className="text-[11px] text-slate-400">
              ค่าเริ่มต้นคือ 20 วินาที ระบบจะคำนวณผู้ใช้ออนไลน์ตามการเคลื่อนไหวล่าสุด
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">
              Session Timeout (นาที)
            </label>
            <input
              type="number"
              min={5}
              max={120}
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600"
            />
            <p className="text-[11px] text-slate-400">
              หากไม่มีการตอบสนองภายในเวลานี้ จะตัด Session ออกจากผู้ใช้ออนไลน์
            </p>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={anonymizeIp}
                onChange={(e) => setAnonymizeIp(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>ปิดบังที่อยู่ IP ของผู้เยี่ยมชมทั่วไป (Privacy-First Anonymous IP Anonymization)</span>
            </label>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              บันทึกการตั้งค่า
            </button>
            {savedSettings && (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                บันทึกการตั้งค่าเรียบร้อยแล้ว
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Supabase Schema SQL block */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl text-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" />
              โครงสร้างตารางและนโยบาย RLS (Supabase SQL Schema)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              พร้อมสำหรับคัดลอกไปรันใน SQL Editor ของ Supabase หรือ PostgreSQL Production
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyToClipboard}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'คัดลอกแล้ว!' : 'คัดลอกโค้ด SQL'}
            </button>
          </div>
        </div>

        <pre className="p-4 bg-slate-950 rounded-2xl overflow-x-auto text-[11px] font-mono leading-relaxed text-emerald-300 max-h-96">
          {supabaseSchemaSql}
        </pre>
      </div>
    </div>
  );
};

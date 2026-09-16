import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  Calendar,
  RotateCcw,
  Smartphone,
  Monitor,
  Tablet,
  ChevronLeft,
  ChevronRight,
  User,
  UserCheck,
} from 'lucide-react';
import { AnalyticsEventItem, Category, Activity } from '../../types';
import { api } from '../../services/api';

export const AdminActivityHistoryView: React.FC = () => {
  const [events, setEvents] = useState<AnalyticsEventItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Deep Filters
  const [dateRange, setDateRange] = useState('7days');
  const [userType, setUserType] = useState('all');
  const [eventType, setEventType] = useState('all');
  const [activityId, setActivityId] = useState('all');
  const [categoryId, setCategoryId] = useState('all');
  const [deviceType, setDeviceType] = useState('all');
  const [sort, setSort] = useState<'desc' | 'asc'>('desc');
  const [search, setSearch] = useState('');

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await api.getEvents({
        dateRange: dateRange !== 'all' ? dateRange : undefined,
        userType: userType !== 'all' ? userType : undefined,
        eventType: eventType !== 'all' ? eventType : undefined,
        activityId: activityId !== 'all' ? activityId : undefined,
        categoryId: categoryId !== 'all' ? categoryId : undefined,
        deviceType: deviceType !== 'all' ? deviceType : undefined,
        sort,
        search: search.trim() || undefined,
        page,
      });
      setEvents(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.getCategories().then(setCategories);
    api.getActivities().then(setActivities);
  }, []);

  useEffect(() => {
    loadEvents();
  }, [dateRange, userType, eventType, activityId, categoryId, deviceType, sort, page]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadEvents();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleReset = () => {
    setDateRange('7days');
    setUserType('all');
    setEventType('all');
    setActivityId('all');
    setCategoryId('all');
    setDeviceType('all');
    setSort('desc');
    setSearch('');
    setPage(1);
  };

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'start_activity':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'complete_activity':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'get_recommendation':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'save_activity':
      case 'favorite_activity':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'login':
      case 'register':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            ประวัติการใช้งานแบบละเอียด (Activity Event Logs)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            สืบค้น Audit Trail ทุก Event ที่เกิดขึ้นในระบบ พร้อมตัวกรองครบวงจร
          </p>
        </div>

        <a
          href={api.getExportCsvUrl('activity_history')}
          download
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          ส่งออก Event Log (CSV)
        </a>
      </div>

      {/* Advanced Multi-Filter Box */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-blue-600" />
            ตัวกรองขั้นสูง (Advanced Filters)
          </span>
          <button
            onClick={handleReset}
            className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            รีเซ็ตตัวกรอง
          </button>
        </div>

        {/* Search & Sort */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาตามชื่อผู้ใช้, Event Type, หน้าเว็บ หรือคำอธิบาย..."
              className="w-full pl-10 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-blue-100"
            >
              <option value="desc">เวลา: ล่าสุด &rarr; เก่าสุด</option>
              <option value="asc">เวลา: เก่าสุด &rarr; ล่าสุด</option>
            </select>
          </div>
        </div>

        {/* 6 Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
          {/* 1. Date Range */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">ช่วงเวลา</label>
            <select
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
            >
              <option value="today">วันนี้</option>
              <option value="7days">7 วันล่าสุด</option>
              <option value="30days">30 วันล่าสุด</option>
              <option value="all">ทั้งหมด</option>
            </select>
          </div>

          {/* 2. User Type */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">ประเภทผู้ใช้</label>
            <select
              value={userType}
              onChange={(e) => {
                setUserType(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
            >
              <option value="all">ทั้งหมด</option>
              <option value="member">เฉพาะสมาชิก</option>
              <option value="guest">เฉพาะผู้เยี่ยมชม (Guest)</option>
            </select>
          </div>

          {/* 3. Event Type */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">ประเภท Event</label>
            <select
              value={eventType}
              onChange={(e) => {
                setEventType(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
            >
              <option value="all">ทุกประเภท</option>
              <option value="page_view">page_view (เปิดหน้า)</option>
              <option value="search_activity">search_activity (ค้นหา)</option>
              <option value="view_activity">view_activity (ดูรายละเอียด)</option>
              <option value="get_recommendation">get_recommendation (ขอคำแนะนำ)</option>
              <option value="start_activity">start_activity (เริ่มทำ)</option>
              <option value="complete_activity">complete_activity (ทำเสร็จ)</option>
              <option value="save_activity">save_activity (บันทึก)</option>
              <option value="favorite_activity">favorite_activity (รายการโปรด)</option>
              <option value="login">login (เข้าสู่ระบบ)</option>
              <option value="logout">logout (ออกจากระบบ)</option>
              <option value="register">register (สมัครสมาชิก)</option>
            </select>
          </div>

          {/* 4. Activity */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">กิจกรรม</label>
            <select
              value={activityId}
              onChange={(e) => {
                setActivityId(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white truncate"
            >
              <option value="all">ทุกกิจกรรม</option>
              {activities.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.titleTh}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Category */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">หมวดหมู่</label>
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
            >
              <option value="all">ทุกหมวดหมู่</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameTh}
                </option>
              ))}
            </select>
          </div>

          {/* 6. Device */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">อุปกรณ์</label>
            <select
              value={deviceType}
              onChange={(e) => {
                setDeviceType(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
            >
              <option value="all">ทุกอุปกรณ์</option>
              <option value="mobile">มือถือ (Mobile)</option>
              <option value="desktop">เดสก์ท็อป (Desktop)</option>
              <option value="tablet">แท็บเล็ต (Tablet)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Log Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-4 py-3 bg-slate-50/60 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            แสดง <strong>{events.length}</strong> จากทั้งหมด <strong>{total}</strong> รายการ
          </span>
          <span>หน้า {page} จาก {totalPages || 1}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                <th className="py-3 px-4">วัน-เวลา</th>
                <th className="py-3 px-4">ผู้ใช้งาน</th>
                <th className="py-3 px-4">ประเภทกิจกรรม (Event)</th>
                <th className="py-3 px-4">กิจกรรม / หมวดหมู่</th>
                <th className="py-3 px-4">หน้าเว็บ (Page)</th>
                <th className="py-3 px-4">อุปกรณ์ & ระบบ</th>
                <th className="py-3 px-4 text-right">รายละเอียดเพิ่มเติม</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    กำลังค้นหาข้อมูล...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    ไม่พบข้อมูลที่ตรงกับตัวกรองที่เลือก
                  </td>
                </tr>
              ) : (
                events.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/80 transition-colors font-sans">
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {new Date(evt.createdAt).toLocaleString('th-TH')}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        {evt.userId ? (
                          <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                        ) : (
                          <User className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        <span>{evt.userName || 'Guest User'}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-[140px]">
                        {evt.sessionId}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${getEventBadge(
                          evt.eventType
                        )}`}
                      >
                        {evt.eventType}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {evt.activityTitle ? (
                        <div>
                          <p className="font-semibold text-slate-800">{evt.activityTitle}</p>
                          <p className="text-[10px] text-slate-400">{evt.categoryName || 'หมวดหมู่'}</p>
                        </div>
                      ) : evt.categoryName ? (
                        <span className="text-slate-600">{evt.categoryName}</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      {evt.page}
                    </td>

                    <td className="py-3 px-4 text-slate-500">
                      <div className="flex items-center gap-1 font-medium capitalize text-slate-700">
                        {evt.deviceType === 'mobile' ? (
                          <Smartphone className="w-3.5 h-3.5 text-blue-500" />
                        ) : evt.deviceType === 'tablet' ? (
                          <Tablet className="w-3.5 h-3.5 text-purple-500" />
                        ) : (
                          <Monitor className="w-3.5 h-3.5 text-slate-500" />
                        )}
                        <span>{evt.deviceType || 'desktop'}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {evt.browser || 'Chrome'} • {evt.operatingSystem || 'Windows'}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {evt.metadata ? (
                        <pre className="text-[10px] text-slate-500 font-mono inline-block max-w-[150px] truncate">
                          {JSON.stringify(evt.metadata)}
                        </pre>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40 flex items-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            หน้าก่อนหน้า
          </button>
          <span className="text-xs font-medium text-slate-600">
            หน้า {page} จาก {totalPages || 1}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40 flex items-center gap-1"
          >
            หน้าถัดไป
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

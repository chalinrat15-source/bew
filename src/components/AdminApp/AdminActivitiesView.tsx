import React, { useState, useEffect } from 'react';
import {
  Compass,
  Plus,
  Edit2,
  Trash2,
  Clock,
  Zap,
  Search,
  CheckCircle2,
  X,
  Layers,
} from 'lucide-react';
import { Activity, Category } from '../../types';
import { api } from '../../services/api';

export const AdminActivitiesView: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAct, setEditingAct] = useState<Activity | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [titleTh, setTitleTh] = useState('');
  const [categoryId, setCategoryId] = useState('cat-health');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [energyLevel, setEnergyLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [equipmentInput, setEquipmentInput] = useState('');
  const [stepsInput, setStepsInput] = useState('');

  const loadData = async () => {
    try {
      const [acts, cats] = await Promise.all([
        api.getActivitiesAdmin(),
        api.getCategories(),
      ]);
      setActivities(acts);
      setCategories(cats);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingAct(null);
    setTitle('');
    setTitleTh('');
    setCategoryId(categories[0]?.id || 'cat-health');
    setDescription('');
    setDurationMinutes(30);
    setEnergyLevel('medium');
    setEquipmentInput('เบาะรอง, สมุดจด');
    setStepsInput('เตรียมพื้นที่ให้พร้อม\nเริ่มลงมือปฏิบัติ\nบันทึกความรู้สึกหลังเสร็จสิ้น');
    setIsModalOpen(true);
  };

  const openEditModal = (act: Activity) => {
    setEditingAct(act);
    setTitle(act.title);
    setTitleTh(act.titleTh);
    setCategoryId(act.categoryId);
    setDescription(act.description);
    setDurationMinutes(act.durationMinutes);
    setEnergyLevel(act.energyLevel);
    setEquipmentInput(act.equipment?.join(', ') || '');
    setStepsInput(act.steps?.map((s) => `${s.title}: ${s.instruction}`).join('\n') || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const equipment = equipmentInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const steps = stepsInput
      .split('\n')
      .map((line, idx) => {
        const parts = line.split(':');
        return {
          step: idx + 1,
          title: parts[0]?.trim() || `ขั้นตอนที่ ${idx + 1}`,
          instruction: parts[1]?.trim() || line.trim(),
          durationMinutes: Math.round(durationMinutes / (stepsInput.split('\n').length || 1)),
        };
      })
      .filter((s) => s.title);

    const payload = {
      title,
      titleTh,
      categoryId,
      description,
      durationMinutes: Number(durationMinutes),
      energyLevel,
      equipment,
      steps,
      isActive: true,
    };

    try {
      if (editingAct) {
        await api.updateActivityAdmin(editingAct.id, payload);
      } else {
        await api.createActivityAdmin(payload);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      alert('บันทึกกิจกรรมไม่สำเร็จ');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันที่จะลบกิจกรรมนี้? การกระทำนี้จะถูกบันทึกลงใน Audit Logs')) return;
    try {
      await api.deleteActivityAdmin(id);
      loadData();
    } catch (e) {
      console.error(e);
      alert('ลบไม่สำเร็จ');
    }
  };

  const filtered = activities.filter((a) => {
    if (selectedCat !== 'all' && a.categoryId !== selectedCat) return false;
    if (search) {
      const q = search.toLowerCase();
      return a.title.toLowerCase().includes(q) || a.titleTh.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            จัดการข้อมูลกิจกรรม (Activities Management)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            เพิ่ม แก้ไข และลบกิจกรรม พร้อมบันทึกประวัติการเปลี่ยนแปลงลง Audit Logs
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4" />
          เพิ่มกิจกรรมใหม่
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
            placeholder="ค้นหากิจกรรม..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
          <span className="text-slate-500 font-medium">หมวดหมู่:</span>
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-blue-100 text-xs"
          >
            <option value="all">ทุกหมวดหมู่ ({activities.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameTh}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((act) => {
          const cat = categories.find((c) => c.id === act.categoryId);
          return (
            <div
              key={act.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between group hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold text-white"
                    style={{ backgroundColor: cat?.color || '#3b82f6' }}
                  >
                    {cat?.nameTh}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(act)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                      title="แก้ไขกิจกรรม"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(act.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="ลบกิจกรรม"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-sm sm:text-base">{act.titleTh}</h3>
                <p className="text-[11px] text-slate-400 mb-2">{act.title}</p>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{act.description}</p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {act.durationMinutes} นาที
                </span>
                <span className="capitalize flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  ระดับ: {act.energyLevel}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                {editingAct ? 'แก้ไขข้อมูลกิจกรรม' : 'สร้างกิจกรรมใหม่'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อภาษาไทย</label>
                  <input
                    type="text"
                    required
                    value={titleTh}
                    onChange={(e) => setTitleTh(e.target.value)}
                    placeholder="เช่น โยคะยามเช้า 15 นาที"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อภาษาอังกฤษ</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Morning Yoga Flow"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">หมวดหมู่</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameTh}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">เวลา (นาที)</label>
                  <input
                    type="number"
                    required
                    min={5}
                    max={180}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">พลังงาน</label>
                  <select
                    value={energyLevel}
                    onChange={(e) => setEnergyLevel(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600 bg-white"
                  >
                    <option value="low">เบา (Low)</option>
                    <option value="medium">ปานกลาง (Medium)</option>
                    <option value="high">สูง (High)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">คำอธิบาย</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="อธิบายกิจกรรมและประโยชน์ที่ผู้ใช้จะได้รับ..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  อุปกรณ์ที่ต้องใช้ (คั่นด้วยเครื่องหมายจุลภาค ,)
                </label>
                <input
                  type="text"
                  value={equipmentInput}
                  onChange={(e) => setEquipmentInput(e.target.value)}
                  placeholder="เช่น เสื่อโยคะ, น้ำดื่ม, ผ้าขนหนู"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ขั้นตอนการทำ (บรรทัดละ 1 ขั้นตอน ในรูปแบบ &quot;ชื่อขั้นตอน: คำอธิบาย&quot;)
                </label>
                <textarea
                  rows={4}
                  value={stepsInput}
                  onChange={(e) => setStepsInput(e.target.value)}
                  placeholder="เตรียมตัว: หายใจเข้าลึกๆ ยืดเหยียดร่างกาย&#10;เริ่มปฏิบัติ: ทำตามท่าทางช้าๆ 10 นาที"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600 font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  {editingAct ? 'บันทึกการแก้ไข' : 'สร้างกิจกรรม'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

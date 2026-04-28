import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Modal from '../shared/Modal';
import { CAS_LOS } from '../../utils/grades';

const STRANDS = ['Creativity', 'Activity', 'Service'];

export default function AddCasModal({ open, onClose }) {
  const { dispatch } = useApp();
  const [form, setForm] = useState({ name: '', strand: 'Activity', date: '', hours: '', learningOutcomes: [], reflection: '', supervisor: '' });

  const up = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleLO = (lo) => setForm(f => ({
    ...f,
    learningOutcomes: f.learningOutcomes.includes(lo) ? f.learningOutcomes.filter(x => x !== lo) : [...f.learningOutcomes, lo]
  }));

  const save = () => {
    if (!form.name.trim()) return;
    dispatch({ type: 'ADD_CAS_ENTRY', entry: { ...form, id: crypto.randomUUID(), hours: parseFloat(form.hours) || 0 } });
    setForm({ name: '', strand: 'Activity', date: '', hours: '', learningOutcomes: [], reflection: '', supervisor: '' });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Add CAS Activity">
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-[#8b9dc3] font-mono mb-1">Activity Name *</label>
          <input className="w-full bg-navy-800 border border-navy-700 rounded-xl px-4 py-3 text-white placeholder-[#8b9dc3] focus:outline-none focus:border-blue-500" placeholder="e.g. School Drama Production" value={form.name} onChange={e => up('name', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-[#8b9dc3] font-mono mb-1">Strand</label>
          <div className="flex gap-2">
            {STRANDS.map(s => (
              <button key={s} onClick={() => up('strand', s)} className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${form.strand === s ? 'bg-blue-500 border-blue-500 text-white' : 'bg-navy-800 border-navy-700 text-[#8b9dc3]'}`}>{s}</button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[#8b9dc3] font-mono mb-1">Date</label>
            <input type="date" className="w-full bg-navy-800 border border-navy-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" value={form.date} onChange={e => up('date', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-[#8b9dc3] font-mono mb-1">Hours</label>
            <input type="number" min="0" step="0.5" className="w-full bg-navy-800 border border-navy-700 rounded-xl px-4 py-3 text-white placeholder-[#8b9dc3] focus:outline-none focus:border-blue-500" placeholder="0" value={form.hours} onChange={e => up('hours', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="block text-xs text-[#8b9dc3] font-mono mb-2">Learning Outcomes</label>
          <div className="space-y-1.5">
            {CAS_LOS.map(lo => (
              <label key={lo.id} className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={form.learningOutcomes.includes(lo.id)} onChange={() => toggleLO(lo.id)} className="mt-0.5 w-4 h-4 accent-blue-500 flex-shrink-0" />
                <span className="text-xs text-[#e8ecf4]"><span className="font-mono font-bold text-blue-400">{lo.label}</span> {lo.desc}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs text-[#8b9dc3] font-mono mb-1">Reflection</label>
          <textarea className="w-full bg-navy-800 border border-navy-700 rounded-xl px-4 py-3 text-white placeholder-[#8b9dc3] focus:outline-none focus:border-blue-500 resize-none h-24" placeholder="What did you learn? How did you grow?" value={form.reflection} onChange={e => up('reflection', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-[#8b9dc3] font-mono mb-1">Supervisor (optional)</label>
          <input className="w-full bg-navy-800 border border-navy-700 rounded-xl px-4 py-3 text-white placeholder-[#8b9dc3] focus:outline-none focus:border-blue-500" placeholder="Supervisor name" value={form.supervisor} onChange={e => up('supervisor', e.target.value)} />
        </div>
        <button onClick={save} disabled={!form.name.trim()} className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-syne font-semibold disabled:opacity-40 transition-all">Add Activity</button>
      </div>
    </Modal>
  );
}

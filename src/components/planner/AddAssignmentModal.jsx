import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Modal from '../shared/Modal';

const TYPES = ['Test', 'IA Draft', 'Essay', 'Assignment', 'Other'];
const PRIORITIES = ['High', 'Medium', 'Low'];

// Generate 24 hour options in 12-hour AM/PM format.
// Stored value is 24-hour "HH:00" string; label is locale-friendly 12h format.
const TIME_OPTIONS = Array.from({ length: 24 }, (_, h) => {
  const date = new Date(2000, 0, 1, h, 0, 0);
  const label = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  const value = String(h).padStart(2, '0') + ':00';
  return { label, value };
});

export default function AddAssignmentModal({ open, onClose, initial }) {
  const { state, dispatch } = useApp();
  const [form, setForm] = useState(() => initial || {
    subjectId: state.subjects[0]?.id || '',
    title: '',
    type: 'Assignment',
    dueDate: '',
    dueTime: '',
    priority: 'Medium',
    estimatedTime: '',
    notes: '',
  });

  React.useEffect(() => {
    if (open) setForm(initial || {
      subjectId: state.subjects[0]?.id || '',
      title: '',
      type: 'Assignment',
      dueDate: '',
      dueTime: '',
      priority: 'Medium',
      estimatedTime: '',
      notes: '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial, state.subjects]);

  const save = () => {
    if (!form.title.trim()) return;
    dispatch({ type: 'ADD_ASSIGNMENT', assignment: { ...form, id: crypto.randomUUID(), completed: false } });
    onClose();
  };

  const up = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Modal open={open} onClose={onClose} title="Add Assignment">
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-[#8b9dc3] font-mono mb-1">Subject</label>
          <select className="w-full bg-navy-800 border border-navy-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" value={form.subjectId} onChange={e => up('subjectId', e.target.value)}>
            {state.subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-[#8b9dc3] font-mono mb-1">Task Name *</label>
          <input className="w-full bg-navy-800 border border-navy-700 rounded-xl px-4 py-3 text-white placeholder-[#8b9dc3] focus:outline-none focus:border-blue-500" placeholder="e.g. Maths IA Draft" value={form.title} onChange={e => up('title', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[#8b9dc3] font-mono mb-1">Type</label>
            <select className="w-full bg-navy-800 border border-navy-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" value={form.type} onChange={e => up('type', e.target.value)}>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#8b9dc3] font-mono mb-1">Priority</label>
            <select className="w-full bg-navy-800 border border-navy-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" value={form.priority} onChange={e => up('priority', e.target.value)}>
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs text-[#8b9dc3] font-mono mb-1">Due Date</label>
          <input type="date" className="w-full bg-navy-800 border border-navy-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" value={form.dueDate} onChange={e => up('dueDate', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-[#8b9dc3] font-mono mb-1">Due Time</label>
          <select className="w-full bg-navy-800 border border-navy-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" value={form.dueTime} onChange={e => up('dueTime', e.target.value)}>
            <option value="">No due time</option>
            {TIME_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-[#8b9dc3] font-mono mb-1">Estimated Time</label>
          <input className="w-full bg-navy-800 border border-navy-700 rounded-xl px-4 py-3 text-white placeholder-[#8b9dc3] focus:outline-none focus:border-blue-500" placeholder="e.g. 2 hours" value={form.estimatedTime} onChange={e => up('estimatedTime', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-[#8b9dc3] font-mono mb-1">Notes</label>
          <textarea className="w-full bg-navy-800 border border-navy-700 rounded-xl px-4 py-3 text-white placeholder-[#8b9dc3] focus:outline-none focus:border-blue-500 resize-none h-20" placeholder="Optional notes..." value={form.notes} onChange={e => up('notes', e.target.value)} />
        </div>
        <button onClick={save} disabled={!form.title.trim()} className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-syne font-semibold disabled:opacity-40 transition-all">Add Assignment</button>
      </div>
    </Modal>
  );
}

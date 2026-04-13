import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Modal from '../shared/Modal';

export default function ResourcesTab({ subjectId }) {
  const { state, dispatch } = useApp();
  const resources = state.resources[subjectId] || [];
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: '', url: '' });

  const save = () => {
    if (!form.title.trim()) return;
    dispatch({ type: 'SET_RESOURCES', subjectId, resources: [...resources, { id: crypto.randomUUID(), ...form }] });
    setModal(false);
    setForm({ title: '', url: '' });
  };

  const del = (id) => dispatch({ type: 'SET_RESOURCES', subjectId, resources: resources.filter(r => r.id !== id) });

  return (
    <div className="space-y-3">
      <button onClick={() => { setForm({ title: '', url: '' }); setModal(true); }} className="w-full py-2.5 rounded-xl text-sm text-blue-400 border border-blue-500/30 hover:border-blue-500 hover:bg-blue-500/10 transition-all font-syne">+ Add resource</button>
      {resources.length === 0 && <p className="text-center text-[#8b9dc3] text-sm py-8">No resources yet.</p>}
      {resources.map(r => (
        <div key={r.id} className="bg-navy-900 border border-navy-700 rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-sm font-semibold truncate block">{r.title}</a>
            <p className="text-[#8b9dc3] text-xs truncate">{r.url}</p>
          </div>
          <button onClick={() => del(r.id)} className="text-[#8b9dc3] hover:text-red-400 text-sm">🗑️</button>
        </div>
      ))}

      <Modal open={modal} onClose={() => setModal(false)} title="Add Resource">
        <div className="space-y-3">
          <input className="w-full bg-navy-800 border border-navy-700 rounded-xl px-4 py-3 text-white placeholder-[#8b9dc3] focus:outline-none focus:border-blue-500" placeholder="Title" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} />
          <input className="w-full bg-navy-800 border border-navy-700 rounded-xl px-4 py-3 text-white placeholder-[#8b9dc3] focus:outline-none focus:border-blue-500" placeholder="URL (https://...)" type="url" value={form.url} onChange={e => setForm(f => ({...f, url: e.target.value}))} />
          <button onClick={save} disabled={!form.title.trim()} className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-semibold disabled:opacity-40 transition-all">Save</button>
        </div>
      </Modal>
    </div>
  );
}

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Modal from '../shared/Modal';

export default function NotesTab({ subjectId }) {
  const { state, dispatch } = useApp();
  const notes = state.notes[subjectId] || [];
  const [modal, setModal] = useState(null); // null | 'add' | note object
  const [form, setForm] = useState({ title: '', content: '' });
  const [viewing, setViewing] = useState(null);

  const save = () => {
    if (!form.title.trim()) return;
    if (modal && typeof modal === 'object' && modal.id) {
      dispatch({ type: 'SET_NOTES', subjectId, notes: notes.map(n => n.id === modal.id ? { ...n, ...form, updatedAt: new Date().toISOString() } : n) });
    } else {
      dispatch({ type: 'SET_NOTES', subjectId, notes: [...notes, { id: crypto.randomUUID(), ...form, updatedAt: new Date().toISOString() }] });
    }
    setModal(null);
    setForm({ title: '', content: '' });
  };

  const del = (id) => dispatch({ type: 'SET_NOTES', subjectId, notes: notes.filter(n => n.id !== id) });

  return (
    <div className="space-y-3">
      <button onClick={() => { setForm({ title: '', content: '' }); setModal('add'); }} className="w-full py-2.5 rounded-xl text-sm text-blue-400 border border-blue-500/30 hover:border-blue-500 hover:bg-blue-500/10 transition-all font-syne">+ New note</button>
      {notes.length === 0 && <p className="text-center text-[#8b9dc3] text-sm py-8">No notes yet.</p>}
      {notes.map(n => (
        <div key={n.id} className="bg-navy-900 border border-navy-700 rounded-xl p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 cursor-pointer" onClick={() => setViewing(n)}>
              <h4 className="text-white font-semibold text-sm">{n.title}</h4>
              <p className="text-[#8b9dc3] text-xs mt-1 line-clamp-2">{n.content}</p>
              <p className="text-[#8b9dc3] text-[10px] font-mono mt-2">{new Date(n.updatedAt).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => { setForm({ title: n.title, content: n.content }); setModal(n); }} className="p-1.5 text-[#8b9dc3] hover:text-white text-sm">✏️</button>
              <button onClick={() => del(n.id)} className="p-1.5 text-[#8b9dc3] hover:text-red-400 text-sm">🗑️</button>
            </div>
          </div>
        </div>
      ))}

      <Modal open={modal !== null} onClose={() => setModal(null)} title={modal && typeof modal === 'object' && modal.id ? 'Edit Note' : 'New Note'}>
        <div className="space-y-3">
          <input className="w-full bg-navy-800 border border-navy-700 rounded-xl px-4 py-3 text-white placeholder-[#8b9dc3] focus:outline-none focus:border-blue-500" placeholder="Title" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} />
          <textarea className="w-full bg-navy-800 border border-navy-700 rounded-xl px-4 py-3 text-white placeholder-[#8b9dc3] focus:outline-none focus:border-blue-500 resize-none h-40" placeholder="Content..." value={form.content} onChange={e => setForm(f => ({...f, content: e.target.value}))} />
          <button onClick={save} disabled={!form.title.trim()} className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-semibold disabled:opacity-40 transition-all">Save</button>
        </div>
      </Modal>

      <Modal open={viewing !== null} onClose={() => setViewing(null)} title={viewing?.title || ''}>
        <p className="text-[#e8ecf4] text-sm whitespace-pre-wrap leading-relaxed">{viewing?.content}</p>
      </Modal>
    </div>
  );
}

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import ProgressBar from '../shared/ProgressBar';

export default function ChecklistTab({ subjectId }) {
  const { state, dispatch } = useApp();
  const items = state.checklist[subjectId] || [];
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState('');

  const setItems = (newItems) => dispatch({ type: 'SET_CHECKLIST', subjectId, checklist: newItems });
  const toggle = (id) => setItems(items.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  const del = (id) => setItems(items.filter(i => i.id !== id));
  const add = () => {
    if (!text.trim()) return;
    setItems([...items, { id: crypto.randomUUID(), text: text.trim(), checked: false }]);
    setText('');
    setAdding(false);
  };

  const checked = items.filter(i => i.checked).length;

  return (
    <div className="space-y-3">
      {items.length > 0 && (
        <div>
          <div className="flex justify-between text-xs font-mono text-[#8b9dc3] mb-1">
            <span>{checked}/{items.length} completed</span>
            <span>{items.length > 0 ? Math.round((checked/items.length)*100) : 0}%</span>
          </div>
          <ProgressBar value={checked} max={items.length} colour="#22c55e" />
        </div>
      )}

      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-3 bg-navy-900 border border-navy-700 rounded-xl px-4 py-3">
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => toggle(item.id)}
              className="w-4 h-4 accent-blue-500 flex-shrink-0"
            />
            <span className={`flex-1 text-sm ${item.checked ? 'line-through text-[#8b9dc3]' : 'text-white'}`}>{item.text}</span>
            <button onClick={() => del(item.id)} className="text-[#8b9dc3] hover:text-red-400 text-sm">×</button>
          </div>
        ))}
      </div>

      {adding ? (
        <div className="flex gap-2">
          <input
            autoFocus
            className="flex-1 bg-navy-800 border border-navy-700 rounded-xl px-4 py-2.5 text-white placeholder-[#8b9dc3] text-sm focus:outline-none focus:border-blue-500"
            placeholder="New item..."
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') add(); if (e.key === 'Escape') { setAdding(false); setText(''); } }}
          />
          <button onClick={add} className="px-4 py-2.5 bg-blue-500 hover:bg-blue-400 text-white text-sm rounded-xl font-semibold transition-all">Add</button>
          <button onClick={() => { setAdding(false); setText(''); }} className="px-3 py-2.5 bg-navy-700 text-[#8b9dc3] text-sm rounded-xl transition-all">✕</button>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="w-full py-2.5 rounded-xl text-sm text-blue-400 border border-blue-500/30 hover:border-blue-500 hover:bg-blue-500/10 transition-all font-syne">+ Add item</button>
      )}
    </div>
  );
}

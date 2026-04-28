import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import ProgressBar from '../shared/ProgressBar';

export default function ChecklistTab({ subjectId }) {
  const { state, dispatch } = useApp();
  const items = state.checklist[subjectId] || [];
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState('');
  const [showAssignments, setShowAssignments] = useState(true);

  const setItems = (newItems) => dispatch({ type: 'SET_CHECKLIST', subjectId, checklist: newItems });
  const toggle = (id) => setItems(items.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  const del = (id) => setItems(items.filter(i => i.id !== id));
  const add = () => {
    if (!text.trim()) return;
    setItems([...items, { id: crypto.randomUUID(), text: text.trim(), checked: false }]);
    setText('');
    setAdding(false);
  };

  // Subject assignments linked to this checklist
  const subjectAssignments = (state.assignments || [])
    .filter(a => a.subjectId === subjectId)
    .sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0));

  const toggleAssignment = (id) => {
    const a = state.assignments.find(x => x.id === id);
    if (a) dispatch({ type: 'UPDATE_ASSIGNMENT', assignment: { ...a, completed: !a.completed } });
  };

  const today = new Date();
  const daysLeft = (dateStr) => dateStr ? Math.ceil((new Date(dateStr) - today) / 86400000) : null;

  // Combined progress: checklist items + incomplete assignments
  const totalItems = items.length + subjectAssignments.length;
  const checkedItems = items.filter(i => i.checked).length + subjectAssignments.filter(a => a.completed).length;

  return (
    <div className="space-y-4">
      {totalItems > 0 && (
        <div>
          <div className="flex justify-between text-xs font-mono text-[#8b9dc3] mb-1">
            <span>{checkedItems}/{totalItems} completed</span>
            <span>{Math.round((checkedItems / totalItems) * 100)}%</span>
          </div>
          <ProgressBar value={checkedItems} max={totalItems} colour="#22c55e" />
        </div>
      )}

      {/* Assignments section */}
      {subjectAssignments.length > 0 && (
        <div>
          <button
            onClick={() => setShowAssignments(v => !v)}
            className="flex items-center gap-2 text-xs font-mono text-[#8b9dc3] mb-2 hover:text-white transition-colors"
          >
            <span>{showAssignments ? '▾' : '▸'}</span>
            <span className="uppercase tracking-wider">Assignments ({subjectAssignments.length})</span>
          </button>
          {showAssignments && (
            <div className="space-y-2">
              {subjectAssignments.map(a => {
                const days = daysLeft(a.dueDate);
                const overdue = days !== null && days < 0;
                const urgent = days !== null && days <= 3 && !overdue;
                return (
                  <div key={a.id} className={`flex items-center gap-3 bg-navy-900 border border-navy-700 rounded-xl px-4 py-3 ${a.completed ? 'opacity-50' : ''}`}>
                    <input
                      type="checkbox"
                      checked={a.completed}
                      onChange={() => toggleAssignment(a.id)}
                      className="w-4 h-4 accent-blue-500 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm block ${a.completed ? 'line-through text-[#8b9dc3]' : 'text-white'}`}>{a.title}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-navy-800 text-[#8b9dc3] border border-navy-700">{a.type}</span>
                        {a.dueDate && (
                          <span className={`text-[10px] font-mono ${overdue ? 'text-red-400' : urgent ? 'text-amber-400' : 'text-[#8b9dc3]'}`}>
                            {overdue ? '⚠️ Overdue' : days === 0 ? 'Due today' : `${days}d left`}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-blue-400 opacity-60">linked</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Manual checklist */}
      {items.length > 0 && (
        <div>
          <p className="text-xs font-mono text-[#8b9dc3] uppercase tracking-wider mb-2">Custom Items</p>
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
        </div>
      )}

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

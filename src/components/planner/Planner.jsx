import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import AddAssignmentModal from './AddAssignmentModal';
import CalendarView from './CalendarView';

const PRIORITY_COLOURS = { High: '#ef4444', Medium: '#f59e0b', Low: '#22c55e' };
const FILTER_OPTS = ['All', 'Active', 'Completed'];

export default function Planner() {
  const { state, dispatch } = useApp();
  const [filter, setFilter] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [view, setView] = useState('list'); // 'list' | 'calendar'

  const today = new Date();

  const daysLeft = (dateStr) => {
    if (!dateStr) return null;
    return Math.ceil((new Date(dateStr) - today) / 86400000);
  };

  const filtered = state.assignments
    .filter(a => {
      if (filter === 'Active') return !a.completed;
      if (filter === 'Completed') return a.completed;
      return true;
    })
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return new Date(a.dueDate || 0) - new Date(b.dueDate || 0);
    });

  const toggle = (id) => {
    const a = state.assignments.find(x => x.id === id);
    dispatch({ type: 'UPDATE_ASSIGNMENT', assignment: { ...a, completed: !a.completed } });
  };

  const del = (id) => dispatch({ type: 'DELETE_ASSIGNMENT', id });

  return (
    <div className="pb-20">
      <div className="px-4 pt-6 pb-3">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-syne font-extrabold text-2xl text-white">Planner</h1>
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex bg-navy-800 border border-navy-700 rounded-xl overflow-hidden">
              <button
                onClick={() => setView('list')}
                className={`px-3 py-1.5 text-sm font-syne font-semibold transition-all ${view === 'list' ? 'bg-blue-500 text-white' : 'text-[#8b9dc3] hover:text-white'}`}
              >☰ List</button>
              <button
                onClick={() => setView('calendar')}
                className={`px-3 py-1.5 text-sm font-syne font-semibold transition-all ${view === 'calendar' ? 'bg-blue-500 text-white' : 'text-[#8b9dc3] hover:text-white'}`}
              >📅 Cal</button>
            </div>
            {view === 'list' && (
              <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white text-sm rounded-xl font-syne font-semibold transition-all">+ Add</button>
            )}
          </div>
        </div>
        {view === 'list' && (
          <div className="flex gap-2">
            {FILTER_OPTS.map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full text-sm font-syne font-semibold transition-all ${filter === f ? 'bg-blue-500 text-white' : 'text-[#8b9dc3] hover:text-white'}`}>{f}</button>
            ))}
          </div>
        )}
      </div>

      {view === 'calendar' ? (
        <CalendarView />
      ) : (
        <div className="px-4 space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-[#8b9dc3]">
              {filter === 'Completed' ? 'No completed assignments yet.' : 'No assignments. Add one! 📝'}
            </div>
          ) : (
            filtered.map(a => {
              const subject = state.subjects.find(s => s.id === a.subjectId);
              const days = daysLeft(a.dueDate);
              const overdue = days !== null && days < 0;
              const urgent = days !== null && days <= 3 && !overdue;

              return (
                <div key={a.id} className={`bg-navy-900 border border-navy-700 rounded-2xl overflow-hidden flex transition-all ${a.completed ? 'opacity-50' : ''}`}>
                  <div className="w-1 flex-shrink-0" style={{ backgroundColor: subject?.colour || '#1e3058' }} />
                  <div className="flex-1 p-4">
                    <div className="flex items-start gap-2">
                      <input type="checkbox" checked={a.completed} onChange={() => toggle(a.id)} className="mt-0.5 w-4 h-4 accent-blue-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                          <span className="text-xs text-[#8b9dc3]" style={{ color: subject?.colour }}>{subject?.name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-navy-800 text-[#8b9dc3] border border-navy-700">{a.type}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded text-white border" style={{ color: PRIORITY_COLOURS[a.priority], borderColor: PRIORITY_COLOURS[a.priority] + '44', backgroundColor: PRIORITY_COLOURS[a.priority] + '15' }}>{a.priority}</span>
                        </div>
                        <div className={`font-syne font-semibold text-sm ${a.completed ? 'line-through text-[#8b9dc3]' : 'text-white'}`}>{a.title}</div>
                        {a.dueDate && (
                          <div className={`text-xs font-mono mt-1 ${overdue ? 'text-red-400' : urgent ? 'text-amber-400' : 'text-[#8b9dc3]'}`}>
                            {overdue ? '⚠️ Overdue' : `Due ${new Date(a.dueDate + 'T00:00:00').toLocaleDateString()}`}
                            {a.dueTime && (() => {
                              const [h, m] = a.dueTime.split(':').map(Number);
                              const t = new Date(2000, 0, 1, h, m);
                              return ` at ${t.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
                            })()}
                            {!overdue && days !== null && ` · ${days}d left`}
                          </div>
                        )}
                      </div>
                      <button onClick={() => del(a.id)} className="text-[#8b9dc3] hover:text-red-400 text-sm px-1">×</button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      <AddAssignmentModal open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}

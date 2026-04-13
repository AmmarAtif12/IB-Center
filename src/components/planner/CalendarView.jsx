import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import AddAssignmentModal from './AddAssignmentModal';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const PRIORITY_COLOURS = { High: '#ef4444', Medium: '#f59e0b', Low: '#22c55e' };

function toLocalDateStr(date) {
  // Returns YYYY-MM-DD in local time (avoids UTC offset issues)
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function CalendarView() {
  const { state, dispatch } = useApp();
  const today = new Date();

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState(toLocalDateStr(today));
  const [showAdd, setShowAdd] = useState(false);
  const [addInitialDate, setAddInitialDate] = useState('');

  // Build calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const todayStr = toLocalDateStr(today);

  // Group assignments by due date
  const assignmentsByDate = {};
  state.assignments.forEach(a => {
    if (a.dueDate) {
      if (!assignmentsByDate[a.dueDate]) assignmentsByDate[a.dueDate] = [];
      assignmentsByDate[a.dueDate].push(a);
    }
  });

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  // Cells: leading blanks + day cells
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const selectedAssignments = (assignmentsByDate[selectedDate] || [])
    .sort((a, b) => (a.completed ? 1 : 0) - (b.completed ? 1 : 0));

  const toggle = (id) => {
    const a = state.assignments.find(x => x.id === id);
    dispatch({ type: 'UPDATE_ASSIGNMENT', assignment: { ...a, completed: !a.completed } });
  };
  const del = (id) => dispatch({ type: 'DELETE_ASSIGNMENT', id });

  const openAddForDate = (dateStr) => {
    setAddInitialDate(dateStr);
    setShowAdd(true);
  };

  return (
    <div className="pb-20">
      {/* Month navigation */}
      <div className="sticky top-0 z-20 bg-navy-950/95 backdrop-blur border-b border-navy-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={prevMonth}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-navy-800 hover:bg-navy-700 text-white transition-all text-lg"
          >‹</button>
          <span className="font-syne font-bold text-white text-lg">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>
          <button
            onClick={nextMonth}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-navy-800 hover:bg-navy-700 text-white transition-all text-lg"
          >›</button>
        </div>
      </div>

      {/* Day-of-week headers */}
      <div className="px-3 pt-3">
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map(d => (
            <div key={d} className="text-center text-[10px] font-mono text-[#8b9dc3] pb-1">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {cells.map((day, idx) => {
            if (day === null) return <div key={`blank-${idx}`} />;
            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
            const dayAssignments = assignmentsByDate[dateStr] || [];
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;
            const hasOverdue = dayAssignments.some(a => !a.completed);

            // Subject colours for dots (up to 3)
            const dotColours = dayAssignments
              .filter(a => !a.completed)
              .slice(0, 3)
              .map(a => state.subjects.find(s => s.id === a.subjectId)?.colour || '#3b82f6');

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`relative flex flex-col items-center pt-1.5 pb-1 rounded-xl transition-all min-h-[48px]
                  ${isSelected ? 'bg-blue-500' : isToday ? 'bg-navy-800 ring-1 ring-blue-500/60' : 'hover:bg-navy-800'}
                `}
              >
                <span className={`text-xs font-mono font-semibold leading-none
                  ${isSelected ? 'text-white' : isToday ? 'text-blue-400' : 'text-white'}
                `}>{day}</span>
                {/* Dot row */}
                {dotColours.length > 0 && (
                  <div className="flex gap-0.5 mt-1.5">
                    {dotColours.map((c, i) => (
                      <span key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isSelected ? '#fff' : c }} />
                    ))}
                    {dayAssignments.filter(a => !a.completed).length > 3 && (
                      <span className={`text-[8px] font-mono ${isSelected ? 'text-white' : 'text-[#8b9dc3]'}`}>
                        +{dayAssignments.filter(a => !a.completed).length - 3}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day panel */}
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-syne font-semibold text-white">
            {selectedDate === todayStr ? 'Today' : new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>
          <button
            onClick={() => openAddForDate(selectedDate)}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-400 text-white text-xs rounded-xl font-syne font-semibold transition-all"
          >+ Add</button>
        </div>

        {selectedAssignments.length === 0 ? (
          <div className="text-center py-8 text-[#8b9dc3] text-sm">No assignments due this day.</div>
        ) : (
          <div className="space-y-2">
            {selectedAssignments.map(a => {
              const subject = state.subjects.find(s => s.id === a.subjectId);
              return (
                <div
                  key={a.id}
                  className={`bg-navy-900 border border-navy-700 rounded-2xl overflow-hidden flex transition-all ${a.completed ? 'opacity-50' : ''}`}
                >
                  <div className="w-1 flex-shrink-0" style={{ backgroundColor: subject?.colour || '#1e3058' }} />
                  <div className="flex-1 p-3">
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={a.completed}
                        onChange={() => toggle(a.id)}
                        className="mt-0.5 w-4 h-4 accent-blue-500 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                          <span className="text-xs" style={{ color: subject?.colour }}>{subject?.name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-navy-800 text-[#8b9dc3] border border-navy-700">{a.type}</span>
                          <span
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded border"
                            style={{ color: PRIORITY_COLOURS[a.priority], borderColor: PRIORITY_COLOURS[a.priority] + '44', backgroundColor: PRIORITY_COLOURS[a.priority] + '15' }}
                          >{a.priority}</span>
                        </div>
                        <div className={`font-syne font-semibold text-sm ${a.completed ? 'line-through text-[#8b9dc3]' : 'text-white'}`}>
                          {a.title}
                        </div>
                        {a.estimatedTime && (
                          <div className="text-xs font-mono text-[#8b9dc3] mt-0.5">⏱ {a.estimatedTime}</div>
                        )}
                      </div>
                      <button onClick={() => del(a.id)} className="text-[#8b9dc3] hover:text-red-400 text-sm px-1">×</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAdd && (
        <AddAssignmentModal
          open={showAdd}
          onClose={() => setShowAdd(false)}
          initial={{
            subjectId: state.subjects[0]?.id || '',
            title: '',
            type: 'Assignment',
            dueDate: addInitialDate,
            priority: 'Medium',
            estimatedTime: '',
            notes: '',
          }}
        />
      )}
    </div>
  );
}

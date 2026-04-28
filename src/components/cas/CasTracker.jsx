import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import StrandRing from './StrandRing';
import AddCasModal from './AddCasModal';
import { CAS_LOS } from '../../utils/grades';

const STRAND_COLOURS = { Creativity: '#8b5cf6', Activity: '#22c55e', Service: '#3b82f6' };
const FILTER_OPTS = ['All', 'Creativity', 'Activity', 'Service'];

export default function CasTracker() {
  const { state, dispatch } = useApp();
  const [filter, setFilter] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [expanded, setExpanded] = useState({});

  const strandHours = (strand) => state.casEntries.filter(e => e.strand === strand).reduce((s, e) => s + (e.hours || 0), 0);

  const filtered = state.casEntries.filter(e => filter === 'All' || e.strand === filter)
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  const del = (id) => dispatch({ type: 'DELETE_CAS_ENTRY', id });

  return (
    <div className="pb-20">
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-syne font-extrabold text-2xl text-white">CAS Tracker</h1>
          <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white text-sm rounded-xl font-syne font-semibold transition-all">+ Add</button>
        </div>

        <div className="bg-navy-900 border border-navy-700 rounded-2xl p-4 mb-4">
          <div className="flex justify-around">
            {['Creativity','Activity','Service'].map(strand => (
              <StrandRing key={strand} strand={strand} hours={strandHours(strand)} />
            ))}
          </div>
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto">
          {FILTER_OPTS.map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-syne font-semibold transition-all ${filter === f ? 'bg-blue-500 text-white' : 'text-[#8b9dc3] hover:text-white'}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="px-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-[#8b9dc3]">No CAS entries yet. Add your first activity!</div>
        ) : (
          filtered.map(entry => (
            <div key={entry.id} className="bg-navy-900 border border-navy-700 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: STRAND_COLOURS[entry.strand] }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full" style={{ color: STRAND_COLOURS[entry.strand], backgroundColor: STRAND_COLOURS[entry.strand] + '20' }}>{entry.strand}</span>
                    <span className="text-[#8b9dc3] text-xs font-mono">{entry.date} · {entry.hours}h</span>
                  </div>
                  <div className="text-white font-syne font-semibold text-sm">{entry.name}</div>
                  {entry.learningOutcomes?.length > 0 && (
                    <div className="flex gap-1 flex-wrap mt-1.5">
                      {entry.learningOutcomes.map(lo => (
                        <span key={lo} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">{lo}</span>
                      ))}
                    </div>
                  )}
                  {entry.reflection && (
                    <div className="mt-2">
                      <p className={`text-[#8b9dc3] text-xs leading-relaxed ${expanded[entry.id] ? '' : 'line-clamp-2'}`}>{entry.reflection}</p>
                      {entry.reflection.length > 100 && (
                        <button onClick={() => setExpanded(e => ({ ...e, [entry.id]: !e[entry.id] }))} className="text-blue-400 text-xs mt-0.5 hover:underline">
                          {expanded[entry.id] ? 'Show less' : 'Show more'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <button onClick={() => del(entry.id)} className="text-[#8b9dc3] hover:text-red-400 text-sm px-1 flex-shrink-0">×</button>
              </div>
            </div>
          ))
        )}
      </div>

      <AddCasModal open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}

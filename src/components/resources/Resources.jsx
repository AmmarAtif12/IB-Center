import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RESOURCES, TYPE_LABELS } from './resourcesData';

function ResourceCard({ subject }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-navy-900 border border-navy-700 rounded-2xl overflow-hidden" style={{ borderTopColor: subject.colour, borderTopWidth: 3 }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-navy-800 transition-all text-left"
      >
        <span className="text-xl leading-none">{subject.icon}</span>
        <span className="font-syne font-semibold text-white text-sm flex-1">{subject.name}</span>
        <span className="text-[#8b9dc3] text-xs font-mono">{subject.resources.length} links</span>
        <span className={`text-[#8b9dc3] transition-transform duration-200 text-sm ml-1 ${open ? 'rotate-90' : ''}`}>›</span>
      </button>

      {open && (
        <div className="border-t border-navy-700 divide-y divide-navy-800">
          {subject.resources.map((r, i) => {
            const meta = TYPE_LABELS[r.type] || TYPE_LABELS.notes;
            return (
              <a
                key={i}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 hover:bg-navy-800 transition-all group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold group-hover:text-blue-400 transition-colors truncate">{r.title}</p>
                  <p className="text-[#8b9dc3] text-xs truncate mt-0.5">{r.url.replace(/^https?:\/\//, '').split('/')[0]}</p>
                </div>
                <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${meta.colour}`}>
                  {meta.label}
                </span>
                <span className="text-[#8b9dc3] text-xs group-hover:text-blue-400 transition-colors flex-shrink-0">↗</span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Resources() {
  const { state } = useApp();
  const defaultProg = state.profile.programme === 'MYP' ? 'MYP' : 'DP';
  const [prog, setProg] = useState(defaultProg);

  const subjects = RESOURCES[prog] || [];

  return (
    <div className="pb-20 px-4 pt-6">
      <h1 className="font-syne font-extrabold text-2xl text-white mb-1">Resources</h1>
      <p className="text-[#8b9dc3] text-sm mb-5">Curated study links for each subject</p>

      {/* Programme toggle */}
      <div className="flex gap-1 mb-5 bg-navy-900 border border-navy-700 rounded-2xl p-1">
        {['DP', 'MYP'].map(p => (
          <button
            key={p}
            onClick={() => setProg(p)}
            className={`flex-1 py-2 rounded-xl text-sm font-syne font-semibold transition-all ${
              prog === p ? 'bg-blue-500 text-white' : 'text-[#8b9dc3] hover:text-white'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {subjects.map(subject => (
          <ResourceCard key={subject.id} subject={subject} />
        ))}
      </div>
    </div>
  );
}

import React from 'react';

export default function Step3Confirm({ profile, subjects, onBack, onFinish }) {
  return (
    <div className="bg-navy-900 rounded-2xl border border-navy-700 p-6 space-y-6">
      <div className="text-center">
        <div className="text-4xl mb-3">🎉</div>
        <h2 className="font-syne font-bold text-2xl text-white">You're all set, {profile.name}!</h2>
        <p className="text-[#8b9dc3] text-sm mt-1">Here's a summary of your profile</p>
      </div>
      <div className="bg-navy-800 rounded-xl p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-[#8b9dc3]">School</span>
          <span className="text-white">{profile.school || '—'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#8b9dc3]">Programme</span>
          <span className="text-white">{profile.programme} – {profile.year}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#8b9dc3]">Exam Session</span>
          <span className="text-white">{profile.examSession || '—'}</span>
        </div>
      </div>
      <div>
        <h3 className="text-sm font-mono text-[#8b9dc3] mb-2">SUBJECTS ({subjects.filter(s=>s.name).length})</h3>
        <div className="space-y-2">
          {subjects.filter(s=>s.name).map(s => (
            <div key={s.id} className="flex items-center gap-3 bg-navy-800 rounded-xl px-4 py-2.5">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.colour }} />
              <span className="flex-1 text-white text-sm">{s.name}</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-navy-700 text-[#8b9dc3]">{s.level}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-3 rounded-xl font-syne font-semibold text-[#8b9dc3] bg-navy-800 hover:bg-navy-700 transition-all">← Back</button>
        <button onClick={onFinish} className="flex-1 py-3 rounded-xl font-syne font-semibold text-white bg-blue-500 hover:bg-blue-400 transition-all">Start using IB Central</button>
      </div>
    </div>
  );
}

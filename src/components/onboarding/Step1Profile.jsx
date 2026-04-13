import React from 'react';

export default function Step1Profile({ profile, setProfile, onNext }) {
  const update = (k, v) => setProfile(p => ({ ...p, [k]: v }));
  const valid = profile.name.trim().length > 0;

  return (
    <div className="bg-navy-900 rounded-2xl border border-navy-700 p-6 space-y-4">
      <h2 className="font-syne font-bold text-xl text-white">Tell us about yourself</h2>
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-[#8b9dc3] mb-1 font-mono">Student Name *</label>
          <input
            className="w-full bg-navy-800 border border-navy-700 rounded-xl px-4 py-3 text-white placeholder-[#8b9dc3] focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="Your name"
            value={profile.name}
            onChange={e => update('name', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs text-[#8b9dc3] mb-1 font-mono">School Name</label>
          <input
            className="w-full bg-navy-800 border border-navy-700 rounded-xl px-4 py-3 text-white placeholder-[#8b9dc3] focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="Your school"
            value={profile.school}
            onChange={e => update('school', e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[#8b9dc3] mb-1 font-mono">Programme</label>
            <select
              className="w-full bg-navy-800 border border-navy-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              value={profile.programme}
              onChange={e => update('programme', e.target.value)}
            >
              <option value="DP">DP</option>
              <option value="MYP">MYP</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#8b9dc3] mb-1 font-mono">Year</label>
            <select
              className="w-full bg-navy-800 border border-navy-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              value={profile.year}
              onChange={e => update('year', e.target.value)}
            >
              <option>Year 1</option>
              <option>Year 2</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs text-[#8b9dc3] mb-1 font-mono">Exam Session</label>
          <input
            className="w-full bg-navy-800 border border-navy-700 rounded-xl px-4 py-3 text-white placeholder-[#8b9dc3] focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="e.g. May 2026"
            value={profile.examSession}
            onChange={e => update('examSession', e.target.value)}
          />
        </div>
      </div>
      <button
        disabled={!valid}
        onClick={onNext}
        className="w-full py-3 rounded-xl font-syne font-semibold text-white bg-blue-500 hover:bg-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        Next →
      </button>
    </div>
  );
}

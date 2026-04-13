import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SUBJECT_COLOURS, GROUPS } from '../../utils/grades';
import { clearState } from '../../utils/storage';

export default function Settings({ onClose }) {
  const { state, dispatch } = useApp();
  const [resetConfirm, setResetConfirm] = useState(0); // 0=idle, 1=first confirm, 2=second confirm
  const [editSubject, setEditSubject] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [addingSubject, setAddingSubject] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', level: 'SL', group: '1', colour: SUBJECT_COLOURS[0] });
  const [profile, setProfile] = useState({ ...state.profile });

  const saveProfile = () => dispatch({ type: 'UPDATE_PROFILE', payload: profile });

  const handleReset = () => {
    if (resetConfirm === 0) { setResetConfirm(1); return; }
    if (resetConfirm === 1) { setResetConfirm(2); return; }
    clearState();
    dispatch({ type: 'RESET' });
  };

  const saveSubject = () => {
    if (!editSubject.name.trim()) return;
    dispatch({ type: 'UPDATE_SUBJECT', subject: editSubject });
    setEditSubject(null);
  };

  const confirmDelete = (id) => {
    dispatch({ type: 'DELETE_SUBJECT', id });
    setDeleteConfirm(null);
  };

  const addSubject = () => {
    if (!newSubject.name.trim()) return;
    dispatch({ type: 'ADD_SUBJECT', subject: { ...newSubject, id: crypto.randomUUID() } });
    setNewSubject({ name: '', level: 'SL', group: '1', colour: SUBJECT_COLOURS[0] });
    setAddingSubject(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-navy-950 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-20">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onClose} className="text-[#8b9dc3] hover:text-white text-lg">← Back</button>
          <h1 className="font-syne font-extrabold text-2xl text-white">Settings</h1>
        </div>

        {/* Profile */}
        <section className="mb-6">
          <h2 className="font-syne font-semibold text-[#8b9dc3] text-xs uppercase tracking-wider font-mono mb-3">Profile</h2>
          <div className="bg-navy-900 border border-navy-700 rounded-2xl p-4 space-y-3">
            <div>
              <label className="block text-xs text-[#8b9dc3] font-mono mb-1">Name</label>
              <input className="w-full bg-navy-800 border border-navy-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm" value={profile.name} onChange={e => setProfile(p => ({...p, name: e.target.value}))} />
            </div>
            <div>
              <label className="block text-xs text-[#8b9dc3] font-mono mb-1">School</label>
              <input className="w-full bg-navy-800 border border-navy-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm" value={profile.school} onChange={e => setProfile(p => ({...p, school: e.target.value}))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#8b9dc3] font-mono mb-1">Programme</label>
                <select className="w-full bg-navy-800 border border-navy-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500" value={profile.programme} onChange={e => setProfile(p => ({...p, programme: e.target.value}))}>
                  <option value="DP">DP</option>
                  <option value="MYP">MYP</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#8b9dc3] font-mono mb-1">Year</label>
                <select className="w-full bg-navy-800 border border-navy-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500" value={profile.year} onChange={e => setProfile(p => ({...p, year: e.target.value}))}>
                  <option>Year 1</option>
                  <option>Year 2</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-[#8b9dc3] font-mono mb-1">Exam Session</label>
              <input className="w-full bg-navy-800 border border-navy-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm" value={profile.examSession} onChange={e => setProfile(p => ({...p, examSession: e.target.value}))} />
            </div>
            <button onClick={saveProfile} className="w-full py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-syne font-semibold text-sm transition-all">Save Profile</button>
          </div>
        </section>

        {/* Subjects */}
        <section className="mb-6">
          <h2 className="font-syne font-semibold text-[#8b9dc3] text-xs uppercase tracking-wider font-mono mb-3">Subjects</h2>
          <div className="space-y-2">
            {state.subjects.map(s => (
              <div key={s.id} className="bg-navy-900 border border-navy-700 rounded-2xl p-4">
                {editSubject?.id === s.id ? (
                  <div className="space-y-3">
                    <input className="w-full bg-navy-800 border border-navy-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" value={editSubject.name} onChange={e => setEditSubject(es => ({...es, name: e.target.value}))} />
                    <div className="flex gap-2">
                      {['SL','HL'].map(lvl => (
                        <button key={lvl} onClick={() => setEditSubject(es => ({...es, level: lvl}))} className={`px-4 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all ${editSubject.level === lvl ? 'bg-blue-500 border-blue-500 text-white' : 'bg-navy-800 border-navy-700 text-[#8b9dc3]'}`}>{lvl}</button>
                      ))}
                      <select className="flex-1 bg-navy-800 border border-navy-700 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500" value={editSubject.group} onChange={e => setEditSubject(es => ({...es, group: e.target.value}))}>
                        {GROUPS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                      </select>
                    </div>
                    <div className="flex gap-1.5">
                      {SUBJECT_COLOURS.map(c => (
                        <button key={c} onClick={() => setEditSubject(es => ({...es, colour: c}))} className={`w-6 h-6 rounded-full border-2 transition-all ${editSubject.colour === c ? 'border-white scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={saveSubject} className="flex-1 py-2 rounded-xl text-sm bg-blue-500 hover:bg-blue-400 text-white font-semibold transition-all">Save</button>
                      <button onClick={() => setEditSubject(null)} className="flex-1 py-2 rounded-xl text-sm bg-navy-700 text-[#8b9dc3] hover:bg-navy-600 transition-all">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.colour }} />
                    <div className="flex-1">
                      <span className="text-white font-semibold text-sm">{s.name}</span>
                      <span className="ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-navy-800 text-[#8b9dc3]">{s.level}</span>
                    </div>
                    <button onClick={() => setEditSubject({...s})} className="text-[#8b9dc3] hover:text-white text-sm px-2">✏️</button>
                    <button onClick={() => setDeleteConfirm(s)} className="text-[#8b9dc3] hover:text-red-400 text-sm px-2">🗑️</button>
                  </div>
                )}
              </div>
            ))}

            {addingSubject ? (
              <div className="bg-navy-900 border border-navy-700 rounded-2xl p-4 space-y-3">
                <input className="w-full bg-navy-800 border border-navy-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 placeholder-[#8b9dc3]" placeholder="Subject name" value={newSubject.name} onChange={e => setNewSubject(n => ({...n, name: e.target.value}))} />
                <div className="flex gap-2">
                  {['SL','HL'].map(lvl => (
                    <button key={lvl} onClick={() => setNewSubject(n => ({...n, level: lvl}))} className={`px-4 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all ${newSubject.level === lvl ? 'bg-blue-500 border-blue-500 text-white' : 'bg-navy-800 border-navy-700 text-[#8b9dc3]'}`}>{lvl}</button>
                  ))}
                  <select className="flex-1 bg-navy-800 border border-navy-700 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500" value={newSubject.group} onChange={e => setNewSubject(n => ({...n, group: e.target.value}))}>
                    {GROUPS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                  </select>
                </div>
                <div className="flex gap-1.5">
                  {SUBJECT_COLOURS.map(c => (
                    <button key={c} onClick={() => setNewSubject(n => ({...n, colour: c}))} className={`w-6 h-6 rounded-full border-2 transition-all ${newSubject.colour === c ? 'border-white scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={addSubject} className="flex-1 py-2 rounded-xl text-sm bg-blue-500 hover:bg-blue-400 text-white font-semibold transition-all">Add Subject</button>
                  <button onClick={() => setAddingSubject(false)} className="flex-1 py-2 rounded-xl text-sm bg-navy-700 text-[#8b9dc3] hover:bg-navy-600 transition-all">Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddingSubject(true)} className="w-full py-2.5 rounded-xl text-sm text-blue-400 border border-blue-500/30 hover:border-blue-500 hover:bg-blue-500/10 transition-all font-syne">+ Add subject</button>
            )}
          </div>
        </section>

        {/* Delete confirmation */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70" onClick={() => setDeleteConfirm(null)} />
            <div className="relative bg-navy-900 border border-navy-700 rounded-2xl p-6 max-w-sm w-full">
              <h3 className="font-syne font-bold text-white mb-2">Delete {deleteConfirm.name}?</h3>
              <p className="text-[#8b9dc3] text-sm mb-4">Deleting <strong className="text-white">{deleteConfirm.name}</strong> will also delete all its grade components, notes, resources, and checklist items. Are you sure?</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl bg-navy-800 text-[#8b9dc3] font-semibold hover:bg-navy-700 transition-all">Cancel</button>
                <button onClick={() => confirmDelete(deleteConfirm.id)} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white font-semibold transition-all">Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* Danger Zone */}
        <section className="mb-6">
          <h2 className="font-syne font-semibold text-red-400 text-xs uppercase tracking-wider font-mono mb-3">Danger Zone</h2>
          <div className="bg-navy-900 border border-red-500/30 rounded-2xl p-4">
            <p className="text-[#8b9dc3] text-sm mb-3">Permanently delete all data and return to onboarding.</p>
            {resetConfirm === 0 && (
              <button onClick={handleReset} className="w-full py-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 font-syne font-semibold hover:bg-red-500/25 transition-all">Reset App</button>
            )}
            {resetConfirm === 1 && (
              <div>
                <p className="text-red-400 text-sm font-semibold mb-2">⚠️ Are you sure? This cannot be undone.</p>
                <div className="flex gap-2">
                  <button onClick={() => setResetConfirm(0)} className="flex-1 py-2.5 rounded-xl bg-navy-800 text-[#8b9dc3] font-semibold hover:bg-navy-700 transition-all text-sm">Cancel</button>
                  <button onClick={handleReset} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white font-semibold transition-all text-sm">Yes, reset</button>
                </div>
              </div>
            )}
            {resetConfirm === 2 && (
              <div>
                <p className="text-red-400 text-sm font-semibold mb-2">🚨 Final confirmation – ALL data will be erased!</p>
                <div className="flex gap-2">
                  <button onClick={() => setResetConfirm(0)} className="flex-1 py-2.5 rounded-xl bg-navy-800 text-[#8b9dc3] font-semibold hover:bg-navy-700 transition-all text-sm">Cancel</button>
                  <button onClick={handleReset} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all text-sm">ERASE EVERYTHING</button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

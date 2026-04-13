import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import Modal from '../shared/Modal';

const MAX_PDF_MB = 4;

export default function ExtendedEssay({ onBack }) {
  const { state, dispatch } = useApp();
  const eeData = state.eeData || { meetings: [], resources: [] };
  const meetings = eeData.meetings || [];
  const resources = eeData.resources || [];

  const [tab, setTab] = useState('meetings');
  const [expandedMeeting, setExpandedMeeting] = useState(null);

  // Meeting form state
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [editingMeetingId, setEditingMeetingId] = useState(null);
  const [meetingForm, setMeetingForm] = useState({ date: '', title: '', notes: '' });

  // Resource form state
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [resourceForm, setResourceForm] = useState({ title: '', url: '', type: 'link' });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileRef = useRef(null);

  // ── Meetings ──
  const openAddMeeting = () => {
    setEditingMeetingId(null);
    setMeetingForm({ date: '', title: '', notes: '' });
    setShowMeetingModal(true);
  };

  const openEditMeeting = (m) => {
    setEditingMeetingId(m.id);
    setMeetingForm({ date: m.date, title: m.title, notes: m.notes });
    setShowMeetingModal(true);
  };

  const saveMeeting = () => {
    if (!meetingForm.title.trim()) return;
    const updated = editingMeetingId
      ? meetings.map(m => m.id === editingMeetingId ? { ...m, ...meetingForm } : m)
      : [...meetings, { id: crypto.randomUUID(), ...meetingForm }];
    dispatch({ type: 'SET_EE_DATA', data: { ...eeData, meetings: updated } });
    setShowMeetingModal(false);
  };

  const deleteMeeting = (id) => {
    dispatch({ type: 'SET_EE_DATA', data: { ...eeData, meetings: meetings.filter(m => m.id !== id) } });
    if (expandedMeeting === id) setExpandedMeeting(null);
  };

  // ── Resources ──
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { setUploadError('Only PDF files are supported.'); return; }
    if (file.size > MAX_PDF_MB * 1024 * 1024) { setUploadError(`File too large (max ${MAX_PDF_MB} MB).`); return; }
    setUploadError('');
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setResourceForm(f => ({ ...f, title: f.title || file.name.replace(/\.pdf$/i, ''), url: ev.target.result, type: 'pdf' }));
      setUploading(false);
    };
    reader.onerror = () => { setUploadError('Failed to read file.'); setUploading(false); };
    reader.readAsDataURL(file);
  };

  const saveResource = () => {
    if (!resourceForm.title.trim()) return;
    dispatch({ type: 'SET_EE_DATA', data: { ...eeData, resources: [...resources, { id: crypto.randomUUID(), ...resourceForm }] } });
    setShowResourceModal(false);
    setResourceForm({ title: '', url: '', type: 'link' });
    setUploadError('');
  };

  const deleteResource = (id) => {
    dispatch({ type: 'SET_EE_DATA', data: { ...eeData, resources: resources.filter(r => r.id !== id) } });
  };

  const openResource = (r) => {
    if (r.type === 'pdf' && r.url?.startsWith('data:')) {
      const win = window.open();
      if (win) win.document.write(`<iframe src="${r.url}" width="100%" height="100%" style="border:none;"></iframe>`);
    } else if (r.url) {
      window.open(r.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-navy-950/95 backdrop-blur border-b border-navy-700 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-[#8b9dc3] hover:text-white text-lg leading-none">←</button>
          <h1 className="font-syne font-extrabold text-xl text-white flex-1">Extended Essay</h1>
        </div>
        <div className="flex gap-1 mt-3">
          {[
            { id: 'meetings', label: '📋 Meetings' },
            { id: 'resources', label: '🔗 Resources' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-syne font-semibold transition-all whitespace-nowrap ${
                tab === t.id ? 'bg-blue-500 text-white' : 'text-[#8b9dc3] hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 space-y-3">
        {/* ── Meetings tab ── */}
        {tab === 'meetings' && (
          <>
            <button
              onClick={openAddMeeting}
              className="w-full py-2.5 rounded-xl text-sm text-blue-400 border border-blue-500/30 hover:border-blue-500 hover:bg-blue-500/10 transition-all font-syne"
            >
              + Add Meeting
            </button>

            {meetings.length === 0 && (
              <p className="text-center text-[#8b9dc3] text-sm py-8">No meetings yet. Record your supervisor meetings here.</p>
            )}

            {[...meetings].reverse().map(m => (
              <div key={m.id} className="bg-navy-900 border border-navy-700 rounded-2xl overflow-hidden">
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-navy-800 transition-colors text-left"
                  onClick={() => setExpandedMeeting(e => e === m.id ? null : m.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-syne font-semibold text-sm truncate">{m.title}</div>
                    {m.date && (
                      <div className="text-[#8b9dc3] text-xs font-mono mt-0.5">
                        {(() => {
                          const d = new Date(m.date + 'T00:00:00');
                          return isNaN(d.getTime()) ? m.date : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
                        })()}
                      </div>
                    )}
                  </div>
                  <span className={`text-[#8b9dc3] text-sm flex-shrink-0 transition-transform duration-200 ${expandedMeeting === m.id ? 'rotate-180' : ''}`}>▾</span>
                </button>

                {expandedMeeting === m.id && (
                  <div className="px-4 pb-4 border-t border-navy-700 pt-3 space-y-3">
                    {m.notes ? (
                      <p className="text-[#8b9dc3] text-sm whitespace-pre-wrap leading-relaxed">{m.notes}</p>
                    ) : (
                      <p className="text-[#8b9dc3] text-sm italic">No notes for this meeting.</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditMeeting(m)}
                        className="flex-1 py-2 rounded-lg text-sm font-semibold bg-navy-800 hover:bg-navy-700 border border-navy-700 text-[#8b9dc3] hover:text-white transition-all"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => deleteMeeting(m.id)}
                        className="px-4 py-2 rounded-lg text-sm font-semibold bg-navy-800 border border-navy-700 text-[#8b9dc3] hover:text-red-400 hover:border-red-500/30 transition-all"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {/* ── Resources tab ── */}
        {tab === 'resources' && (
          <>
            <button
              onClick={() => { setResourceForm({ title: '', url: '', type: 'link' }); setUploadError(''); setShowResourceModal(true); }}
              className="w-full py-2.5 rounded-xl text-sm text-blue-400 border border-blue-500/30 hover:border-blue-500 hover:bg-blue-500/10 transition-all font-syne"
            >
              + Add Resource
            </button>

            {resources.length === 0 && (
              <p className="text-center text-[#8b9dc3] text-sm py-8">No resources yet. Add links or PDFs for quick access.</p>
            )}

            {resources.map(r => (
              <div key={r.id} className="bg-navy-900 border border-navy-700 rounded-xl px-4 py-3 flex items-center gap-3">
                <span className="text-lg flex-shrink-0">{r.type === 'pdf' ? '📄' : '🔗'}</span>
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => openResource(r)}
                    className="text-blue-400 hover:underline text-sm font-semibold truncate block text-left w-full"
                  >
                    {r.title}
                  </button>
                  {r.type !== 'pdf' && <p className="text-[#8b9dc3] text-xs truncate">{r.url}</p>}
                  {r.type === 'pdf' && <p className="text-[#8b9dc3] text-xs font-mono">PDF · click to open</p>}
                </div>
                <button onClick={() => deleteResource(r.id)} className="text-[#8b9dc3] hover:text-red-400 text-sm flex-shrink-0">🗑️</button>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Meeting Modal */}
      <Modal
        open={showMeetingModal}
        onClose={() => setShowMeetingModal(false)}
        title={editingMeetingId ? 'Edit Meeting' : 'Add Meeting'}
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-[#8b9dc3] font-mono mb-1">Date</label>
            <input
              type="date"
              className="w-full bg-navy-800 border border-navy-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              value={meetingForm.date}
              onChange={e => setMeetingForm(f => ({ ...f, date: e.target.value }))}
            />
          </div>
          <input
            className="w-full bg-navy-800 border border-navy-700 rounded-xl px-4 py-3 text-white placeholder-[#8b9dc3] focus:outline-none focus:border-blue-500"
            placeholder="Meeting title (e.g. Check-in #1)"
            value={meetingForm.title}
            onChange={e => setMeetingForm(f => ({ ...f, title: e.target.value }))}
          />
          <textarea
            className="w-full bg-navy-800 border border-navy-700 rounded-xl px-4 py-3 text-white placeholder-[#8b9dc3] focus:outline-none focus:border-blue-500 resize-none"
            placeholder="Meeting notes…"
            rows={5}
            value={meetingForm.notes}
            onChange={e => setMeetingForm(f => ({ ...f, notes: e.target.value }))}
          />
          <button
            onClick={saveMeeting}
            disabled={!meetingForm.title.trim()}
            className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-semibold disabled:opacity-40 transition-all"
          >
            {editingMeetingId ? 'Save Changes' : 'Add Meeting'}
          </button>
        </div>
      </Modal>

      {/* Resource Modal */}
      <Modal
        open={showResourceModal}
        onClose={() => setShowResourceModal(false)}
        title="Add Resource"
      >
        <div className="space-y-3">
          <div className="flex gap-2">
            {[{ id: 'link', label: '🔗 Link' }, { id: 'pdf', label: '📄 PDF' }].map(t => (
              <button
                key={t.id}
                onClick={() => setResourceForm(f => ({ ...f, type: t.id, url: '' }))}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${
                  resourceForm.type === t.id
                    ? 'bg-blue-500/15 border-blue-500 text-blue-400'
                    : 'bg-navy-800 border-navy-700 text-[#8b9dc3] hover:border-blue-500/50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <input
            className="w-full bg-navy-800 border border-navy-700 rounded-xl px-4 py-3 text-white placeholder-[#8b9dc3] focus:outline-none focus:border-blue-500"
            placeholder="Title"
            value={resourceForm.title}
            onChange={e => setResourceForm(f => ({ ...f, title: e.target.value }))}
          />

          {resourceForm.type === 'link' && (
            <input
              className="w-full bg-navy-800 border border-navy-700 rounded-xl px-4 py-3 text-white placeholder-[#8b9dc3] focus:outline-none focus:border-blue-500"
              placeholder="URL (https://...)"
              type="url"
              value={resourceForm.url}
              onChange={e => setResourceForm(f => ({ ...f, url: e.target.value }))}
            />
          )}

          {resourceForm.type === 'pdf' && (
            <div>
              <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={handleFile} />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-full py-3 rounded-xl bg-navy-800 border border-navy-700 text-[#8b9dc3] hover:border-blue-500 text-sm transition-all"
              >
                {uploading ? 'Reading file…' : resourceForm.url ? '✅ PDF loaded — tap to replace' : '📂 Choose PDF (max 4 MB)'}
              </button>
              {uploadError && <p className="text-red-400 text-xs mt-1">{uploadError}</p>}
              <p className="text-[10px] text-[#8b9dc3] mt-1 font-mono">PDFs are stored locally in your browser.</p>
            </div>
          )}

          <button
            onClick={saveResource}
            disabled={!resourceForm.title.trim() || (resourceForm.type === 'pdf' && !resourceForm.url) || uploading}
            className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-semibold disabled:opacity-40 transition-all"
          >
            Save
          </button>
        </div>
      </Modal>
    </div>
  );
}

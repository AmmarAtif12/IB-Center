import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import Modal from '../shared/Modal';

const MAX_PDF_MB = 4;

export default function ResourcesTab({ subjectId }) {
  const { state, dispatch } = useApp();
  const resources = state.resources[subjectId] || [];
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: '', url: '', type: 'link' }); // type: 'link' | 'pdf'
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileRef = useRef(null);

  const save = () => {
    if (!form.title.trim()) return;
    dispatch({ type: 'SET_RESOURCES', subjectId, resources: [...resources, { id: crypto.randomUUID(), ...form }] });
    setModal(false);
    setForm({ title: '', url: '', type: 'link' });
    setUploadError('');
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { setUploadError('Only PDF files are supported.'); return; }
    if (file.size > MAX_PDF_MB * 1024 * 1024) { setUploadError(`File too large (max ${MAX_PDF_MB} MB).`); return; }
    setUploadError('');
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm(f => ({ ...f, title: f.title || file.name.replace(/\.pdf$/i, ''), url: ev.target.result, type: 'pdf' }));
      setUploading(false);
    };
    reader.onerror = () => { setUploadError('Failed to read file.'); setUploading(false); };
    reader.readAsDataURL(file);
  };

  const del = (id) => dispatch({ type: 'SET_RESOURCES', subjectId, resources: resources.filter(r => r.id !== id) });

  const openResource = (r) => {
    if (r.type === 'pdf' && r.url?.startsWith('data:')) {
      const win = window.open();
      if (win) {
        win.document.write(`<iframe src="${r.url}" width="100%" height="100%" style="border:none;"></iframe>`);
      }
    } else if (r.url) {
      window.open(r.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={() => { setForm({ title: '', url: '', type: 'link' }); setUploadError(''); setModal(true); }}
        className="w-full py-2.5 rounded-xl text-sm text-blue-400 border border-blue-500/30 hover:border-blue-500 hover:bg-blue-500/10 transition-all font-syne"
      >
        + Add resource
      </button>

      {resources.length === 0 && <p className="text-center text-[#8b9dc3] text-sm py-8">No resources yet. Add links or PDFs.</p>}

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
          <button onClick={() => del(r.id)} className="text-[#8b9dc3] hover:text-red-400 text-sm">🗑️</button>
        </div>
      ))}

      <Modal open={modal} onClose={() => setModal(false)} title="Add Resource">
        <div className="space-y-3">
          {/* Type selector */}
          <div className="flex gap-2">
            {[{ id: 'link', label: '🔗 Link' }, { id: 'pdf', label: '📄 PDF' }].map(t => (
              <button
                key={t.id}
                onClick={() => setForm(f => ({ ...f, type: t.id, url: '' }))}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all
                  ${form.type === t.id ? 'bg-blue-500/15 border-blue-500 text-blue-400' : 'bg-navy-800 border-navy-700 text-[#8b9dc3] hover:border-blue-500/50'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <input
            className="w-full bg-navy-800 border border-navy-700 rounded-xl px-4 py-3 text-white placeholder-[#8b9dc3] focus:outline-none focus:border-blue-500"
            placeholder="Title"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          />

          {form.type === 'link' && (
            <input
              className="w-full bg-navy-800 border border-navy-700 rounded-xl px-4 py-3 text-white placeholder-[#8b9dc3] focus:outline-none focus:border-blue-500"
              placeholder="URL (https://...)"
              type="url"
              value={form.url}
              onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
            />
          )}

          {form.type === 'pdf' && (
            <div>
              <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={handleFile} />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-full py-3 rounded-xl bg-navy-800 border border-navy-700 text-[#8b9dc3] hover:border-blue-500 text-sm transition-all"
              >
                {uploading ? 'Reading file…' : form.url ? '✅ PDF loaded — tap to replace' : '📂 Choose PDF (max 4 MB)'}
              </button>
              {uploadError && <p className="text-red-400 text-xs mt-1">{uploadError}</p>}
              <p className="text-[10px] text-[#8b9dc3] mt-1 font-mono">PDFs are stored locally in your browser.</p>
            </div>
          )}

          <button
            onClick={save}
            disabled={!form.title.trim() || (form.type === 'pdf' && !form.url) || uploading}
            className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-semibold disabled:opacity-40 transition-all"
          >
            Save
          </button>
        </div>
      </Modal>
    </div>
  );
}

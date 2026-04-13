import React, { useEffect } from 'react';

export default function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-navy-900 rounded-t-2xl sm:rounded-2xl border border-navy-700 p-6 max-h-[90vh] overflow-y-auto animate-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-syne font-semibold text-lg text-white">{title}</h3>
          <button onClick={onClose} className="text-[#8b9dc3] hover:text-white text-xl leading-none px-1">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

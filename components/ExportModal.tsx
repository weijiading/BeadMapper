
import React from 'react';

interface ExportModalProps {
  url: string;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ url, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/90 backdrop-blur-sm">
      <div className="bg-[#1e1e1e] rounded-3xl p-8 max-w-4xl w-full flex flex-col gap-6 shadow-2xl border border-white/10 animate-in fade-in zoom-in duration-300">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Export Generated</h2>
            <p className="text-sm text-gray-400 mt-1">Composite image with green masking overlay applied.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-gray-400 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-white/5 group">
          <img src={url} alt="Exported Mask" className="w-full h-full object-contain" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="px-4 py-2 bg-white/10 backdrop-blur rounded-full text-white text-xs">Composite Preview</span>
          </div>
        </div>

        <div className="flex gap-4 justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 text-gray-400 font-medium hover:text-white transition-colors"
          >
            Cancel
          </button>
          <a 
            href={url} 
            download="composite_masked_image.png"
            className="px-8 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-900/20"
          >
            Download PNG
          </a>
        </div>
      </div>
    </div>
  );
};

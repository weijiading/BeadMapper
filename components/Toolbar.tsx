
import React from 'react';
import { ToolMode } from '@/types';

interface ToolbarProps {
  mode: ToolMode;
  setMode: (mode: ToolMode) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  onExport: () => void;
  onClear: () => void;
  onReset: () => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ 
  mode, setMode, brushSize, setBrushSize, onExport, onClear, onReset, onUpload
}) => {
  return (
    <div className="w-72 bg-[#1e1e1e] border-r border-white/10 p-6 flex flex-col gap-8 shadow-2xl z-10">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center font-bold text-white italic">M</div>
        <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">MaskStudio</h1>
      </div>

      <div className="space-y-4">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Image Source</label>
        <label className="block w-full py-2.5 px-4 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 rounded-xl transition-all text-sm font-medium border border-purple-500/20 cursor-pointer text-center">
          Upload New Image
          <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
        </label>
      </div>

      <div className="space-y-4">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Tools</label>
        <div className="grid grid-cols-1 gap-2">
          <ToolButton 
            active={mode === 'brush'} 
            onClick={() => setMode('brush')}
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>}
            label="Brush Tool"
          />
          <ToolButton 
            active={mode === 'eraser'} 
            onClick={() => setMode('eraser')}
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
            label="Eraser Tool"
          />
          <ToolButton 
            active={mode === 'pan'} 
            onClick={() => setMode('pan')}
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            label="Pan View (Space)"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Brush Size</label>
          <span className="text-xs text-purple-400 font-mono">{brushSize}px</span>
        </div>
        <input 
          type="range" 
          min="1" 
          max="200" 
          value={brushSize} 
          onChange={(e) => setBrushSize(parseInt(e.target.value))}
          className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
        <div className="flex justify-center p-4 bg-black/30 rounded-lg border border-white/5">
          <div 
            style={{ width: Math.min(brushSize, 120), height: Math.min(brushSize, 120) }} 
            className="rounded-full bg-green-500/50 border border-green-500 transition-all duration-75 shadow-[0_0_15px_rgba(0,255,0,0.3)]"
          ></div>
        </div>
      </div>

      <div className="mt-auto space-y-3">
        <button 
          onClick={onReset}
          className="w-full py-2.5 px-4 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-colors text-sm font-medium border border-white/5"
        >
          Reset Viewport
        </button>
        <button 
          onClick={onClear}
          className="w-full py-2.5 px-4 bg-red-900/20 hover:bg-red-900/30 text-red-400 rounded-xl transition-colors text-sm font-medium border border-red-500/20"
        >
          Clear All Masking
        </button>
        <button 
          onClick={onExport}
          className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-lg shadow-purple-900/20 transition-all font-bold text-sm"
        >
          Export Composite Image
        </button>
      </div>
    </div>
  );
};

const ToolButton: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' : 'bg-transparent text-gray-400 hover:bg-white/5'
    }`}
  >
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </button>
);

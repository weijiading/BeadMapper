"use client";

import React, { useState, useEffect } from "react";
import { useEditor } from "@/context/EditorContext";
import PixelCanvas from "@/components/editor/Canvas/PixelCanvas"; // 确保组件存在
import ImageCropper from "@/components/editor/Modals/ImageCropper";
import { Upload, Download, Grid, Palette, Settings, Image as ImageIcon } from "lucide-react";
import { useTranslations } from "next-intl";

// 引入核心算法，请确保路径指向你的 imageProcessing 文件
import { sampleImageColors, loadImage } from "@/lib/processing/index"; 

// --- 临时占位组件 ---
const Header = ({ onExport }: { onExport: () => void }) => (
  <div className="h-14 border-b bg-white flex items-center justify-between px-4">
    <div className="font-bold text-xl">Beadmapper</div>
    <button onClick={onExport} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm">
      <Download size={16} /> Export
    </button>
  </div>
);

const Sidebar = () => (
  <div className="w-64 border-r bg-slate-50 p-4 flex flex-col gap-4">
    <div className="font-semibold text-slate-700 flex items-center gap-2">
      <Settings size={18} /> Configuration
    </div>
    <div className="text-sm text-slate-400 text-center py-8 border-2 border-dashed rounded-lg">
      Settings Panel Placeholder
    </div>
  </div>
);

const RightPanel = ({ colors }: { colors: string[] }) => (
  <div className="w-16 border-l bg-white flex flex-col items-center py-4 gap-2 overflow-y-auto">
    <div className="text-xs font-semibold mb-2 text-slate-500">Palette ({new Set(colors).size})</div>
    {Array.from(new Set(colors)).slice(0, 20).map((c, i) => (
      <div key={i} className="w-8 h-8 rounded-full shadow-sm border border-slate-200" style={{ backgroundColor: c }} />
    ))}
  </div>
);

const EmptyState = ({ onUpload }: { onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
    <label className="cursor-pointer flex flex-col items-center gap-3 p-8 rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-500 hover:bg-slate-50 transition-all">
      <div className="p-4 bg-indigo-50 text-indigo-600 rounded-full">
        <Upload size={32} />
      </div>
      <div className="font-medium text-slate-600">Click to upload image</div>
      <input type="file" className="hidden" accept="image/*" onChange={onUpload} />
    </label>
    <div className="text-xs">JPG, PNG, WEBP supported</div>
  </div>
);

// --- 主组件 ---
export default function EditorShell() {
  const t = useTranslations('Editor'); 
  const { state, dispatch } = useEditor();
  const [isCropping, setIsCropping] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);

  // 1. 处理文件上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setRawImageSrc(reader.result);
          setIsCropping(true);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = ''; 
  };

  // 2. 处理裁剪完成 -> 触发核心算法
  const handleCropComplete = async (croppedImage: string) => {
    setIsCropping(false);
    
    // A. 保存裁剪后的图片到 Context
    dispatch({ type: 'SET_IMAGE', payload: croppedImage });

    try {
      // B. 加载图片对象
      const img = await loadImage(croppedImage);

      // C. 调用核心算法 
      const result = sampleImageColors(
        img,
        state.settings.width || 40,
        state.settings.maxColors || 24,
        state.settings.colorMethod || 'lab-ciede2000',
        state.settings.ditherMethod || 'none',
        state.settings.samplingMode || 'default', // 修复：这里现在可以正确访问了
        state.settings.brands || ['perler', 'mard'],
        state.settings.excludedColors || []
      );

      // D. 保存计算结果到 Context
      dispatch({ type: 'SET_PROCESSED_DATA', payload: result });
    } catch (error) {
      console.error("Processing failed", error);
    }
  };

  // 3. 监听设置变化重新计算
  useEffect(() => {
    if (state.imageSrc && !isCropping) {
      (async () => {
        try {
          const img = await loadImage(state.imageSrc!);
          const result = sampleImageColors(
            img,
            state.settings.width,
            state.settings.maxColors,
            state.settings.colorMethod,
            state.settings.ditherMethod,
            state.settings.samplingMode,
            state.settings.brands,
            state.settings.excludedColors
          );
          dispatch({ type: 'SET_PROCESSED_DATA', payload: result });
        } catch (err) {
            console.error(err);
        }
      })();
    }
  }, [state.settings, state.imageSrc, isCropping, dispatch]);

  return (
    <div className="flex flex-col h-screen bg-slate-100 text-slate-900">
      <Header onExport={() => console.log("Open Export Modal")} />
      
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧边栏 */}
        <Sidebar />
        
        {/* 中间画布区域 */}
        <main className="flex-1 bg-slate-200 relative overflow-hidden flex flex-col p-4">
          <div className="flex-1 bg-white rounded-lg shadow-sm border border-slate-300 overflow-hidden relative">
            {state.processedData ? (
              <PixelCanvas 
                colors={state.processedData.colors}
                rows={state.processedData.rows}
                cols={state.processedData.cols}
                showGrid={true}
                showNumbers={true}
                showMajorGrid={true}
                cellShape="square"
                cellSize={20}
                fitContainer={true}
                isInteractable={state.activeTool !== 'pan'}
              />
            ) : (
              <EmptyState onUpload={handleImageUpload} />
            )}
          </div>
        </main>

        {/* 右侧面板 */}
        {state.processedData && (
          <RightPanel colors={state.processedData.colors} />
        )}
      </div>

      {/* 裁剪弹窗 */}
      {isCropping && rawImageSrc && (
        <ImageCropper 
          imageSrc={rawImageSrc}
          onCancel={() => setIsCropping(false)}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
}
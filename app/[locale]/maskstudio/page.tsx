"use client"; // 必须：声明这是客户端组件，因为使用了浏览器 Canvas API 和 Hooks

import React, { useState, useRef, useEffect } from 'react';
// 注意：使用绝对路径引用
import { ToolMode, ViewportTransform, Point } from '@/types';
import { Toolbar } from '@/components/Toolbar';
import { CanvasLayer } from '@/components/CanvasLayer';
import { ExportModal } from '@/components/ExportModal';

const DEFAULT_IMAGE = "https://picsum.photos/id/1025/1200/800"; 

export default function MaskStudioPage() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [mode, setMode] = useState<ToolMode>('brush');
  const [brushSize, setBrushSize] = useState<number>(40);
  const [transform, setTransform] = useState<ViewportTransform>({ x: 0, y: 0, scale: 0.8 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [maskUrl, setMaskUrl] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const lastMousePos = useRef<Point>({ x: 0, y: 0 });

  // 初始化图片
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = DEFAULT_IMAGE;
    img.onload = () => {
      setImage(img);
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        const scale = Math.min(clientWidth / img.width, clientHeight / img.height) * 0.9;
        setTransform({
          x: (clientWidth - img.width * scale) / 2,
          y: (clientHeight - img.height * scale) / 2,
          scale
        });
      }
    };
  }, []);

  // 空格键处理逻辑（平移视图）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setMode(prev => prev !== 'pan' ? 'pan' : prev);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setMode('brush');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const getCanvasCoords = (clientX: number, clientY: number): Point => {
    if (!maskCanvasRef.current || !image) return { x: 0, y: 0 };
    const rect = maskCanvasRef.current.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (image.width / rect.width),
      y: (clientY - rect.top) * (image.height / rect.height)
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    
    if (mode === 'pan' || e.button === 1) {
      setIsPanning(true);
      return;
    }

    if (!image || !maskCanvasRef.current) return;
    setIsDrawing(true);
    
    const ctx = maskCanvasRef.current.getContext('2d');
    if (!ctx) return;

    const pos = getCanvasCoords(e.clientX, e.clientY);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;
    
    if (mode === 'brush') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = 'rgba(0, 255, 0, 0.6)'; 
    } else {
      ctx.globalCompositeOperation = 'destination-out';
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    if (isPanning) {
      setTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
      return;
    }

    if (isDrawing && maskCanvasRef.current) {
      const ctx = maskCanvasRef.current.getContext('2d');
      if (!ctx) return;
      const pos = getCanvasCoords(e.clientX, e.clientY);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    const zoomFactor = 1 - e.deltaY * 0.001;
    const newScale = Math.max(0.1, Math.min(10, transform.scale * zoomFactor));
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newX = mouseX - (mouseX - transform.x) * (newScale / transform.scale);
    const newY = mouseY - (mouseY - transform.y) * (newScale / transform.scale);

    setTransform({ x: newX, y: newY, scale: newScale });
  };

  const exportMask = () => {
    if (!image || !maskCanvasRef.current) return;
    const { width, height } = image;
    
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = width;
    exportCanvas.height = height;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(image, 0, 0);
    ctx.drawImage(maskCanvasRef.current, 0, 0);
    setMaskUrl(exportCanvas.toDataURL('image/png'));
  };

  const clearMask = () => {
    if (maskCanvasRef.current && image) {
      const ctx = maskCanvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, image.width, image.height);
    }
  };

  const resetViewport = () => {
    if (image && containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      const scale = Math.min(clientWidth / image.width, clientHeight / image.height) * 0.9;
      setTransform({
        x: (clientWidth - image.width * scale) / 2,
        y: (clientHeight - image.height * scale) / 2,
        scale
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          setImage(img);
          if (containerRef.current) {
            const { clientWidth, clientHeight } = containerRef.current;
            const scale = Math.min(clientWidth / img.width, clientHeight / img.height) * 0.9;
            setTransform({
              x: (clientWidth - img.width * scale) / 2,
              y: (clientHeight - img.height * scale) / 2,
              scale
            });
          }
          clearMask();
        };
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#121212] select-none overflow-hidden text-white">
      <Toolbar 
        mode={mode} 
        setMode={setMode} 
        brushSize={brushSize} 
        setBrushSize={setBrushSize}
        onExport={exportMask}
        onClear={clearMask}
        onReset={resetViewport}
        onUpload={handleImageUpload}
      />

      <div 
        ref={containerRef}
        className="relative flex-1 cursor-crosshair overflow-hidden bg-[radial-gradient(#222_1px,transparent_1px)] [background-size:20px_20px]"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {!image && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 animate-pulse">
            Upload an image to start masking...
          </div>
        )}

        {image && (
          <div 
            style={{ 
              transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
              transformOrigin: '0 0',
              width: image.width,
              height: image.height
            }}
            className="pointer-events-auto shadow-2xl"
          >
            <CanvasLayer 
              image={image} 
              bgRef={bgCanvasRef} 
              maskRef={maskCanvasRef} 
            />
          </div>
        )}

        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs text-gray-300 font-mono pointer-events-none">
          Scale: {(transform.scale * 100).toFixed(0)}% | Mode: {mode.toUpperCase()}
        </div>
      </div>

      {maskUrl && <ExportModal url={maskUrl} onClose={() => setMaskUrl(null)} />}
    </div>
  );
}
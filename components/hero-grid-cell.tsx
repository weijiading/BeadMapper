"use client";

import React, { useState, useRef } from "react";

export default function HeroGridCell({ children }: { children: React.ReactNode }) {
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const size = 64; 

  // ✅ 修改点：stroke='rgba(0,0,0,0.12)' 
  // 稍微加深了网格颜色，让它比之前更清晰，但仍保持高级灰
  const gridSvg = encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${size} ${size}' width='${size}' height='${size}' fill='none' stroke='rgba(0,0,0,0.12)'><path d='M 0 0 L ${size} 0 L ${size} ${size}'/></svg>`
  );
  const gridDataUrl = `url("data:image/svg+xml;charset=utf-8,${gridSvg}")`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const snappedX = Math.floor(x / size) * size;
    const snappedY = Math.floor(y / size) * size;

    if (hoverPos?.x !== snappedX || hoverPos?.y !== snappedY) {
      setHoverPos({ x: snappedX, y: snappedY });
    }
  };

  const handleMouseLeave = () => {
    setHoverPos(null);
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-white" 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* 全局光影遮罩：逻辑保持不变，确保边缘柔和 */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          maskImage: 'radial-gradient(ellipse 100% 80% at 50% 0%, black 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 100% 80% at 50% 0%, black 40%, transparent 100%)'
        }}
      >
        <div 
          className="absolute inset-0"
          style={{ backgroundImage: gridDataUrl }}
        />

        {hoverPos && (
          <div
            className="absolute z-0 transition-colors duration-200"
            style={{
              left: hoverPos.x,
              top: hoverPos.y,
              width: size,
              height: size,
              backgroundColor: 'rgba(0, 0, 0, 0.05)', // hover 颜色也微调深了一点点适配
            }}
          />
        )}
      </div>
      
      <div className="relative z-10 w-full h-full">
         {children}
      </div>
    </div>
  );
}
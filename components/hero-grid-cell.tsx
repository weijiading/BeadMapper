"use client";

import React, { useState, useRef } from "react";

export default function HeroGridCell({ children }: { children: React.ReactNode }) {
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  // 新增：用于存储当前格子的随机颜色
  const [activeColor, setActiveColor] = useState<string>('rgba(0,0,0,0.05)'); 
  const containerRef = useRef<HTMLDivElement>(null);

  const size = 64; 

  const gridSvg = encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${size} ${size}' width='${size}' height='${size}' fill='none' stroke='rgba(0,0,0,0.12)'><path d='M 0 0 L ${size} 0 L ${size} ${size}'/></svg>`
  );
  const gridDataUrl = `url("data:image/svg+xml;charset=utf-8,${gridSvg}")`;

  // 辅助函数：生成随机颜色
  const getRandomColor = () => {
    const pixelPalette = [
      "#FF004D", // 像素红
      "#00E436", // 像素绿
      "#29ADFF", // 像素蓝
      "#FFEC27", // 像素黄
      "#FF77A8", // 像素粉
      "#FFA300", // 像素橙
      "#1D2B53", // 深蓝灰
      "#7E2553", // 深紫
      "#008751", // 深绿
    ];
    return pixelPalette[Math.floor(Math.random() * pixelPalette.length)];
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const snappedX = Math.floor(x / size) * size;
    const snappedY = Math.floor(y / size) * size;

    // 当检测到格子位置变化时
    if (hoverPos?.x !== snappedX || hoverPos?.y !== snappedY) {
      setHoverPos({ x: snappedX, y: snappedY });
      // 生成并设置新的随机颜色
      setActiveColor(getRandomColor());
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
      {/* 全局光影遮罩 */}
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
              backgroundColor: activeColor, // 使用随机颜色
              opacity: 0.8, // 建议设置透明度，避免随机深色遮挡文字或显得突兀
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
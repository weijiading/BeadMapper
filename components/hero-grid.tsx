"use client";

import React, { useState, useRef, useEffect } from "react";

/**
 * 这是一个无需修改 tailwind.config 就能使用的网格背景组件
 */
export function HeroGrid({ children }: { children: React.ReactNode }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // 1. 定义网格的 SVG 数据 (这里是灰色网格，适合白色背景)
  // 我们直接把 SVG 编码成 Data URI，这样就不需要插件了
  const gridSvg = encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgba(0,0,0,0.04)'><path d='M0 .5H31.5V32'/></svg>`
  );
  const gridDataUrl = `url("data:image/svg+xml;charset=utf-8,${gridSvg}")`;

  // 2. 定义深色网格 (用于光照效果)
  const gridHoverSvg = encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgba(0,0,0,0.15)'><path d='M0 .5H31.5V32'/></svg>`
  );
  const gridHoverDataUrl = `url("data:image/svg+xml;charset=utf-8,${gridHoverSvg}")`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div 
      className="relative w-full overflow-hidden bg-white"
      onMouseMove={handleMouseMove}
      style={{ height: '40rem' }} // 你可以调整这个高度
    >
      {/* 底层：静态的淡网格 */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: gridDataUrl }}
      />

      {/* 顶层：跟随鼠标的光照网格 */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{ 
          backgroundImage: gridHoverDataUrl,
          // 核心魔法：径向渐变遮罩
          maskImage: `radial-gradient(350px circle at ${mousePosition.x}px ${mousePosition.y}px, black, transparent)`,
          WebkitMaskImage: `radial-gradient(350px circle at ${mousePosition.x}px ${mousePosition.y}px, black, transparent)`,
        }}
      />

      {/* 边缘遮罩：让上下左右边缘淡出，避免网格切断生硬 */}
      <div className="absolute inset-0 pointer-events-none bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      
      {/* 内容区域 */}
      <div className="relative z-10 flex h-full items-center justify-center">
         {children}
      </div>
    </div>
  );
}
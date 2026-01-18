"use client";

import React, { useState, useRef } from "react";
// 引入 cn 工具是为了符合 shadcn 的类名合并规范，
// 如果你的项目中没有 lib/utils，可以直接去掉 cn() 包裹，只保留字符串
import { cn } from "@/lib/utils"; 

export default function HeroGridCell({ children }: { children: React.ReactNode }) {
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const size = 64; 

  // 优化点：
  // 1. Grid 颜色：原先的 rgba(0,0,0,0.12) 在暗黑模式下几乎不可见。
  //    这里我们保持原样，但建议如果需要支持暗黑模式，需根据 Theme 动态生成 SVG，
  //    或者使用一个在黑白背景下都能看清的中性色（如 rgba(128,128,128,0.2)）。
  const gridSvg = encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${size} ${size}' width='${size}' height='${size}' fill='none' stroke='rgba(128,128,128,0.2)'><path d='M 0 0 L ${size} 0 L ${size} ${size}'/></svg>`
  );
  const gridDataUrl = `url("data:image/svg+xml;charset=utf-8,${gridSvg}")`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 超过 650px 不计算
    if (y > 650) {
      setHoverPos(null);
      return;
    }

    const snappedX = Math.floor(x / size) * size;
    const snappedY = Math.floor(y / size) * size;

    if (hoverPos?.x !== snappedX || hoverPos?.y !== snappedY) {
      setHoverPos({ x: snappedX, y: snappedY });
      // 移除 setActiveColor，不再需要设置随机颜色
    }
  };

  const handleMouseLeave = () => {
    setHoverPos(null);
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-background"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        className="absolute top-0 left-0 right-0 h-[650px] pointer-events-none overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)'
        }}
      >
        <div 
          className="absolute inset-0"
          style={{ backgroundImage: gridDataUrl }}
        />

        {hoverPos && (
          <div
            // 修改重点：
            // 1. 移除 inline style 的 backgroundColor。
            // 2. 使用 Tailwind 类名控制颜色。
            //    - `bg-primary/5` 或 `bg-muted-foreground/10` 是符合 Shadcn 风格的温和灰色。
            //    - 这种写法会自动适配 Light/Dark 模式，不会出现死黑或死白。
            className={cn(
              "absolute z-0 transition-opacity duration-200", // 稍微增加一点 duration 让消失更柔和
              "bg-foreground/5 dark:bg-foreground/10" // 核心修改：温和的灰色
            )}
            style={{
              left: hoverPos.x,
              top: hoverPos.y,
              width: size,
              height: size,
              // 移除 opacity: 0.6，直接通过 Tailwind 的颜色透明度(/5)控制，性能更好且颜色更准
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
'use client'

import React, { useEffect, useRef, useMemo } from 'react';
import { PERLER_PALETTE, MARD_PALETTE } from '@/lib/constants/palettes';

interface PixelCanvasProps {
  colors: string[];
  rows: number;
  cols: number;
  cellSize: number;
  showGrid: boolean;
  showColorCodes?: boolean;
  showCoordinates?: boolean;
  coordBgColor?: string;
  coordTextColor?: string;
  coordFontSize?: number;
  cellShape: 'square' | 'circle' | 'hexagon';
  showNumbers?: boolean;
  showMajorGrid?: boolean;
  pegboardSize?: number;
  onCanvasReady?: (canvas: HTMLCanvasElement | null) => void;
}

// 辅助工具：将 Hex 转换为标准化 RGB 字符串
const normalizeColorToRgbKey = (color: string): string | null => {
  if (!color) return null;
  const c = color.replace(/\s+/g, '').toLowerCase();
  if (c.startsWith('rgb')) return c;
  if (c.startsWith('#')) {
    const hex = c.substring(1);
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
      return `rgb(${r},${g},${b})`;
    }
  }
  return c;
};

// 辅助工具：获取对比色
const getContrastYIQ = (color: string) => {
  let r = 0, g = 0, b = 0;
  const hexMatch = color.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  const rgbMatch = color.match(/(\d+),\s*(\d+),\s*(\d+)/);

  if (hexMatch) {
    r = parseInt(hexMatch[1], 16);
    g = parseInt(hexMatch[2], 16);
    b = parseInt(hexMatch[3], 16);
  } else if (rgbMatch) {
    r = parseInt(rgbMatch[1], 10);
    g = parseInt(rgbMatch[2], 10);
    b = parseInt(rgbMatch[3], 10);
  } else {
    return 'black';
  }
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? 'black' : 'white';
};

const PixelCanvas: React.FC<PixelCanvasProps> = ({
  colors,
  rows,
  cols,
  cellSize = 20,
  showGrid = false,
  showColorCodes = true,
  showCoordinates = false,
  coordBgColor = '#f1f5f9',
  coordTextColor = '#64748b',
  coordFontSize = 10,
  cellShape,
  showMajorGrid = true,
  onCanvasReady
}) => {
  const pixelLayerRef = useRef<HTMLCanvasElement>(null);

  const offset = showCoordinates ? cellSize : 0;
  const canvasWidth = cols * cellSize + offset * 2;
  const canvasHeight = rows * cellSize + offset * 2;

  // 1. 定义动态缩放比例因子 (基于默认预览尺寸 20px)
  // 当 cellSize 变大用于导出时，这个 scale 也会变大，用于调整线宽和字体
  const scaleFactor = Math.max(cellSize / 20, 1);

  const colorIdMap = useMemo(() => {
    const map = new Map<string, string>();
    // @ts-ignore
    [...PERLER_PALETTE, ...MARD_PALETTE].forEach(item => {
      const key = `rgb(${item.rgb.r},${item.rgb.g},${item.rgb.b})`;
      map.set(key, item.id);
    });
    return map;
  }, []);

  const drawFullCanvas = (ctx: CanvasRenderingContext2D) => {
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // --- 1. 绘制衬底灰白格子 ---
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = Math.floor(offset + c * cellSize);
        const y = Math.floor(offset + r * cellSize);
        const nextX = Math.floor(offset + (c + 1) * cellSize);
        const nextY = Math.floor(offset + (r + 1) * cellSize);
        ctx.fillStyle = (r + c) % 2 === 0 ? '#ffffff' : '#f3f4f6';
        ctx.fillRect(x, y, nextX - x, nextY - y);
      }
    }

    // --- 2. 绘制坐标轴背景 ---
    if (showCoordinates) {
      ctx.fillStyle = coordBgColor;
      ctx.fillRect(0, 0, canvasWidth, offset);
      ctx.fillRect(0, canvasHeight - offset, canvasWidth, offset);
      ctx.fillRect(0, offset, offset, canvasHeight - offset * 2);
      ctx.fillRect(canvasWidth - offset, offset, offset, canvasHeight - offset * 2);
    }

    // --- 3. 绘制像素图案 & 色号代码 ---
    colors.forEach((color, index) => {
      if (color === 'transparent' || !color) return;

      const r = Math.floor(index / cols);
      const c = index % cols;
      const x = Math.floor(offset + c * cellSize);
      const y = Math.floor(offset + r * cellSize);
      const nextX = Math.floor(offset + (c + 1) * cellSize);
      const nextY = Math.floor(offset + (r + 1) * cellSize);
      const drawW = nextX - x;
      const drawH = nextY - y;

      // 绘制形状
      ctx.fillStyle = color;
      if (cellShape === 'circle') {
        ctx.beginPath();
        ctx.arc(x + drawW / 2, y + drawH / 2, drawW / 2 + 0.2 * scaleFactor, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(x, y, drawW + 0.5 * scaleFactor, drawH + 0.5 * scaleFactor);
      }

      // 绘制色号代码
      if (showColorCodes) {
        const normalizedKey = normalizeColorToRgbKey(color); 
        const colorId = normalizedKey ? colorIdMap.get(normalizedKey) : undefined;

        // 仅在格子足够大时绘制文字 (20px * scaleFactor 约等于 cellSize)
        if (colorId && cellSize >= 12) {
          ctx.save();
          ctx.fillStyle = getContrastYIQ(color); 
          // 字体大小随格子自动缩放
          const fontSize = Math.floor(cellSize * 0.35);
          ctx.font = `bold ${fontSize}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(colorId, x + drawW / 2, y + drawH / 2);
          ctx.restore();
        }
      }
    });

    // --- 4. 绘制坐标数字 ---
    if (showCoordinates) {
      ctx.save();
      // 关键修改：坐标字体大小随 scaleFactor 放大
      const scaledFontSize = Math.max(coordFontSize * scaleFactor, 10);
      ctx.font = `bold ${scaledFontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = coordTextColor;
      for (let c = 0; c < cols; c++) {
        const x = Math.floor(offset + c * cellSize + cellSize / 2);
        ctx.fillText((c + 1).toString(), x, offset / 2);
        ctx.fillText((c + 1).toString(), x, canvasHeight - offset / 2);
      }
      for (let r = 0; r < rows; r++) {
        const y = Math.floor(offset + r * cellSize + cellSize / 2);
        ctx.fillText((r + 1).toString(), offset / 2, y);
        ctx.fillText((r + 1).toString(), canvasWidth - offset / 2, y);
      }
      ctx.restore();
    }

    // --- 5. 绘制网格线 ---
    if (showGrid) {
      ctx.save();
      const redGridColor = 'rgba(239, 68, 68, 0.8)';
      const normalGridColor = 'rgba(0, 0, 0, 0.3)';

      // 关键修改：线宽和虚线间距随 scaleFactor 放大
      const majorLineWidth = 1.5 * scaleFactor;
      const minorLineWidth = 1 * scaleFactor;
      const dashArray = [4 * scaleFactor, 2 * scaleFactor];

      // 垂直线
      for (let c = 0; c <= cols; c++) {
        const x = Math.floor(offset + c * cellSize);
        ctx.beginPath();
        if (showMajorGrid && c % 5 === 0) {
          ctx.strokeStyle = redGridColor;
          ctx.lineWidth = c % 10 === 0 ? majorLineWidth : minorLineWidth;
          ctx.setLineDash(c % 10 === 0 ? [] : dashArray);
        } else {
          ctx.strokeStyle = normalGridColor;
          ctx.lineWidth = minorLineWidth;
          ctx.setLineDash([]);
        }
        ctx.moveTo(x, offset);
        ctx.lineTo(x, canvasHeight - offset);
        ctx.stroke();
      }

      // 水平线
      for (let r = 0; r <= rows; r++) {
        const y = Math.floor(offset + r * cellSize);
        ctx.beginPath();
        if (showMajorGrid && r % 5 === 0) {
          ctx.strokeStyle = redGridColor;
          ctx.lineWidth = r % 10 === 0 ? majorLineWidth : minorLineWidth;
          ctx.setLineDash(r % 10 === 0 ? [] : dashArray);
        } else {
          ctx.strokeStyle = normalGridColor;
          ctx.lineWidth = minorLineWidth;
          ctx.setLineDash([]);
        }
        ctx.moveTo(offset, y);
        ctx.lineTo(canvasWidth - offset, y);
        ctx.stroke();
      }
      ctx.restore();
    }
  };

  useEffect(() => {
    const canvas = pixelLayerRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      drawFullCanvas(ctx);
      if (onCanvasReady) onCanvasReady(canvas);
    }
  }, [colors, rows, cols, cellSize, cellShape, showColorCodes, showGrid, showCoordinates, showMajorGrid, coordBgColor, coordTextColor, coordFontSize]);

  return (
    <div
      className="absolute inset-0 m-auto shadow-md border bg-white overflow-hidden"
      style={{
        aspectRatio: `${canvasWidth} / ${canvasHeight}`,
        maxWidth: '95%',
        maxHeight: '95%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <canvas
        ref={pixelLayerRef}
        width={canvasWidth}
        height={canvasHeight}
        className="w-full h-full block object-contain"
      />
    </div>
  );
};

export default PixelCanvas;
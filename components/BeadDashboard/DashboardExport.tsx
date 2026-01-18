'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { FileDown, Settings2, X, Grid3X3, Hash, Palette, Loader2, Maximize2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import PixelCanvas from '@/components/editor/Canvas/PixelCanvas';
import { jsPDF } from "jspdf";

interface DashboardExportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  processedData: { colors: string[]; rows: number; cols: number } | null;
  pegboardSize: number;
  setPegboardSize: (v: number) => void;
  cellShape: 'square' | 'circle' | 'hexagon';
  setCellShape: (v: 'square' | 'circle' | 'hexagon') => void;
}

// 浏览器 Canvas 最大安全尺寸限制 (通常是 8192 或 16384，取保守值)
const MAX_CANVAS_DIMENSION = 8192;

export function DashboardExport({
  open,
  onOpenChange,
  processedData,
  pegboardSize,
  setPegboardSize,
  cellShape,
  setCellShape
}: DashboardExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  // 预览用的 Canvas Ref (低分)
  const [previewCanvasRef, setPreviewCanvasRef] = useState<HTMLCanvasElement | null>(null);
  // 导出用的 Canvas Ref (高分)
  const [hdCanvasRef, setHdCanvasRef] = useState<HTMLCanvasElement | null>(null);
  
  // 核心控制
  const [showCoordinates, setShowCoordinates] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showColorCodes, setShowColorCodes] = useState(true);
  const [exportFormat, setExportFormat] = useState<'png' | 'pdf'>('png');
  const [exportScale, setExportScale] = useState(5); // 默认 5倍高清

  // 坐标轴自定义样式
  const [coordBgColor, setCoordBgColor] = useState('#000000');
  const [coordTextColor, setCoordTextColor] = useState('#ffffff');
  const [coordFontSize, setCoordFontSize] = useState(10);

  // 计算高清模式下的 Cell Size (基础 20px * 倍率)
  const hdCellSize = 20 * exportScale;

  // 动态计算允许的最大缩放倍率，防止内存溢出
  const maxAllowedScale = useMemo(() => {
    if (!processedData) return 1;
    // 假设有 coordinates，offset 约等于 1个 cellSize
    // width = (cols + 2) * (20 * scale)
    const maxDimension = Math.max(processedData.cols, processedData.rows);
    // 求解 scale: (maxDimension + 2) * 20 * scale <= MAX_CANVAS_DIMENSION
    const limit = Math.floor(MAX_CANVAS_DIMENSION / ((maxDimension + 2) * 20));
    // 限制在 1-10 之间
    return Math.min(Math.max(limit, 1), 5); // 这里为了UI统一，最高给5倍，通常够用了
  }, [processedData]);

  // 当数据变化时，检查当前 scale 是否越界
  useEffect(() => {
    if (exportScale > maxAllowedScale) {
      setExportScale(maxAllowedScale);
    }
  }, [maxAllowedScale, exportScale]);

  const handleExportAction = async () => {
    // 必须使用高清 Ref，如果未准备好则回退到预览 Ref
    const sourceCanvas = hdCanvasRef || previewCanvasRef; 
    if (!sourceCanvas || !processedData) return;

    try {
      setIsExporting(true);

      // 强制等待 100ms，让 React 有机会重绘 UI 显示 Loading Spinner
      await new Promise(resolve => setTimeout(resolve, 100));

      const timestamp = new Date().toISOString().replace(/[-:.]/g, "").slice(0, 14);
      const fileName = `pixel_art_${timestamp}_${exportScale}x`;
      
      // 生成最高质量图片
      const dataUrl = sourceCanvas.toDataURL('image/png', 1.0);

      if (exportFormat === 'png') {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `${fileName}.png`;
        link.click();
      } else {
        // PDF 导出优化：适配 A4 纸张
        const pdf = new jsPDF({
          orientation: sourceCanvas.width > sourceCanvas.height ? 'l' : 'p',
          unit: 'mm',
          format: 'a4'
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10; // 10mm 边距

        const printableWidth = pageWidth - margin * 2;
        const printableHeight = pageHeight - margin * 2;

        // 计算缩放比例以适应页面
        const imgRatio = sourceCanvas.width / sourceCanvas.height;
        let finalImgWidth = printableWidth;
        let finalImgHeight = printableWidth / imgRatio;

        if (finalImgHeight > printableHeight) {
          finalImgHeight = printableHeight;
          finalImgWidth = printableHeight * imgRatio;
        }

        // 居中计算
        const x = (pageWidth - finalImgWidth) / 2;
        const y = (pageHeight - finalImgHeight) / 2;

        pdf.addImage(dataUrl, 'PNG', x, y, finalImgWidth, finalImgHeight);
        pdf.save(`${fileName}.pdf`);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert("Export failed. The image might be too large.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 w-[95vw] sm:max-w-[1100px] h-[90vh] md:h-[85vh] flex flex-col md:flex-row overflow-hidden border-none shadow-2xl [&>button]:hidden">
        
        <DialogHeader className="sr-only">
          <DialogTitle>Export Configuration</DialogTitle>
        </DialogHeader>

        {/* 左侧预览区 (屏幕显示用，低分辨率以保证性能) */}
        <div className="flex-1 bg-muted/40 relative flex flex-col min-h-[300px] md:min-h-0 border-r border-border">
          <div className="absolute top-4 left-4 z-10">
            <div className="bg-background/80 backdrop-blur-sm border px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-muted-foreground shadow-sm">
              Preview
            </div>
          </div>

          <div className="w-full h-full relative overflow-hidden flex items-center justify-center p-4">
            {processedData ? (
              <div className="w-full h-full relative">
                <PixelCanvas
                  colors={processedData.colors}
                  rows={processedData.rows}
                  cols={processedData.cols}
                  showGrid={showGrid}
                  showNumbers={false}
                  showColorCodes={showColorCodes}
                  showCoordinates={showCoordinates}
                  coordBgColor={coordBgColor}
                  coordTextColor={coordTextColor}
                  coordFontSize={coordFontSize}
                  cellShape={cellShape}
                  cellSize={20} // 预览固定 20
                  onCanvasReady={setPreviewCanvasRef}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-xs font-medium uppercase tracking-widest">Generating...</span>
              </div>
            )}
          </div>
        </div>

        {/* --------------------------------------------------------------------------- */}
        {/* 隐式高清渲染层: 用户不可见，但真实存在于 DOM 中用于生成高清图 */}
        {/* 使用 visibility: hidden 会导致某些浏览器不渲染，所以使用 z-index + opacity */}
        {/* --------------------------------------------------------------------------- */}
        <div style={{ position: 'absolute', top: 0, left: 0, zIndex: -100, opacity: 0, pointerEvents: 'none', overflow: 'hidden', width: '1px', height: '1px' }}>
             {processedData && (
                <PixelCanvas
                  key={`hd-canvas-${exportScale}`} // Key 变化强制重新渲染
                  colors={processedData.colors}
                  rows={processedData.rows}
                  cols={processedData.cols}
                  showGrid={showGrid}
                  showNumbers={false}
                  showColorCodes={showColorCodes}
                  showCoordinates={showCoordinates}
                  coordBgColor={coordBgColor}
                  coordTextColor={coordTextColor}
                  coordFontSize={coordFontSize}
                  cellShape={cellShape}
                  cellSize={hdCellSize} // 高清尺寸
                  onCanvasReady={setHdCanvasRef}
                />
             )}
        </div>

        {/* 右侧设置区 */}
        <div className="w-full md:w-[350px] bg-background flex flex-col shrink-0 h-full">
          <div className="h-14 flex items-center justify-between px-4 border-b shrink-0">
            <span className="text-xs font-bold flex items-center gap-2 tracking-widest text-foreground">
              <Settings2 size={15} /> EXPORT SETTINGS
            </span>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8"><X size={16} /></Button>
            </DialogClose>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-5 space-y-6">
              
              {/* 基本布局设置 */}
              <div className="space-y-3">
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Pattern Specs</Label>
                <div className="grid gap-3 p-3 border rounded-lg bg-muted/10">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-coords" className="text-sm font-medium flex items-center gap-2">
                      <Hash size={14} /> Coordinates
                    </Label>
                    <Switch id="show-coords" checked={showCoordinates} onCheckedChange={setShowCoordinates} />
                  </div>
                  
                  {showCoordinates && (
                    <div className="space-y-3 pt-2 border-t mt-2">
                      <div className="flex items-center gap-4">
                        <div className="flex-1 space-y-1.5">
                          <Label className="text-[10px] text-muted-foreground">BG Color</Label>
                          <div className="flex items-center gap-2">
                            <Input 
                              type="color" 
                              value={coordBgColor} 
                              onChange={(e) => setCoordBgColor(e.target.value)}
                              className="w-8 h-8 p-0 border-none overflow-hidden rounded-md"
                            />
                            <span className="text-[10px] font-mono uppercase">{coordBgColor}</span>
                          </div>
                        </div>
                        <div className="flex-1 space-y-1.5">
                          <Label className="text-[10px] text-muted-foreground">Text Color</Label>
                          <div className="flex items-center gap-2">
                            <Input 
                              type="color" 
                              value={coordTextColor} 
                              onChange={(e) => setCoordTextColor(e.target.value)}
                              className="w-8 h-8 p-0 border-none overflow-hidden rounded-md"
                            />
                            <span className="text-[10px] font-mono uppercase">{coordTextColor}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] text-muted-foreground">Font Size</Label>
                        <Select value={coordFontSize.toString()} onValueChange={(v) => setCoordFontSize(Number(v))}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[8, 9, 10, 11, 12, 14, 16].map(size => (
                              <SelectItem key={size} value={size.toString()}>{size}px</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 网格与色码 */}
              <div className="space-y-3">
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Overlays</Label>
                <div className="space-y-3 px-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-grid" className="text-sm font-medium flex items-center gap-2">
                      <Grid3X3 size={14} className="text-muted-foreground" /> Grid Lines
                    </Label>
                    <Switch id="show-grid" checked={showGrid} onCheckedChange={setShowGrid} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-codes" className="text-sm font-medium flex items-center gap-2">
                      <Palette size={14} className="text-muted-foreground" /> Color Codes
                    </Label>
                    <Switch id="show-codes" checked={showColorCodes} onCheckedChange={setShowColorCodes} />
                  </div>
                </div>
              </div>

              {/* 质量/分辨率控制 */}
              <div className="space-y-3">
                 <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                        Export Quality ({exportScale}x)
                    </Label>
                    <span className="text-[10px] text-muted-foreground font-mono">
                        {processedData ? `${processedData.cols * hdCellSize}px wide` : ''}
                    </span>
                 </div>
                 
                 <div className="px-1 py-2 bg-muted/10 rounded-lg border">
                     <div className="flex justify-between text-[10px] text-muted-foreground mb-3 px-1">
                        <span>Screen (1x)</span>
                        <span>Print (3x)</span>
                        <span className={maxAllowedScale < 5 ? "opacity-30" : ""}>Ultra (5x)</span>
                     </div>
                     <Slider 
                        value={[exportScale]} 
                        onValueChange={(vals) => setExportScale(vals[0])} 
                        min={1} 
                        max={maxAllowedScale} 
                        step={1} 
                        className="w-full"
                     />
                     {maxAllowedScale < 5 && (
                        <p className="text-[10px] text-amber-600 mt-2 flex items-center gap-1">
                           <Maximize2 size={10} /> Max quality limited by canvas size safety.
                        </p>
                     )}
                 </div>
              </div>

              {/* 格式选择 */}
              <div className="space-y-3">
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Format</Label>
                <div className="flex gap-2">
                  <Button variant={exportFormat === 'png' ? 'default' : 'outline'} size="sm" className="flex-1" onClick={() => setExportFormat('png')}>PNG Image</Button>
                  <Button variant={exportFormat === 'pdf' ? 'default' : 'outline'} size="sm" className="flex-1" onClick={() => setExportFormat('pdf')}>PDF (A4)</Button>
                </div>
              </div>

            </div>
          </ScrollArea>

          <div className="p-5 border-t bg-muted/20">
            <Button className="w-full" size="lg" onClick={handleExportAction} disabled={isExporting || !processedData}>
              {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
              {isExporting ? 'Processing...' : 'Download File'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
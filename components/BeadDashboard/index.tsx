'use client'

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { PanelLeftClose, PanelLeftOpen, Eye, Maximize2, Pencil } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSidebar } from "@/components/ui/sidebar"
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";

// --- 工具库 ---
import { loadImage, sampleImageColors } from '@/lib/processing/index';
import { ColorMethod, DitherMethod, SamplingMode, BrandType } from '@/types';
import { colorToKey } from '@/lib/processing/colors';
import { PERLER_PALETTE, MARD_PALETTE } from '@/lib/constants/palettes';

// --- UI 组件 ---
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

// --- 拆分的子组件 (假设这些已定义，本文件主要包含 Header 和 主逻辑) ---
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardCanvas } from './DashboardCanvas';
import { DashboardPalette } from './DashboardPalette';

// --- 通用弹窗 ---
import { ImageCropperModal } from '@/components/modals/ImageCropperModal';

// ================= HEADER COMPONENT (UPDATED) =================

interface DashboardHeaderProps {
    hasData: boolean;
    pegboardSize: number;
    setPegboardSize: (s: number) => void;
    showGrid: boolean;
    setShowGrid: (v: boolean) => void;
    showNumbers: boolean;
    setShowNumbers: (v: boolean) => void;
    onFullscreen: () => void;
    onOpenEditor: () => void;
}

const CustomSidebarTrigger = () => {
    const { toggleSidebar, open } = useSidebar();
    return (
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar} 
            className="h-8 w-8 -ml-2"
        >
            {open ? <PanelLeftClose size={16}/> : <PanelLeftOpen size={16} />}
        </Button>
    )
}

export function DashboardHeader({
    hasData,
    pegboardSize,
    setPegboardSize,
    showGrid,
    setShowGrid,
    showNumbers,
    setShowNumbers,
    onFullscreen,
    onOpenEditor
}: DashboardHeaderProps) {
    return (
        <header className="flex h-14 items-center gap-2 border-b bg-background/95 backdrop-blur px-4 sticky top-0 z-10">
            <CustomSidebarTrigger />
            
            <Separator orientation="vertical" className="mr-2 h-4" />
            
            {/* 始终显示 Header 内容，不再判断 hasData */}
            <div className="flex flex-1 items-center justify-between min-w-0">
                <div className="flex items-center gap-3">
                    <div className="flex items-center border rounded-md bg-background p-0.5 h-8 shrink-0">
                        <Button variant={pegboardSize === 52 ? "secondary" : "ghost"} size="sm" className="h-6 text-xs px-2" onClick={() => setPegboardSize(52)}>52px</Button>
                        <Separator orientation="vertical" className="h-3 mx-1" />
                        <Button variant={pegboardSize === 104 ? "secondary" : "ghost"} size="sm" className="h-6 text-xs px-2" onClick={() => setPegboardSize(104)}>104px</Button>
                    </div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 gap-2 text-xs shrink-0">
                            <Eye size={12} /> View
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-3 space-y-3" align="start">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase">Grid</Label>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs">Show Grid</span>
                                    <Switch checked={showGrid} onCheckedChange={setShowGrid} className="scale-75 origin-right"/>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs">Numbers</span>
                                    <Switch checked={showNumbers} onCheckedChange={setShowNumbers} className="scale-75 origin-right"/>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="flex gap-2 shrink-0">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={onFullscreen} 
                        className="h-8 text-xs"
                        disabled={!hasData} 
                    >
                        <Maximize2 size={12} className="mr-2"/> Fullscreen HD
                    </Button>
                    <Button 
                        size="sm" 
                        onClick={onOpenEditor} 
                        className="h-8 text-xs bg-slate-900 hover:bg-slate-800"
                        disabled={!hasData}
                    >
                        <Pencil size={12} className="mr-2"/> Open Editor
                    </Button>
                </div>
            </div>
        </header>
    );
}

// ================= MAIN COMPONENT =================

const BeadDashboard = () => {
  // ================= STATE =================
  const [imageSrc, setImageSrc] = useState<string | null>(null);    
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null); 
  const [isCropping, setIsCropping] = useState(false);               
  
  const [processedData, setProcessedData] = useState<{ colors: string[]; rows: number; cols: number } | null>(null);
  
  const [targetWidth, setTargetWidth] = useState<number>(40);
  const [maxColors, setMaxColors] = useState<number>(24);
  const [colorMethod, setColorMethod] = useState<ColorMethod>('lab-ciede2000');
  const [ditherMethod, setDitherMethod] = useState<DitherMethod>('none');
  const [samplingMode, setSamplingMode] = useState<SamplingMode>('default');
  const [colorBrands, setColorBrands] = useState<BrandType[]>(['perler']);
  
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showNumbers, setShowNumbers] = useState<boolean>(true);
  const [showMajorGrid, setShowMajorGrid] = useState<boolean>(true);
  const [cellShape, setCellShape] = useState<'square' | 'circle' | 'hexagon'>('square');
  const [pegboardSize, setPegboardSize] = useState<number>(52);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);

  const globalReplacementsRef = useRef<Record<string, string>>({});
  const [globalReplacements, setGlobalReplacements] = useState<Record<string, string>>({});
  useEffect(() => { globalReplacementsRef.current = globalReplacements; }, [globalReplacements]);

  // ================= COMPUTED =================
  const totalAvailableColors = useMemo(() => {
    let count = 0;
    if (colorBrands.length === 0) return 256; 
    if (colorBrands.includes('perler')) count += PERLER_PALETTE.length;
    if (colorBrands.includes('mard')) count += MARD_PALETTE.length;
    return count;
  }, [colorBrands]);

  const colorStats = useMemo(() => {
    if (!processedData) return [];
    const uniqueColors = new Set<string>();
    const counts: Record<string, number> = {};
    const stats: { id: number; color: string; count: number }[] = [];
    
    processedData.colors.forEach((color: string) => {
      if (color !== 'transparent') {
        if (!uniqueColors.has(color)) { 
          uniqueColors.add(color); 
          stats.push({ id: uniqueColors.size, color, count: 0 }); 
        }
        counts[color] = (counts[color] || 0) + 1;
      }
    });
    return stats.map(s => ({ ...s, count: counts[s.color] })).sort((a,b) => b.count - a.count);
  }, [processedData]);

  const totalBeads = useMemo(() => processedData ? processedData.colors.filter((c: string) => c !== 'transparent').length : 0, [processedData]);

  // ================= HANDLERS =================
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

  const handleCropConfirm = (croppedImage: string) => {
      setImageSrc(croppedImage); 
      setIsCropping(false);      
  };

  const handleCropCancel = () => {
      setRawImageSrc(null);      
      setIsCropping(false);      
  };

  const processImage = useCallback(async () => {
    if (!imageSrc) return;
    try {
      const img = await loadImage(imageSrc);
      const result = sampleImageColors(img, targetWidth, maxColors, colorMethod, ditherMethod, samplingMode, colorBrands, []);
      const replacements = globalReplacementsRef.current;
      const mappedColors = result.colors.map(c => replacements[c] || c);
      setProcessedData({ ...result, colors: mappedColors });
    } catch (error) { console.error("Error processing", error); }
  }, [imageSrc, targetWidth, maxColors, colorMethod, ditherMethod, samplingMode, colorBrands]);

  useEffect(() => { processImage(); }, [processImage]);

  const groupedColorStats = useMemo(() => {
    if (colorStats.length === 0) return [];
    const getBrandInfo = (colorKey: string) => {
        const perler = PERLER_PALETTE.find(p => colorToKey(p.rgb) === colorKey);
        if (perler) return { ...perler, brandName: 'Perler' };
        const mard = MARD_PALETTE.find(p => colorToKey(p.rgb) === colorKey);
        if (mard) return { ...mard, brandName: 'Mard' };
        return undefined;
    };
    const groups: Record<string, typeof colorStats> = { 'Perler': [], 'Mard': [], 'Other': [] };
    colorStats.forEach(stat => {
        const info = getBrandInfo(stat.color);
        if (info && colorBrands.includes(info.brandName.toLowerCase() as BrandType)) {
             groups[info.brandName].push(stat);
        } else {
             groups['Other'].push(stat);
        }
    });
    return [
        { title: 'Perler Beads', data: groups['Perler'] },
        { title: 'Mard Beads', data: groups['Mard'] },
        { title: 'Other / Custom', data: groups['Other'] }
    ].filter(g => g.data.length > 0);
  }, [colorStats, colorBrands]);

  // ================= RENDER =================
  return (
    <div className="w-full h-full min-h-[800px] border rounded-xl shadow-sm bg-background overflow-hidden flex relative">
        <SidebarProvider 
          defaultOpen={true}
          style={{ "--sidebar-width": "18rem", "--sidebar-width-icon": "0px" } as React.CSSProperties}
          className="w-full h-full"
        >
          <DashboardSidebar 
              imageSrc={imageSrc}
              setImageSrc={setImageSrc}
              setRawImageSrc={setRawImageSrc}
              setIsCropping={setIsCropping}
              handleImageUpload={handleImageUpload}

              colorBrands={colorBrands} 
              setColorBrands={setColorBrands}
              samplingMode={samplingMode} 
              setSamplingMode={setSamplingMode}

              setDitherMethod={setDitherMethod} 
              targetWidth={targetWidth} 
              setTargetWidth={setTargetWidth}
              maxColors={maxColors} 
              setMaxColors={setMaxColors} 
              totalAvailableColors={totalAvailableColors}
              colorMethod={colorMethod} 
              setColorMethod={setColorMethod} 
              ditherMethod={ditherMethod}
              
              processedData={processedData} 
              setProcessedData={setProcessedData}
          />

          <SidebarInset className="flex-1 flex flex-col min-w-0 overflow-hidden h-full">
              
              {/* Header 这里依然传入 hasData，以便 Header 内部控制按钮禁用状态 */}
              <DashboardHeader 
                  hasData={!!processedData} 
                  pegboardSize={pegboardSize} setPegboardSize={setPegboardSize}
                  showGrid={showGrid} setShowGrid={setShowGrid}
                  showNumbers={showNumbers} setShowNumbers={setShowNumbers}
                  onFullscreen={() => {}} 
                  onOpenEditor={() => setIsEditorOpen(true)}
              />

              <DashboardCanvas 
                  processedData={processedData}
                  showGrid={showGrid} 
                  showNumbers={showNumbers} 
                  showMajorGrid={showMajorGrid}
                  cellShape={cellShape} 
                  pegboardSize={pegboardSize}
                  setCanvasRef={setCanvasRef}
              />

              {processedData && (
                  <DashboardPalette 
                      processedData={processedData}
                      totalBeads={totalBeads}
                      colorStatsCount={colorStats.length}
                      groupedColorStats={groupedColorStats}
                      onColorClick={(c) => console.log(c)}
                  />
              )}
          </SidebarInset>
        </SidebarProvider>

        <ImageCropperModal 
            isOpen={isCropping}
            imageSrc={rawImageSrc}
            onConfirm={handleCropConfirm}
            onCancel={handleCropCancel}
        />
    </div>
  );
};

export default BeadDashboard;
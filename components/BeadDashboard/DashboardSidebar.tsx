'use client'

import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, Grid, Trash2, Tag, 
  Image as ImageIcon, Smile, SlidersHorizontal, Check
} from 'lucide-react';

import { BrandType, ColorMethod, DitherMethod, SamplingMode } from '@/types';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sidebar, SidebarContent, SidebarHeader, SidebarGroup,
  SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, SidebarRail, SidebarSeparator
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils";

const SUPPORTED_BRANDS: { id: BrandType; name: string }[] = [
  { id: 'perler', name: 'Perler Beads' },
  { id: 'mard', name: 'Mard Beads' },
];

const HelpTooltip = ({ content }: { content: string }) => (
    <TooltipProvider delayDuration={300}>
        <Tooltip>
            <TooltipTrigger asChild>
                <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-muted-foreground/50 text-[10px] font-serif text-muted-foreground cursor-help hover:bg-accent hover:text-accent-foreground transition-colors ml-1.5 select-none">
                    ?
                </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-[240px] text-xs p-3">
                {content}
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
);

interface DashboardSidebarProps extends React.ComponentProps<typeof Sidebar> {
  imageSrc: string | null;
  setImageSrc: (src: string | null) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement> | { target: { files: FileList | File[] | null } }) => void;
  colorBrands: BrandType[];
  setColorBrands: React.Dispatch<React.SetStateAction<BrandType[]>>;
  samplingMode: SamplingMode;
  setSamplingMode: (v: SamplingMode) => void;
  setDitherMethod: (v: DitherMethod) => void;
  targetWidth: number;
  setTargetWidth: (v: number) => void;
  maxColors: number;
  setMaxColors: (v: number) => void;
  totalAvailableColors: number;
  colorMethod: ColorMethod;
  setColorMethod: (v: ColorMethod) => void;
  ditherMethod: DitherMethod;
  processedData: any;
  setProcessedData: (data: any) => void;
}

export function DashboardSidebar({
  imageSrc, setImageSrc, handleImageUpload,
  colorBrands, setColorBrands,
  samplingMode, setSamplingMode, setDitherMethod,
  targetWidth, setTargetWidth,
  maxColors, setMaxColors, totalAvailableColors,
  colorMethod, setColorMethod,
  ditherMethod,
  processedData, setProcessedData,
  ...props
}: DashboardSidebarProps) {

  const [activeStyle, setActiveStyle] = useState<'detail' | 'cartoon' | 'custom'>('cartoon');
  const [customMemory, setCustomMemory] = useState({ width: 64, maxColors: 48 });

  // 1. 滚动定位逻辑
  const scrollToDashboard = () => {
    const element = document.getElementById('bead-dashboard-container');
    const header = document.getElementById('site-header');
    if (element) {
      const isMobile = window.innerWidth < 768;
      const headerHeight = header ? header.offsetHeight : 64;
      const gap = isMobile ? 5 : 10;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerHeight - gap;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  // 2. 监听外部上传事件 (从 Header 传来的)
  useEffect(() => {
    const handleExternalUpload = (event: any) => {
      const file = event.detail.file;
      if (file) {
        handleImageUpload({ target: { files: [file] } } as any);
        setTimeout(scrollToDashboard, 150);
      }
    };
    window.addEventListener('external-image-upload', handleExternalUpload);
    return () => window.removeEventListener('external-image-upload', handleExternalUpload);
  }, [handleImageUpload]);

  // 3. 本地侧边栏上传
  const onLocalUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageUpload(e);
    setTimeout(scrollToDashboard, 150);
  };

  // 业务逻辑：样式选择
  const handleStyleSelect = (style: 'detail' | 'cartoon' | 'custom') => {
    setActiveStyle(style);
    if (style === 'detail') {
      setSamplingMode('default');
      setTargetWidth(100);
      setMaxColors(totalAvailableColors);
      setDitherMethod('none');
    } else if (style === 'cartoon') {
      setSamplingMode('cartoon');
      setTargetWidth(50);
      setMaxColors(32);
      setDitherMethod('none');
    } else if (style === 'custom') {
      setSamplingMode('default'); 
      setTargetWidth(customMemory.width);
      setMaxColors(customMemory.maxColors);
    }
  };

  const handleManualWidthChange = (val: number) => {
    setTargetWidth(val);
    setActiveStyle('custom');
    setCustomMemory(prev => ({ ...prev, width: val }));
  };

  const handleManualColorsChange = (val: number) => {
    setMaxColors(val);
    setActiveStyle('custom');
    setCustomMemory(prev => ({ ...prev, maxColors: val }));
  };

  return (
    <Sidebar collapsible="icon" className="!static !h-full hidden md:flex border-r" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Grid className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">PerlerDraft</span>
                <span className="truncate text-xs">Pattern Generator</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="overflow-x-hidden">
        <SidebarGroup>
          <SidebarGroupContent className="pt-2">
             {!imageSrc ? (
               <div className="p-2">
                 <div className="relative border-2 border-dashed border-sidebar-border hover:border-sidebar-accent-foreground/50 rounded-lg h-24 flex flex-col items-center justify-center cursor-pointer group bg-sidebar-accent/10">
                   <input type="file" accept="image/*" onChange={onLocalUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                   <Upload className="size-5 text-muted-foreground mb-1 group-hover:scale-110 transition-transform" />
                   <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Upload Image</span>
                 </div>
               </div>
             ) : (
               <div className="p-2">
                  <div className="relative rounded-md overflow-hidden border border-sidebar-border bg-sidebar-accent/50 flex items-center justify-center aspect-video group">
                      <img src={imageSrc} alt="Source" className="max-w-full max-h-full object-contain" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => { setImageSrc(null); setProcessedData(null); }}>
                            <Trash2 size={14} />
                         </Button>
                      </div>
                  </div>
               </div>
             )}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup className={!imageSrc ? "opacity-50 pointer-events-none" : ""}>
          <SidebarGroupLabel>Configuration</SidebarGroupLabel>
          <SidebarGroupContent className="px-2 py-2 space-y-6">
              <div className="space-y-3">
                 <Label className="text-xs font-medium">Style</Label>
                 <div className="flex flex-col gap-2">
                    {['detail', 'cartoon', 'custom'].map((style) => (
                      <button
                        key={style}
                        onClick={() => handleStyleSelect(style as any)}
                        className={cn(
                          "group flex items-center w-full p-2 rounded-md border text-left transition-all",
                          activeStyle === style ? "border-primary bg-primary/5 text-primary" : "border-transparent bg-sidebar-accent/30 text-muted-foreground"
                        )}
                      >
                        <div className="mr-3 p-1.5 rounded-md bg-background">
                           {style === 'detail' && <ImageIcon size={16} />}
                           {style === 'cartoon' && <Smile size={16} />}
                           {style === 'custom' && <SlidersHorizontal size={16} />}
                        </div>
                        <div className="flex-1">
                            <div className="text-xs font-semibold capitalize">{style}</div>
                            <div className="text-[10px] opacity-70">
                              {style === 'detail' && "100px / Max colors"}
                              {style === 'cartoon' && "50px / 32 colors"}
                              {style === 'custom' && "Manual settings"}
                            </div>
                        </div>
                        {activeStyle === style && <Check size={14} />}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="space-y-3">
                 <div className="flex justify-between items-center">
                    <Label className="text-xs">Width (Beads)</Label>
                    <span className="text-xs font-mono text-muted-foreground">{targetWidth}px</span>
                 </div>
                 <Slider value={[targetWidth]} min={10} max={128} step={1} onValueChange={(v) => handleManualWidthChange(v[0])} />
              </div>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarSeparator />

        <SidebarGroup className={!imageSrc ? "opacity-50 pointer-events-none" : ""}>
           <SidebarGroupLabel>Palette</SidebarGroupLabel>
           <SidebarGroupContent className="px-2 space-y-6">
              <div className="space-y-3">
                 <div className="flex justify-between items-center">
                    <Label className="text-xs">Max Colors</Label>
                    <span className="text-xs font-mono text-muted-foreground">{maxColors}</span>
                 </div>
                 <Slider value={[maxColors]} min={2} max={totalAvailableColors} step={1} onValueChange={(v) => handleManualColorsChange(v[0])} />
              </div>
              <div className="space-y-3">
                 <Label className="text-xs flex items-center gap-2"><Tag size={12} /> BRANDS</Label>
                 <div className="bg-sidebar-accent/30 rounded-lg p-2 space-y-2 border">
                    {SUPPORTED_BRANDS.map((brand) => (
                       <div key={brand.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`brand-${brand.id}`} 
                            checked={colorBrands.includes(brand.id)}
                            onCheckedChange={() => setColorBrands(prev => prev.includes(brand.id) ? prev.filter(b => b !== brand.id) : [...prev, brand.id])} 
                          />
                          <label htmlFor={`brand-${brand.id}`} className="text-xs cursor-pointer">{brand.name}</label>
                       </div>
                    ))}
                 </div>
              </div>
           </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
'use client'

import React from 'react';
import { 
  Upload, Grid, Trash2, Crop, Check, ChevronRight, Tag, Settings2, Download
} from 'lucide-react';

import { BrandType, ColorMethod, DitherMethod, SamplingMode } from '@/types';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarGroup,
  SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, SidebarMenuSub, SidebarMenuSubItem, SidebarRail, SidebarSeparator
} from "@/components/ui/sidebar"
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible"

const SUPPORTED_BRANDS: { id: BrandType; name: string }[] = [
  { id: 'perler', name: 'Perler Beads' },
  { id: 'mard', name: 'Mard Beads' },
];

interface DashboardSidebarProps extends React.ComponentProps<typeof Sidebar> {
  imageSrc: string | null;
  setImageSrc: (src: string | null) => void;
  setRawImageSrc: (src: string | null) => void;
  setIsCropping: (v: boolean) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  
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
  setProcessedData: any;
}

export function DashboardSidebar({
  imageSrc, setImageSrc, setRawImageSrc, setIsCropping, handleImageUpload,
  colorBrands, setColorBrands,
  samplingMode, setSamplingMode, setDitherMethod,
  targetWidth, setTargetWidth,
  maxColors, setMaxColors, totalAvailableColors,
  colorMethod, setColorMethod,
  ditherMethod,
  processedData, setProcessedData,
  ...props
}: DashboardSidebarProps) {
  return (
    <Sidebar 
      collapsible="icon" 
      className="!static !h-full hidden md:flex border-r transition-all duration-300 ease-in-out group-data-[state=collapsed]:border-none"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
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
        {/* Source Image Group */}
        <SidebarGroup>
          <SidebarGroupLabel>Project Source</SidebarGroupLabel>
          <SidebarGroupContent>
             {!imageSrc ? (
               <div className="p-2">
                 <div className="relative border-2 border-dashed border-sidebar-border hover:border-sidebar-accent-foreground/50 rounded-lg h-24 flex flex-col items-center justify-center text-center transition-colors cursor-pointer group bg-sidebar-accent/10">
                   <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                   <Upload className="size-5 text-muted-foreground mb-1 group-hover:scale-110 transition-transform" />
                   <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Upload Image</span>
                 </div>
               </div>
             ) : (
               <div className="space-y-2 p-2">
                  <div className="relative rounded-md overflow-hidden border border-sidebar-border bg-sidebar-accent/50 flex items-center justify-center aspect-video group">
                     <img src={imageSrc} alt="Source" className="max-w-full max-h-full object-contain" />
                     {/* Overlay Actions */}
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button variant="secondary" size="icon" className="h-7 w-7" onClick={() => setIsCropping(true)} title="Re-crop">
                           <Crop size={14} />
                        </Button>
                        <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => { setImageSrc(null); setProcessedData(null); }} title="Remove">
                           <Trash2 size={14} />
                        </Button>
                     </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                     <span className="flex items-center gap-1"><Check size={10} /> Image Loaded</span>
                  </div>
               </div>
             )}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Configuration Group */}
        <SidebarGroup className={!imageSrc ? "opacity-50 pointer-events-none" : ""}>
          <SidebarGroupLabel>Configuration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              
              {/* Brands Collapsible */}
              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="Brands">
                      <Tag />
                      <span>Color Brands</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {SUPPORTED_BRANDS.map((brand) => (
                        <SidebarMenuSubItem key={brand.id}>
                           <div className="flex items-center space-x-2 py-1">
                              <Checkbox 
                                id={`brand-${brand.id}`} 
                                checked={colorBrands.includes(brand.id)}
                                onCheckedChange={() => {
                                   setColorBrands(prev => prev.includes(brand.id) ? prev.filter(b => b !== brand.id) : [...prev, brand.id]);
                                }}
                              />
                              <label htmlFor={`brand-${brand.id}`} className="text-sm font-medium leading-none cursor-pointer flex-1">
                                {brand.name}
                              </label>
                           </div>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {/* Processing Style */}
              <SidebarMenuItem>
                 <div className="px-2 py-3 space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground">STYLE</Label>
                    <Select value={samplingMode} onValueChange={(v) => { 
                         setSamplingMode(v as SamplingMode);
                         if (v === 'cartoon') setDitherMethod('none');
                         if (v === 'average') setDitherMethod('floyd-steinberg');
                     }}>
                      <SelectTrigger className="h-8 text-xs bg-sidebar-accent/50 border-sidebar-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="cartoon">Cartoon (Solid)</SelectItem>
                        <SelectItem value="average">Photo (Detailed)</SelectItem>
                      </SelectContent>
                    </Select>
                 </div>
              </SidebarMenuItem>

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarSeparator />

        {/* Dimensions & Palette */}
        <SidebarGroup className={!imageSrc ? "opacity-50 pointer-events-none" : ""}>
           <SidebarGroupLabel>Dimensions & Palette</SidebarGroupLabel>
           <SidebarGroupContent>
              <div className="px-2 space-y-5 py-2">
                 {/* Width */}
                 <div className="space-y-3">
                    <div className="flex justify-between items-center">
                       <Label className="text-xs">Width (Beads)</Label>
                       <span className="text-xs font-mono text-muted-foreground">{targetWidth}px</span>
                    </div>
                    <Slider 
                       value={[targetWidth]} min={10} max={128} step={1} 
                       onValueChange={(val) => setTargetWidth(val[0])} 
                       className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                    />
                 </div>

                 {/* Colors */}
                 <div className="space-y-3">
                    <div className="flex justify-between items-center">
                       <Label className="text-xs">Max Colors</Label>
                       <span className="text-xs font-mono text-muted-foreground">{maxColors}</span>
                    </div>
                    <Slider 
                       value={[maxColors]} min={2} max={totalAvailableColors} step={1} 
                       onValueChange={(val) => setMaxColors(val[0])} 
                       className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                    />
                 </div>
              </div>
           </SidebarGroupContent>
        </SidebarGroup>

        {/* Advanced Settings */}
        <SidebarGroup className={!imageSrc ? "opacity-50 pointer-events-none" : ""}>
           <SidebarMenu>
            <Collapsible className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="Advanced">
                      <Settings2 />
                      <span>Advanced Settings</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                       <SidebarMenuSubItem>
                          <div className="space-y-1.5 py-1">
                             <Label className="text-[10px] uppercase text-muted-foreground">Algorithm</Label>
                             <Select value={colorMethod} onValueChange={(v) => setColorMethod(v as ColorMethod)}>
                                <SelectTrigger className="h-7 text-xs border-sidebar-border bg-sidebar-accent/50"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="lab-ciede2000">LAB + CIEDE2000 (Best)</SelectItem>
                                    <SelectItem value="oklab">OKLab (Fast)</SelectItem>
                                </SelectContent>
                            </Select>
                          </div>
                       </SidebarMenuSubItem>
                       <SidebarMenuSubItem>
                          <div className="space-y-1.5 py-1">
                             <Label className="text-[10px] uppercase text-muted-foreground">Dithering</Label>
                             <Select value={ditherMethod} onValueChange={(v) => setDitherMethod(v as DitherMethod)}>
                                <SelectTrigger className="h-7 text-xs border-sidebar-border bg-sidebar-accent/50"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    <SelectItem value="floyd-steinberg">Floyd-Steinberg</SelectItem>
                                    <SelectItem value="atkinson">Atkinson</SelectItem>
                                </SelectContent>
                            </Select>
                          </div>
                       </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
           </SidebarMenu>
        </SidebarGroup>

      </SidebarContent>
      
      <SidebarFooter>
         {processedData && (
             <SidebarMenu>
                 <SidebarMenuItem>
                     <Button variant="outline" className="w-full justify-start gap-2 text-sidebar-foreground border-sidebar-border hover:bg-sidebar-accent" onClick={() => (window as any).alert('Export clicked')}>
                        <Download size={16} /> 
                        <span>Export PDF</span>
                     </Button>
                 </SidebarMenuItem>
             </SidebarMenu>
         )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
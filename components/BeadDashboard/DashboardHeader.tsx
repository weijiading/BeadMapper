'use client'

import React from 'react';
import { PanelLeftClose, PanelLeftOpen, Eye, Maximize2, Pencil } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSidebar } from "@/components/ui/sidebar"
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";

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
            
            {/* 修改：移除了 hasData ? ... : ... 的条件判断，让下方 div 始终显示 */}
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
                        disabled={!hasData} // 优化：没有数据时禁用全屏
                    >
                        <Maximize2 size={12} className="mr-2"/> Fullscreen HD
                    </Button>
                    <Button 
                        size="sm" 
                        onClick={onOpenEditor} 
                        className="h-8 text-xs bg-slate-900 hover:bg-slate-800"
                        disabled={!hasData} // 优化：没有数据时禁用编辑器，防止报错
                    >
                        <Pencil size={12} className="mr-2"/> Open Editor
                    </Button>
                </div>
            </div>
        </header>
    );
}
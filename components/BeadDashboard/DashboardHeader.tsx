'use client'

import React from 'react';
import { PanelLeftClose, PanelLeftOpen, Pencil, Download, Grid3x3 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar"

interface DashboardHeaderProps {
    hasData: boolean;
    // 新增：接收宽高数据
    dimensions?: {
        width: number;
        height: number;
    };
    onOpenEditor: () => void;
    onOpenExport: () => void;
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
    dimensions, // 解构新增的属性
    onOpenEditor,
    onOpenExport,
}: DashboardHeaderProps) {
    return (
        <header className="flex h-14 items-center gap-2 border-b bg-background/95 backdrop-blur px-4 sticky top-0 z-10">
            <CustomSidebarTrigger />
            
            <Separator orientation="vertical" className="mr-2 h-4" />
            
            {/* 修改区域开始：如果有尺寸数据，显示尺寸；否则显示默认标题 */}
            <div className="flex items-center text-sm font-medium text-muted-foreground">
                {hasData && dimensions ? (
                    <div className="flex items-center gap-2 bg-muted/50 px-2 py-1 rounded-md">
                        <Grid3x3 size={16} />
                        <span>{dimensions.width} x {dimensions.height}</span>
                    </div>
                ) : (
                    "Dashboard"
                )}
            </div>
            {/* 修改区域结束 */}

            {/* 右侧操作按钮区 */}
            <div className="flex flex-1 items-center justify-end min-w-0">
                <div className="flex gap-2 shrink-0 items-center">
                    <Button 
                        size="sm" 
                        onClick={onOpenEditor} 
                        className="h-8 text-xs bg-slate-900 hover:bg-slate-800"
                        disabled={!hasData}
                    >
                        <Pencil size={12} className="mr-2"/> Editor
                    </Button>

                    <Button 
                        variant="outline"
                        size="sm"
                        onClick={onOpenExport}
                        className="h-8 text-xs gap-2"
                        disabled={!hasData}
                    >
                        <Download size={12} /> 
                        <span className="hidden sm:inline">Export</span>
                    </Button>
                </div>
            </div>
        </header>
    );
}
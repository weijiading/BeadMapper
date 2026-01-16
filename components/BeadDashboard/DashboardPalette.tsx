'use client'

import React from 'react';
import { Grid, Layers, Palette } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { colorToKey } from '@/lib/processing/colors';
import { PERLER_PALETTE, MARD_PALETTE } from '@/lib/constants/palettes';

// 辅助函数
const getContrastColor = (r: number, g: number, b: number) => {
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
};

interface ColorStat {
    id: number;
    color: string;
    count: number;
}

interface GroupedStat {
    title: string;
    data: ColorStat[];
}

interface DashboardPaletteProps {
    processedData: { cols: number; rows: number };
    totalBeads: number;
    colorStatsCount: number;
    groupedColorStats: GroupedStat[];
    onColorClick: (color: string) => void;
}

export function DashboardPalette({
    processedData,
    totalBeads,
    colorStatsCount,
    groupedColorStats,
    onColorClick
}: DashboardPaletteProps) {
    
    // 获取品牌信息的辅助函数
    const getBrandInfo = (colorKey: string) => {
        const perler = PERLER_PALETTE.find(p => colorToKey(p.rgb) === colorKey);
        if (perler) return { ...perler, brandName: 'Perler' };
        const mard = MARD_PALETTE.find(p => colorToKey(p.rgb) === colorKey);
        if (mard) return { ...mard, brandName: 'Mard' };
        return undefined;
    };

    return (
        <div className="bg-background border-t flex flex-col z-10 h-auto shrink-0 max-h-[300px] overflow-y-auto">
            <div className="px-6 py-3 border-b flex items-center justify-between bg-slate-50/50 text-xs text-muted-foreground sticky top-0 z-20">
                <div className="flex gap-6">
                    <div className="flex items-center gap-2"><Grid size={12}/> {processedData.cols} x {processedData.rows}</div>
                    <div className="flex items-center gap-2"><Layers size={12}/> {totalBeads} beads</div>
                    <div className="flex items-center gap-2"><Palette size={12}/> {colorStatsCount} colors</div>
                </div>
            </div>
            
            <div className="p-6">
                {groupedColorStats.map((group, idx) => (
                    <div key={group.title} className={idx > 0 ? "mt-8" : ""}>
                        <h4 className="text-[10px] font-bold uppercase text-muted-foreground mb-3 flex items-center gap-2">
                            {group.title}
                            <Separator className="flex-1" />
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                            {group.data.map(stat => {
                                const info = getBrandInfo(stat.color);
                                return (
                                    <div 
                                    key={stat.id} 
                                    className="group flex items-center gap-3 p-2 rounded-md border bg-background hover:bg-accent/50 hover:border-accent-foreground/30 transition-all cursor-pointer shadow-sm hover:shadow-md"
                                    onClick={() => onColorClick(stat.color)}
                                    >
                                        <div className="size-8 rounded-sm border shrink-0 flex items-center justify-center text-[10px] font-bold text-white shadow-sm" style={{ backgroundColor: stat.color, color: getContrastColor(0,0,0) }}>
                                            <span className="drop-shadow-md">{stat.id}</span>
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-xs font-medium truncate w-full leading-tight">{info ? info.name : stat.color}</span>
                                            <span className="text-[10px] text-muted-foreground font-mono">x{stat.count}</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
'use client'

import React, { useMemo } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { BrandType } from '@/types';
import { PERLER_PALETTE, MARD_PALETTE } from '@/lib/constants/palettes';
import { colorToKey } from '@/lib/processing/colors';
import { Separator } from "@/components/ui/separator";
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const rgbStringToHex = (rgbStr: string) => {
  const match = rgbStr.match(/\d+/g);
  if (!match || match.length < 3) return rgbStr;
  const [r, g, b] = match.map(Number);
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
};

interface PaletteItem {
  id: string;
  name: string;
  rgb: string;
  brandName: string;
}

interface DashboardPaletteProps {
  processedData: { colors: string[]; rows: number; cols: number };
  colorBrands: BrandType[];
  disabledColors?: string[];
  onColorClick?: (color: string) => void;
  onToggleDisable?: (color: string) => void;
  className?: string;
}

export const DashboardPalette: React.FC<DashboardPaletteProps> = ({
  processedData,
  colorBrands = [],
  disabledColors = [],
  onColorClick,
  onToggleDisable,
  className
}) => {
  const totalBeads = useMemo(
    () => processedData.colors.filter(c => c !== 'transparent').length,
    [processedData]
  );

  const colorStats = useMemo(() => {
    const uniqueColors = new Set<string>();
    const counts: Record<string, number> = {};
    const stats: { id: number; color: string; count: number }[] = [];

    processedData.colors.forEach(color => {
      if (color !== 'transparent') {
        if (!uniqueColors.has(color)) {
          uniqueColors.add(color);
          stats.push({ id: uniqueColors.size, color, count: 0 });
        }
        counts[color] = (counts[color] || 0) + 1;
      }
    });

    return stats
      .map(s => ({ ...s, count: counts[s.color] }))
      .sort((a, b) => b.count - a.count);
  }, [processedData]);

  const getBrandInfo = (colorKey: string): PaletteItem | undefined => {
    const perler = PERLER_PALETTE.find(p => colorToKey(p.rgb) === colorKey);
    if (perler) return { ...perler, brandName: 'Perler', rgb: colorKey };
    const mard = MARD_PALETTE.find(p => colorToKey(p.rgb) === colorKey);
    if (mard) return { ...mard, brandName: 'Mard', rgb: colorKey };
    return undefined;
  };

  const groupedColorStats = useMemo(() => {
    const groups: Record<string, typeof colorStats> = {
      Perler: [],
      Mard: [],
      Other: []
    };

    colorStats.forEach(stat => {
      const info = getBrandInfo(stat.color);
      if (info && colorBrands.includes(info.brandName.toLowerCase() as BrandType)) {
        groups[info.brandName].push(stat);
      } else {
        groups.Other.push(stat);
      }
    });

    return [
      { title: 'Perler Beads', data: groups.Perler },
      { title: 'Mard Beads', data: groups.Mard },
      { title: 'Other', data: groups.Other }
    ].filter(g => g.data.length > 0);
  }, [colorStats, colorBrands]);

  const disabledColorsList = useMemo(() => {
    return disabledColors.map(colorKey => {
      const info = getBrandInfo(colorKey);
      return {
        color: colorKey,
        name: info ? info.name : rgbStringToHex(colorKey),
        id: info ? info.id : '?'
      };
    });
  }, [disabledColors]);

  return (
    <div className={cn(
      "relative flex flex-col bg-background min-h-0 overflow-hidden",
      className
    )}>
      {/* 顶部统计区 */}
      <div className="flex-shrink-0 px-3 py-4 border-b border-border bg-muted/30 flex items-center gap-4">
        <div className="leading-tight">
          <div className="text-xs font-semibold">{totalBeads.toLocaleString()}</div>
          <div className="text-[10px] opacity-70 uppercase">Total Beads</div>
        </div>
        <Separator orientation="vertical" className="h-6" />
        <div className="leading-tight">
          <div className="text-xs font-semibold">{colorStats.length}</div>
          <div className="text-[10px] opacity-70 uppercase">Colors</div>
        </div>
      </div>

      {/* 可滚动内容区 */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4">
        {groupedColorStats.map((group, groupIdx) => (
          <div key={group.title} className={groupIdx > 0 ? "mt-6" : ""}>
            <h4 className="text-[10px] uppercase font-bold text-muted-foreground/70 mb-3 flex items-center gap-2">
              {group.title}
              <div className="h-px bg-border flex-1" />
            </h4>

            <div className="grid grid-cols-1 gap-1.5">
              {group.data.map(stat => {
                const brandInfo = getBrandInfo(stat.color);
                return (
                  <div
                    key={stat.color}
                    onClick={() => onColorClick?.(stat.color)}
                    className="group flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 cursor-pointer"
                  >
                    <div
                      className="w-9 h-9 rounded-md border border-border/50 flex-shrink-0"
                      style={{ backgroundColor: stat.color }}
                    />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-xs font-medium truncate">
                        {brandInfo ? brandInfo.name : rgbStringToHex(stat.color)}
                      </span>
                      <div className="text-[10px] text-muted-foreground">
                        {brandInfo?.id || 'HEX'} · {stat.count} beads
                      </div>
                    </div>

                    {onToggleDisable && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100"
                        onClick={e => {
                          e.stopPropagation();
                          onToggleDisable(stat.color);
                        }}
                      >
                        <EyeOff size={12} />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {disabledColorsList.length > 0 && (
          <div className="mt-8 pt-4 border-t border-dashed">
            <h4 className="text-[10px] uppercase font-bold text-muted-foreground/70 mb-2">
              Hidden
            </h4>
            <div className="flex flex-wrap gap-2">
              {disabledColorsList.map(item => (
                <TooltipProvider key={item.color}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className="w-6 h-6 rounded-full border cursor-pointer relative group"
                        style={{ backgroundColor: item.color }}
                        onClick={() => onToggleDisable?.(item.color)}
                      >
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 rounded-full">
                          <Eye size={10} className="text-white" />
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">{item.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

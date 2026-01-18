'use client'

import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import PixelCanvas from '@/components/editor/Canvas/PixelCanvas';

interface DashboardCanvasProps {
    processedData: { colors: string[]; rows: number; cols: number } | null;
    showGrid: boolean;
    showNumbers: boolean;
    showMajorGrid: boolean;
    cellShape: 'square' | 'circle' | 'hexagon';
    pegboardSize: number;
    setCanvasRef: (ref: HTMLCanvasElement | null) => void;
}

export function DashboardCanvas({
    processedData,
    showGrid,
    showNumbers,
    showMajorGrid,
    cellShape,
    pegboardSize,
    setCanvasRef
}: DashboardCanvasProps) {
    return (
        <div className="relative w-full h-full bg-slate-50/50">
            <div className="absolute inset-0 overflow-hidden">
                <div className="relative w-full h-full p-6 md:p-12 flex items-center justify-center">
                    
                    {processedData ? (
                        <PixelCanvas
                            colors={processedData.colors}
                            rows={processedData.rows}
                            cols={processedData.cols}
                            // 修改1：设置为 true，开启网格绘制循环
                            showGrid={true}
                            showNumbers={showNumbers}
                            // 修改2：设置为 false，禁止绘制红色虚实线，全部回落为灰黑线
                            showMajorGrid={false}
                            showColorCodes={false} 
                            cellShape={cellShape}
                            onCanvasReady={setCanvasRef}
                            cellSize={20}
                        />
                    ) : (
                        <div className="relative w-full max-w-[300px] aspect-square flex flex-col items-center justify-center text-slate-300 gap-4 border-2 border-dashed border-slate-200 rounded-xl">
                            <div className="p-4 rounded-full bg-slate-100/50">
                                <ImageIcon size={40} />
                            </div>
                            <p className="text-sm font-medium text-slate-400">
                                Waiting for configuration...
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
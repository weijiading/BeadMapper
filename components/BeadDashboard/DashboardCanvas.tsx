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
        <div className="flex-1 overflow-auto p-6 w-full flex justify-center bg-slate-50/50">
            <div className="w-full max-w-4xl mx-auto aspect-square md:aspect-auto md:min-h-[500px] relative rounded-xl border bg-background shadow-sm flex flex-col overflow-hidden">
                {processedData ? (
                    <PixelCanvas
                        colors={processedData.colors}
                        rows={processedData.rows}
                        cols={processedData.cols}
                        showGrid={showGrid}
                        showNumbers={showNumbers}
                        showMajorGrid={showMajorGrid}
                        cellShape={cellShape}
                        onCanvasReady={setCanvasRef}
                        cellSize={20}
                        fitContainer={true}
                        pegboardSize={pegboardSize}
                    />
                ) : (
                    <div className="w-full h-[500px] flex flex-col items-center justify-center text-slate-300 gap-4">
                        <div className="p-4 rounded-full bg-slate-100/50"><ImageIcon size={40} /></div>
                        <p className="text-sm font-medium text-slate-400">Waiting for configuration...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
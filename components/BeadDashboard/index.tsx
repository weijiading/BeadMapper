'use client'

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { loadImage, sampleImageColors } from '@/lib/processing/index';
import { ColorMethod, DitherMethod, SamplingMode, BrandType } from '@/types';
import { PERLER_PALETTE, MARD_PALETTE } from '@/lib/constants/palettes';
import { DashboardExport } from './DashboardExport';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import { DashboardCanvas } from './DashboardCanvas';
import { DashboardPalette } from './DashboardPalette';

const BeadDashboard = () => {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [processedData, setProcessedData] = useState<{ colors: string[]; rows: number; cols: number } | null>(null);

    const [targetWidth, setTargetWidth] = useState(40);
    const [maxColors, setMaxColors] = useState(24);
    const [colorMethod, setColorMethod] = useState<ColorMethod>('lab-ciede2000');
    const [ditherMethod, setDitherMethod] = useState<DitherMethod>('none');
    const [samplingMode, setSamplingMode] = useState<SamplingMode>('default');
    const [colorBrands, setColorBrands] = useState<BrandType[]>(['perler']);
    const [disabledColors, setDisabledColors] = useState<string[]>([]);

    const [showGrid, setShowGrid] = useState(true);
    const [showNumbers, setShowNumbers] = useState(true);
    const [showMajorGrid, setShowMajorGrid] = useState(true);
    const [cellShape, setCellShape] = useState<'square' | 'circle' | 'hexagon'>('square');
    const [pegboardSize, setPegboardSize] = useState(52);

    const [isExportOpen, setIsExportOpen] = useState(false);
    const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);

    const globalReplacementsRef = useRef<Record<string, string>>({});
    const [globalReplacements, setGlobalReplacements] = useState<Record<string, string>>({});

    useEffect(() => {
        globalReplacementsRef.current = globalReplacements;
    }, [globalReplacements]);

    const totalAvailableColors = useMemo(() => {
        let count = 0;
        if (colorBrands.length === 0) return 256;
        if (colorBrands.includes('perler')) count += PERLER_PALETTE.length;
        if (colorBrands.includes('mard')) count += MARD_PALETTE.length;
        return count;
    }, [colorBrands]);

    const processImage = useCallback(async () => {
        if (!imageSrc) return;
        try {
            const img = await loadImage(imageSrc);
            const result = sampleImageColors(
                img,
                targetWidth,
                maxColors,
                colorMethod,
                ditherMethod,
                samplingMode,
                colorBrands,
                disabledColors
            );

            const replacements = globalReplacementsRef.current;
            const mappedColors = result.colors.map(c => replacements[c] || c);

            setProcessedData({ ...result, colors: mappedColors });
        } catch (e) {
            console.error(e);
        }
    }, [
        imageSrc,
        targetWidth,
        maxColors,
        colorMethod,
        ditherMethod,
        samplingMode,
        colorBrands,
        disabledColors
    ]);

    useEffect(() => {
        processImage();
    }, [processImage]);

    // ✅ 增强后的滚动函数
    const scrollToDashboard = useCallback(() => {
        const dashboardElement = document.getElementById('dashboard-section');
        if (!dashboardElement) return;

        // 获取 site-header 的高度 (假设使用了 standard shadcn header 或 HTML5 header 标签)
        const header = document.querySelector('header') || document.querySelector('.site-header');
        const headerHeight = header ? header.offsetHeight : 0;

        // 判断移动端还是 Web 端
        const isMobile = window.innerWidth < 768;
        const offset = isMobile ? 5 : 10;

        const elementPosition = dashboardElement.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - headerHeight - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }, []);

    // 直接手动定义 e 的类型，这样就不需要导入 DashboardSidebarProps 了
const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement> | { target: { files: FileList | File[] | null } }) => {
    // 1. 统一获取 files
    const files = e.target.files;
    
    // 2. 获取第一个文件（兼容 FileList 和数组格式）
    const file = files instanceof FileList ? files[0] : files?.[0];
    
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        if (typeof reader.result === 'string') {
            setImageSrc(reader.result);
            // 图片数据准备好后，触发滚动
            requestAnimationFrame(() => {
                scrollToDashboard();
            });
        }
    };
    reader.readAsDataURL(file);

    // 3. 清空 input 的值（仅当 e 是原生事件时有效）
    if ('value' in e.target) {
        (e.target as HTMLInputElement).value = '';
    }
};

    const handleToggleDisable = (colorKey: string) => {
        setDisabledColors(prev =>
            prev.includes(colorKey)
                ? prev.filter(c => c !== colorKey)
                : [...prev, colorKey]
        );
    };

    return (
        <div className="w-full h-screen max-h-screen border rounded-xl shadow-sm bg-background overflow-hidden flex relative">

            <SidebarProvider
                defaultOpen
                style={{ "--sidebar-width": "18rem", "--sidebar-width-icon": "0px" } as React.CSSProperties}
                className="w-full h-full"
            >
                <DashboardSidebar
                    imageSrc={imageSrc}
                    setImageSrc={setImageSrc}
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

                <SidebarInset className="flex flex-col h-full min-h-0">
                    <DashboardHeader
                        hasData={!!processedData}
                        dimensions={
                            processedData
                                ? { width: processedData.cols, height: processedData.rows }
                                : undefined
                        }
                        onOpenEditor={() => {
                            // 先不实现 Editor，也不会报错
                            console.log('Open editor');
                        }}
                        onOpenExport={() => setIsExportOpen(true)}
                    />

                    <div className="flex flex-1 min-h-0 flex-col lg:flex-row">
                        <div className="flex-[3] min-h-0 relative">
                            <DashboardCanvas
                                processedData={processedData}
                                showGrid={showGrid}
                                showNumbers={showNumbers}
                                showMajorGrid={showMajorGrid}
                                cellShape={cellShape}
                                pegboardSize={pegboardSize}
                                setCanvasRef={setCanvasRef}
                            />
                        </div>

                        {processedData && (
                            <DashboardPalette
                                processedData={processedData}
                                colorBrands={colorBrands}
                                disabledColors={disabledColors}
                                onToggleDisable={handleToggleDisable}
                                className="
                  flex-[2]
                  min-h-0
                  border-t
                  lg:border-t-0
                  lg:border-l
                  lg:flex-none
                  lg:w-[280px]
                "
                            />
                        )}
                    </div>
                </SidebarInset>
            </SidebarProvider>

            <DashboardExport
                open={isExportOpen}
                onOpenChange={setIsExportOpen}
                processedData={processedData}
                pegboardSize={pegboardSize}
                setPegboardSize={setPegboardSize}
                cellShape={cellShape}
                setCellShape={setCellShape}
            />
        </div>
    );
};

export default BeadDashboard;
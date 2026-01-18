'use client'

import React, { useState, useRef, useEffect, useTransition, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ZoomIn, RefreshCcw, Move, MousePointer2 } from 'lucide-react'

// --- 类型定义 ---
interface ImageCropperDialogProps {
  isOpen: boolean
  imageSrc: string | null
  onConfirm: (croppedImage: string) => void
  onCancel: () => void
}

// Pegboard 预设选项
const PEGBOARD_OPTIONS = [
  { label: 'Default (52×52)', value: '52', width: 52, height: 52 },
  { label: 'Mini (29×29)', value: '29', width: 29, height: 29 },
  { label: 'Standard (50×50)', value: '50', width: 50, height: 50 },
  { label: 'Large (78×78)', value: '78', width: 78, height: 78 },
  { label: 'Super (104×104)', value: '104', width: 104, height: 104 },
]

export function ImageCropperDialog({
  isOpen,
  imageSrc,
  onConfirm,
  onCancel,
}: ImageCropperDialogProps) {
  const [isPending, startTransition] = useTransition()
  
  // --- 状态管理 ---
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Pegboard 状态
  const [pegboardMode, setPegboardMode] = useState<string>('52')
  const [customSize, setCustomSize] = useState({ width: 52, height: 52 })

  // Refs
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)

  // --- 重置与初始化 ---
  useEffect(() => {
    if (isOpen) {
      resetEditor()
    }
  }, [isOpen, imageSrc])

  const resetEditor = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
    // 保持当前的 pegboard 选择，不重置它
  }

  // --- 计算当前目标比例 ---
  const currentAspect = useMemo(() => {
    if (pegboardMode === 'custom') {
      return customSize.width / customSize.height || 1
    }
    const option = PEGBOARD_OPTIONS.find((p) => p.value === pegboardMode)
    return option ? option.width / option.height : 1
  }, [pegboardMode, customSize])

  // --- 交互逻辑：鼠标滚轮缩放 ---
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const ZOOM_SPEED = 0.001
    const newScale = Math.min(Math.max(0.5, scale - e.deltaY * ZOOM_SPEED), 3)
    setScale(newScale)
  }

  // --- 交互逻辑：鼠标拖拽图片 ---
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return
    e.preventDefault()
    const newX = e.clientX - dragStart.x
    const newY = e.clientY - dragStart.y
    setPosition({ x: newX, y: newY })
  }

  const handlePointerUp = () => {
    setIsDragging(false)
  }

  // --- 核心逻辑：生成裁剪后的图片 ---
  const handleSave = () => {
    startTransition(async () => {
      if (!imgRef.current || !previewCanvasRef.current || !containerRef.current) return

      const canvas = previewCanvasRef.current
      const img = imgRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // 1. 获取裁剪框（Viewport）在屏幕上的尺寸
      // 我们通过 CSS 居中了一个视口 div，它的 ID 是 'viewport-frame'
      const viewportEl = document.getElementById('viewport-frame')
      if (!viewportEl) return

      const viewportRect = viewportEl.getBoundingClientRect()
      const imgRect = img.getBoundingClientRect()

      // 2. 计算图片相对于视口的位置和比例
      // 图片在屏幕上的实际渲染尺寸（包含 transform 后的 scale）
      const renderedImgWidth = imgRect.width
      const renderedImgHeight = imgRect.height

      // 3. 计算裁剪区域在"渲染后的图片"上的坐标 (相对于图片左上角)
      const cropX_on_rendered = viewportRect.left - imgRect.left
      const cropY_on_rendered = viewportRect.top - imgRect.top

      // 4. 将坐标映射回图片的"原始分辨率" (Natural Width/Height)
      // scaleFactor = 原始宽度 / 渲染宽度
      const scaleFactorX = img.naturalWidth / renderedImgWidth
      const scaleFactorY = img.naturalHeight / renderedImgHeight

      const naturalCropX = cropX_on_rendered * scaleFactorX
      const naturalCropY = cropY_on_rendered * scaleFactorY
      const naturalCropW = viewportRect.width * scaleFactorX
      const naturalCropH = viewportRect.height * scaleFactorY

      // 5. 设置 Canvas 大小并绘图
      // 我们可以选择输出的高清程度。这里使用自然分辨率的映射，或者根据 Pegboard 尺寸定
      // 如果想要输出图像大小严格等于 Pegboard 尺寸（如 52px），可以在这里设死
      // 但通常这里是"裁剪"，所以我们保留高清细节，由后续步骤缩小
      canvas.width = naturalCropW
      canvas.height = naturalCropH

      ctx.imageSmoothingQuality = 'high'
      
      // 清空画布
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // 绘制裁剪部分
      ctx.drawImage(
        img,
        naturalCropX,
        naturalCropY,
        naturalCropW,
        naturalCropH,
        0,
        0,
        canvas.width,
        canvas.height
      )

      const base64 = canvas.toDataURL('image/png')
      onConfirm(base64)
    })
  }

  if (!imageSrc) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden select-none">
        
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-background z-20">
          <DialogTitle>Edit Image for Pegboard</DialogTitle>
        </DialogHeader>

        {/* Body: 交互区域 */}
        <div 
            className="flex-1 bg-secondary/30 relative overflow-hidden flex items-center justify-center"
            ref={containerRef}
            onWheel={handleWheel} // 滚轮缩放
        >
            {/* 棋盘格背景 */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.05]"
                 style={{
                    backgroundImage: `linear-gradient(45deg, #000 25%, transparent 25%), linear-gradient(-45deg, #000 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #000 75%), linear-gradient(-45deg, transparent 75%, #000 75%)`,
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                 }}
            />

            {/* 可拖拽的图片容器 */}
            <div 
                className="absolute w-full h-full flex items-center justify-center cursor-move touch-none"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
            >
                <img
                    ref={imgRef}
                    src={imageSrc}
                    alt="Target"
                    draggable={false}
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        maxWidth: 'none', // 允许超出容器
                        maxHeight: 'none',
                        transition: isDragging ? 'none' : 'transform 0.1s linear', // 拖拽时移除动画以提高性能
                        willChange: 'transform'
                    }}
                    className="origin-center select-none"
                />
            </div>

            {/* 遮罩层 (Overlay) - 视觉上模拟裁剪框 */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-black/50">
                {/* 这个 div 是透明的视口 (Pegboard Frame) */}
                <div 
                    id="viewport-frame"
                    className="relative border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] box-content"
                    style={{
                        // 动态计算视口大小：确保在容器内可见，同时保持比例
                        aspectRatio: `${currentAspect}`,
                        width: currentAspect >= 1 ? 'min(60vw, 500px)' : 'auto',
                        height: currentAspect < 1 ? 'min(60vh, 500px)' : 'auto',
                        // 如果计算出的宽/高导致另一边溢出，max-height/width 会限制住
                        maxWidth: '80%',
                        maxHeight: '65vh',
                    }}
                >   
                    {/* 网格参考线 (可选) */}
                    <div className="absolute inset-0 opacity-20 border-t border-b border-white/50 top-1/3 bottom-1/3 pointer-events-none"></div>
                    <div className="absolute inset-0 opacity-20 border-l border-r border-white/50 left-1/3 right-1/3 pointer-events-none"></div>
                </div>
            </div>
            
            {/* 提示文字 */}
            <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none opacity-60">
                <span className="bg-black/40 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                    Scroll to zoom • Drag to pan
                </span>
            </div>
        </div>

        {/* Footer: 控制面板 */}
        <div className="bg-background border-t p-6 space-y-6 z-20">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
            
            {/* 左侧：Pegboard 设置 */}
            <div className="space-y-3">
              <Label className="text-xs font-medium text-muted-foreground">Pegboard Configuration</Label>
              <div className="flex gap-2 items-end">
                <Select 
                    value={pegboardMode} 
                    onValueChange={(val) => {
                        setPegboardMode(val)
                        // 切换比例时稍微重置一下视图位置可能更好，但也未必
                        setScale(1) 
                        setPosition({x:0, y:0})
                    }}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Size" />
                    </SelectTrigger>
                    <SelectContent>
                        {PEGBOARD_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                        <Separator className="my-1"/>
                        <SelectItem value="custom">Custom Size...</SelectItem>
                    </SelectContent>
                </Select>

                {/* 自定义尺寸输入框 */}
                {pegboardMode === 'custom' && (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                        <div className="space-y-1">
                            <span className="text-[10px] text-muted-foreground ml-1">W</span>
                            <Input 
                                type="number" 
                                className="h-9 w-16 text-xs" 
                                value={customSize.width}
                                onChange={(e) => setCustomSize(prev => ({ ...prev, width: Number(e.target.value) || 1 }))}
                            />
                        </div>
                        <span className="text-muted-foreground pb-2">×</span>
                        <div className="space-y-1">
                            <span className="text-[10px] text-muted-foreground ml-1">H</span>
                            <Input 
                                type="number" 
                                className="h-9 w-16 text-xs" 
                                value={customSize.height}
                                onChange={(e) => setCustomSize(prev => ({ ...prev, height: Number(e.target.value) || 1 }))}
                            />
                        </div>
                    </div>
                )}
              </div>
            </div>

            {/* 右侧：Zoom 控制 */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                  <Label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                      <ZoomIn className="w-3 h-3" /> Zoom
                  </Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={resetEditor} 
                    className="h-6 w-6 p-0 hover:bg-transparent text-muted-foreground hover:text-foreground"
                    title="Reset View"
                  >
                    <RefreshCcw className="w-3 h-3" />
                  </Button>
              </div>
              <div className="flex items-center gap-3">
                 <Slider
                  value={[scale]}
                  min={0.5}
                  max={3}
                  step={0.1}
                  onValueChange={(v) => setScale(v[0])}
                  className="flex-1"
                />
                <span className="text-xs w-8 text-right font-mono">{Math.round(scale * 100)}%</span>
              </div>
            </div>
          </div>

          {/* 底部按钮 */}
          <DialogFooter className="flex-row justify-end gap-2 pt-2 border-t mt-4">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? 'Processing...' : 'Confirm Crop'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
      
      {/* 隐藏的 canvas 用于生成图片 */}
      <canvas ref={previewCanvasRef} className="hidden" />
    </Dialog>
  )
}
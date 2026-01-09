'use client' 

import React from 'react'
import SiteHeader from '@/components/site-header'
import FloatingAvatars from '@/components/floating-avatars'
import HeroGridCell from '@/components/hero-grid-cell'
import { useTranslations } from 'next-intl'

export default function HeroModule() {
  const t = useTranslations('Hero')

  const containerClass = "w-full md:w-[80%] max-w-[1920px] mx-auto border-x border-dashed border-border bg-background relative transition-all duration-300"

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden">
      
      <SiteHeader /> 

      <div className="w-full border-b border-dashed border-border">
        <div className={containerClass}>
          <HeroGridCell>
            <div className="flex flex-col items-center justify-center relative px-4 pt-20 pb-48 md:pt-32 md:pb-32 w-full">
              
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                 <FloatingAvatars />
              </div>

              {/* 
                ⭐⭐⭐ 完美修复版 Badge ⭐⭐⭐ 
                修复点：将 rx 从 9999 改为 14。
                原理：标签高度约为 28px，设置 rx="14" (高度的一半) 能强制 SVG 渲染为胶囊形，
                彻底解决了因 rx 过大导致的“椭圆拉伸”问题。
              */}
              <div className="relative mb-6 md:mb-8 inline-flex items-center justify-center rounded-full bg-background shadow-sm">
                
                {/* SVG 容器 */}
                <svg className="absolute inset-0 h-full w-full overflow-visible pointer-events-none">
                  
                  {/* 底层静态边框 */}
                  <rect
                    x="1" y="1" 
                    rx="14" /* ✅ 关键修复：固定圆角半径，匹配标签高度 */
                    width="calc(100% - 2px)" 
                    height="calc(100% - 2px)"
                    fill="none"
                    stroke="currentColor" 
                    strokeWidth="1"
                    className="text-border" 
                  />
                  
                  {/* 顶层流光边框 */}
                  <rect
                    x="1" y="1" 
                    rx="14" /* ✅ 保持一致 */
                    width="calc(100% - 2px)" 
                    height="calc(100% - 2px)"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeDasharray="20 80" /* 调整了光束比例，让它看起来更干练 */
                    pathLength="100"
                    className="animate-border-beam text-primary" 
                  />
                </svg>

                {/* 内容层 */}
                <div className="relative z-10 px-3 py-1 md:px-4 md:py-1.5">
                  <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    {t('badge')}
                  </span>
                </div>

              </div>
              {/* ⭐⭐⭐ 修复结束 ⭐⭐⭐ */}

              <h1 className="relative z-20 mx-auto text-center text-3xl sm:text-4xl md:text-[64px] font-black leading-tight tracking-tighter text-foreground max-w-[90%] md:max-w-4xl text-balance">
                {t('title')}
              </h1>

              <p className="relative z-20 mt-6 mx-auto max-w-2xl text-center text-lg text-muted-foreground md:text-xl">
                {t('description')}
              </p>

            </div>
          </HeroGridCell>
        </div>
      </div>

    </div>
  )
}
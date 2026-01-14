'use client' 

import React from 'react'
import SiteHeader from '@/components/site-header'
import FloatingAvatars from '@/components/floating-avatars'
import HeroGridCell from '@/components/hero-grid-cell'
import { useTranslations } from 'next-intl'
import { IconRocket, IconGitBranch } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
// 新增引入 Label 组件
import { Label } from "@/components/ui/label"

export default function HeroModule() {
  const t = useTranslations('Hero')
  
  // 这里定义提示语变量，延续你的翻译模式
 

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

              {/* Badge */}
              <div className="relative mb-6 md:mb-8 inline-flex items-center justify-center rounded-full bg-background shadow-sm">
                
                <svg className="absolute inset-0 h-full w-full overflow-visible pointer-events-none">
                  
                  <rect
                    x="1" y="1" 
                    rx="14"
                    width="calc(100% - 2px)" 
                    height="calc(100% - 2px)"
                    fill="none"
                    stroke="currentColor" 
                    strokeWidth="1"
                    className="text-border" 
                  />
                  
                  <rect
                    x="1" y="1" 
                    rx="14"
                    width="calc(100% - 2px)" 
                    height="calc(100% - 2px)"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeDasharray="20 80"
                    pathLength="100"
                    className="animate-border-beam text-primary" 
                  />
                </svg>

                <div className="relative z-10 px-3 py-1 md:px-4 md:py-1.5">
                  <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    {t('badge')}
                  </span>
                </div>

              </div>

              {/* Title */}
              <h1 className="relative z-20 mx-auto text-center text-3xl sm:text-4xl md:text-[64px] font-black leading-tight tracking-tighter text-foreground max-w-[90%] md:max-w-4xl text-balance">
                {t('title')}
              </h1>

              {/* Description */}
              <p className="relative z-20 mt-6 mx-auto max-w-2xl text-center text-lg text-muted-foreground md:text-xl">
                {t('description')}
              </p>

              {/* Buttons */}
              <div className="relative z-20 mt-8 flex flex-col items-center justify-center">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                    <Button variant="outline" size="lg">
                    <IconRocket className="mr-2" /> 
                    {t('button1')}
                    </Button>
                    
                    <Button variant="outline" size="lg">
                    <IconGitBranch className="mr-2" /> 
                    {t('button2')}
                    </Button>
                </div>
                
                {/* 新增的提示信息行 */}
                <Label className="mt-4 text-xs sm:text-sm text-muted-foreground font-normal tracking-wide opacity-80">
                    {t('hintText')}
                </Label>
              </div>

            </div>
          </HeroGridCell>
        </div>
      </div>

    </div>
  )
}
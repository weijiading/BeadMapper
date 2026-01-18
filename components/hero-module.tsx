'use client'

import React from 'react'
import SiteHeader from '@/components/site-header'
import FloatingAvatars from '@/components/floating-avatars'
import HeroGridCell from '@/components/hero-grid-cell'
import { useTranslations } from 'next-intl'
import { Badge } from "@/components/ui/badge"
import BeadDashboard from "@/components/BeadDashboard/index"

export default function HeroModule() {
  const t = useTranslations('Hero')
  const containerClass = "w-full md:w-[80%] max-w-[1920px] mx-auto border-x border-dashed border-border bg-background transition-all duration-300"

  return (
    <div>
      <SiteHeader />
      <div className="w-full border-b border-dashed border-border">
        <div className={containerClass}>
          <HeroGridCell>
            <div className="flex flex-col items-center justify-center w-full px-4 pt-20 pb-12 md:pt-32 md:pb-32">
              <div className="relative w-full flex flex-col items-center max-w-5xl mx-auto">
                <Badge variant="outline" className="mb-6 md:mb-8 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground rounded-full bg-background relative z-20">
                  {t('badge')}
                </Badge>

                <h1 className="relative z-20 mx-auto text-center text-3xl sm:text-4xl md:text-[64px] font-black leading-tight tracking-tighter text-foreground max-w-[90%] md:max-w-4xl text-balance">
                  {t('title')}
                </h1>

                <p className="relative z-20 mt-6 mx-auto max-w-2xl text-center text-base md:text-lg text-muted-foreground">
                  {t('description')}
                </p>

                <div className="w-full mt-8 md:mt-0 md:static">
                  <FloatingAvatars />
                </div>
              </div>

              {/* 定位 ID 和拉开的间距 */}
              <div 
                id="bead-dashboard-container"
                className="relative z-20 mt-12 md:mt-24 w-full min-h-[800px] text-left shadow-2xl rounded-xl"
              >
                <BeadDashboard />
              </div>
            </div>
          </HeroGridCell>
        </div>
      </div>
    </div>
  )
}
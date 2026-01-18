'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { ImagePlus, PenTool } from 'lucide-react'

export default function SiteHeader() {
  const t = useTranslations('Hero') 

  const handleHeaderUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // 发送自定义事件
      const event = new CustomEvent('external-image-upload', { 
        detail: { file } 
      })
      window.dispatchEvent(event)
      e.target.value = ''
    }
  }

  return (
    <header id="site-header" className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-dashed border-gray-200">
      <div className="flex h-16 items-center justify-between mx-auto max-w-[1920px] w-full md:w-[80%] px-4 md:px-6 border-0 md:border-x md:border-dashed md:border-gray-200">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image src="/logo.png" alt="Logo" width={40} height={40} className="w-10 h-10 object-contain" />
          <span className="font-bold text-lg hidden sm:block text-slate-900">BeadMapper</span>
        </Link>
        
        <div className="flex items-center gap-3">
          <Link href="/create/draw" className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 text-slate-700 hover:bg-slate-50">
            <PenTool size={16} />
            <span className="hidden sm:inline">{t('button2')}</span> 
          </Link>

          <div className="relative">
            <label htmlFor="header-upload-input" className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 cursor-pointer">
              <ImagePlus size={16} />
              <span className="hidden sm:inline">{t('button1')}</span>
            </label>
            <input id="header-upload-input" type="file" accept="image/*" className="hidden" onChange={handleHeaderUpload} />
          </div>
        </div>
      </div>
    </header>
  )
}
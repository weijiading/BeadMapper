'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import LanguageSwitcher from '@/components/language-switcher'

export default function SiteHeader() {
  const t = useTranslations('Navigation')

  return (
    // 1. 外层容器
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-dashed border-gray-200">
      
      {/* 
         2. 内层布局 (响应式修改)
      */}
      <div className="
        flex h-16 items-center justify-between mx-auto max-w-[1920px]
        
        w-full md:w-[80%]                                       /* 手机全宽，电脑80% */
        px-4 md:px-6 lg:px-8                                    /* Padding: 手机16px，电脑24px+ */
        border-0 md:border-x md:border-dashed md:border-gray-200 /* Border: 手机无侧边框，电脑有 */
      ">
        
        {/* === 左侧：Logo === */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="ezkit"
            width={48}
            height={48}
            priority
          />
        </Link>
        
        {/* === 右侧：语言切换器 === */}
        <LanguageSwitcher />
        
      </div>
    </header>
  )
}
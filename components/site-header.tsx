'use client'

import React from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl' // 引入多语言工具
import LanguageSwitcher from '@/components/language-switcher' // 引入你原本的语言切换器

// 引入你新找到的 UI 组件
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

export default function SiteHeader() {
  const t = useTranslations('Navigation') // 假设你的 json 里有 Navigation 字段

  return (
    // 1. 外层容器：完全继承你原来的样式 (fixed, blur, border-b)
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-dashed border-gray-200">
      
      {/* 
         2. 内层布局：完全继承你原来的样式 
         w-[80%] 保证了左右的出血位，border-x 保证了垂直虚线
      */}
      <div className="w-[80%] max-w-[1920px] mx-auto border-x border-dashed border-gray-200 h-16 flex items-center justify-between px-6 lg:px-8">
        
        {/* === 左侧：Logo === */}
        <Link href="/" className="text-2xl font-black tracking-tighter text-black cursor-pointer">
          LOGO
        </Link>
        
        {/* 
           === 中间：新的导航组件 === 
           原理：这里不再用 map 循环简单的 button，而是用 NavigationMenu 包裹
        */}
        <div className="hidden md:flex">
          <NavigationMenu>
            <NavigationMenuList>
              
              {/* 这里的每个 Item 就是一个菜单项 */}
              <NavigationMenuItem>
                <Link href="/" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    {/* 使用多语言 key，或者直接写文字 */}
                    {t('home')} 
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/brands" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    {t('brands')}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/services" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    {t('services')}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link href="/solutions" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    {t('solutions')}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

            </NavigationMenuList>
          </NavigationMenu>
        </div>
        
        {/* === 右侧：语言切换器 (保持不变) === */}
        <LanguageSwitcher />
        
      </div>
    </header>
  )
}
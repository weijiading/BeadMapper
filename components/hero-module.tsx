'use client' 

import React from 'react'
import SiteHeader from '@/components/site-header'

import FloatingAvatars from '@/components/floating-avatars'
import LogoCloud from '@/components/logo-cloud'
import ShoeSizeConverter from '@/components/shoe-size-converter'
import HeroGridCell from '@/components/hero-grid-cell'

export default function HeroModule() {
  // 保持与 Navbar 一致的宽度配置
  const containerClass = "w-[80%] max-w-[1920px] mx-auto border-x border-dashed border-gray-200 bg-white relative"

  return (
    <div className="flex flex-col min-h-screen bg-white text-black overflow-x-hidden">
      
      {/* 1. 导航栏 (Fixed) */}
      <SiteHeader /> 

      {/* 
        2. Hero 区域
        ✅ 修改点：移除了外层的 'border-b border-dashed border-gray-200'
        这使得 Hero 和下方的 LogoCloud 在视觉上处于同一个大的垂直通道中，没有横线阻断。
      */}
      <div className="w-full">
        <div className={containerClass}>
          <HeroGridCell>
            {/* 
               Grid 范围：
               通过 pb-12 控制网格结束的位置，使其不顶出轮播区域，
               刚好在换算器下方一点点自然结束。
            */}
            <div className="flex flex-col items-center justify-center relative px-4 pt-32 pb-12 w-full">
              
              <FloatingAvatars />

              <div className="relative mb-8 rounded-full border border-gray-200 bg-white px-4 py-1.5 shadow-sm z-20">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  ✨ Global Size Database 2.0
                </span>
              </div>

              <h1 className="relative z-20 mb-6 text-center text-[48px] md:text-[64px] font-black leading-tight tracking-tighter text-slate-900">
                Convert Shoe Sizes <br />
                <span className="text-gray-400">With Zero Effort.</span>
              </h1>

              <div className="relative z-30 w-full max-w-3xl mt-10">
                <ShoeSizeConverter />
              </div>

            </div>
          </HeroGridCell>
        </div>
      </div>

      {/* 
        3. LogoCloud 区域
        它继续使用 containerClass，所以垂直虚线会接续上面的 Hero 区域。
        底部有一条 border-b (可选，如果作为页面结尾通常保留)
      */}
      <div className="w-full border-b border-dashed border-gray-200">
        <div className={containerClass}>
          {/* LogoCloud 组件内部保留了 py-16 作为间距 */}
          <LogoCloud />
        </div>
      </div>

    </div>
  )
}
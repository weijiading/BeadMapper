'use client'

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu"
import { BrandsDropdown } from "@/components/brands-dropdown"
import { cn } from "@/lib/utils"
import React from "react"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full h-16 bg-white border-b border-slate-200 shadow-sm antialiased">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8">
        
        {/* 
          采用两段式布局：Logo 在左，所有菜单靠右。
          这种布局在交互时最稳定，因为 Logo 是固定在左侧的“锚点”。
        */}
        <div className="flex items-center justify-between h-full w-full">
          
          {/* 1. 左侧：Logo - 永远固定在最左边 */}
          <div className="flex items-center flex-shrink-0">
            <h2 className="text-2xl font-bold text-blue-600 tracking-tight">
              BeadMapper
            </h2>
          </div>

          {/* 2. 右侧：所有的导航项目 (包括 Brands 下拉框) */}
          <div className="flex items-center">
            <NavigationMenu>
              <NavigationMenuList className="flex gap-1">
                {/* 品牌下拉菜单 */}
                <NavigationMenuItem>
                  <BrandsDropdown />
                </NavigationMenuItem>

                {/* 关于链接 */}
                <NavigationMenuItem>
                  <NavigationMenuLink
                    href="#about"
                    className="inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                  >
                    关于
                  </NavigationMenuLink>
                </NavigationMenuItem>
                
                {/* 联系链接 */}
                <NavigationMenuItem>
                  <NavigationMenuLink
                    href="#contact"
                    className="inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                  >
                    联系
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

        </div>
      </div>
    </header>
  )
}
'use client'

import {
  NavigationMenuContent,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { PATTERN_BRANDS } from "@/components/brands-data"
import { cn } from "@/lib/utils"

export function BrandsDropdown() {
  return (
    <>
      {/* 
        修改点：增加 whitespace-nowrap 确保文字不换行
        增加 data-[state=open]:text-blue-600 保持开启状态下的颜色稳定 
      */}
      <NavigationMenuTrigger className="text-slate-600 hover:text-slate-900 whitespace-nowrap data-[state=open]:text-blue-600 transition-colors">
        Brands
      </NavigationMenuTrigger>
      
      <NavigationMenuContent>
        {/* 
          修改点：使用固定的 w-[450px] (或具体像素)，不要让内容撑开容器
          移除内部元素的 transition-all，改为 transition-colors 
        */}
        <div className="grid w-[450px] gap-2 p-4 md:w-[500px] lg:grid-cols-2 bg-white">
          {PATTERN_BRANDS.map((brand) => (
            <a
              key={brand.name}
              href={`#brand-${brand.name.toLowerCase().replace(/\./g, "")}`}
              className={cn(
                "group relative rounded-md p-3 text-sm transition-colors duration-200", // 仅针对颜色过渡
                "hover:bg-blue-50/50",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              )}
            >
              <div className="flex items-center gap-3">
                {/* 
                  修改点：给 logo 容器固定宽高，防止 emoji 尺寸微差导致文字晃动 
                */}
                <span className="text-2xl w-8 h-8 flex items-center justify-center flex-shrink-0">
                  {brand.logo}
                </span>
                <div className="flex flex-col">
                  <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {brand.name}
                  </p>
                  <p className="text-[11px] text-slate-400">查看尺码对照表</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </NavigationMenuContent>
    </>
  )
}
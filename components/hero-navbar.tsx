'use client';

import LanguageSwitcher from '@/components/language-switcher'

export default function HeroNavbar() {
  const navItems = ['Home', 'Brands', 'Services', 'Solutions']
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-dashed border-gray-200">
      {/* 
         ✅ 宽度调整：w-[80%] 
         这意味着左右各留 10%，实现了你想要的出血位。
         同时加上 border-x border-dashed 保证虚线贯穿。
      */}
      <div className="w-[80%] max-w-[1920px] mx-auto border-x border-dashed border-gray-200 h-16 flex items-center justify-between px-6 lg:px-8">
        
        {/* Logo */}
        <div className="text-2xl font-black tracking-tighter text-black">LOGO</div>
        
        {/* Nav Items */}
        <div className="hidden md:flex gap-8 items-center">
          {navItems.map((item) => (
            <button key={item} className="text-sm font-medium text-gray-500 hover:text-black transition-colors">
              {item}
            </button>
          ))}
        </div>
        
        {/* Language Switcher */}
        <LanguageSwitcher />
      </div>
    </nav>
  )
}
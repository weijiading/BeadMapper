'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages } from 'lucide-react';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    // modal={false} 是关键：防止 Radix UI 弹出菜单时锁定滚动条导致页面晃动
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        {/* 
           ✅ 修改点：给按钮增加固定宽度 w-20 (80px)，并使用 justify-center。
           这样无论里面是 ZH 还是 EN，按钮大小永远不变，不会挤压导航栏。
        */}
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center justify-center gap-2 w-20 flex-shrink-0 transition-colors"
        >
          <Languages className="h-4 w-4 flex-shrink-0" />
          <span className="w-5 text-center font-mono">
            {locale.toUpperCase()}
          </span>
        </Button>
      </DropdownMenuTrigger>
      
      {/* align="end" 确保菜单相对于按钮右侧对齐，不会遮挡 Logo */}
      <DropdownMenuContent align="end" className="z-[60]">
        <DropdownMenuItem
          onClick={() => switchLocale('en')}
          className={locale === 'en' ? 'bg-accent' : ''}
        >
          English
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => switchLocale('zh')}
          className={locale === 'zh' ? 'bg-accent' : ''}
        >
          中文
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
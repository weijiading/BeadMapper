"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import Link from "next/link"
// 引入图标
import { Github, Twitter, Instagram, Palette, Grid3X3, FileImage } from "lucide-react" 
// 引入语言切换组件
import LanguageSwitcher from '@/components/language-switcher'

export function SiteFooter() {
  const t = useTranslations()

  return (
    <footer className="w-full border-t bg-white text-slate-600 py-12 lg:py-16">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
        
        {/* === 第一列：品牌、社交与语言设置 === */}
        <div className="flex flex-col space-y-4">
          {/* Brand */}
          <div className="flex items-center space-x-2">
            <div className="bg-slate-900 text-white p-1 rounded-md">
              <Grid3X3 size={24} />
            </div>
            <span className="text-xl font-bold text-slate-900">{t('Header.brand')}</span>
          </div>
          
          {/* Tagline */}
          <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
            {t('Footer.tagline')}
          </p>
          
          {/* Social Icons */}
          <div className="flex space-x-4 pt-2">
            <Link href="https://github.com" target="_blank" className="hover:text-slate-900 transition-colors">
              <Github size={20} />
              <span className="sr-only">GitHub</span>
            </Link>
            <Link href="https://twitter.com" target="_blank" className="hover:text-slate-900 transition-colors">
              <Twitter size={20} />
              <span className="sr-only">Twitter</span>
            </Link>
            <Link href="#" className="hover:text-slate-900 transition-colors">
              <Instagram size={20} />
              <span className="sr-only">Instagram</span>
            </Link>
          </div>

          {/* === 语言切换器 (新增位置) === */}
          <div className="pt-4 mt-2 border-t border-slate-100 w-fit">
            <p className="text-xs text-slate-400 mb-2 font-medium">Language / 语言</p>
            <LanguageSwitcher />
          </div>
        </div>

        {/* === 第二列：拼豆核心工具 === */}
        <div>
          <h3 className="font-semibold text-slate-900 mb-4">{t('Footer.toolsTitle')}</h3>
          <ul className="space-y-3 text-sm">
            <li>
              <Link href="/editor" className="hover:text-slate-900 hover:underline transition-colors flex items-center gap-2">
                <FileImage size={14} />
                {t('Footer.toolsEditor')}
              </Link>
            </li>
            <li>
              <Link href="/palette" className="hover:text-slate-900 hover:underline transition-colors flex items-center gap-2">
                <Palette size={14} />
                {t('Footer.toolsPalette')}
              </Link>
            </li>
            <li>
              <Link href="/gallery" className="hover:text-slate-900 hover:underline transition-colors">
                {t('Footer.toolsGallery')}
              </Link>
            </li>
          </ul>
        </div>

        {/* === 第三列：帮助与资源 === */}
        <div>
          <h3 className="font-semibold text-slate-900 mb-4">{t('Footer.resourcesTitle')}</h3>
          <ul className="space-y-3 text-sm">
            <li>
              <Link href="/guide/ironing" className="hover:text-slate-900 hover:underline transition-colors">
                {t('Footer.guideIroning')}
              </Link>
            </li>
            <li>
              <Link href="/guide/brands" className="hover:text-slate-900 hover:underline transition-colors">
                {t('Footer.guideBrands')}
              </Link>
            </li>
            <li>
              <Link href="/faq" className="hover:text-slate-900 hover:underline transition-colors">
                {t('Footer.faq')}
              </Link>
            </li>
          </ul>
        </div>

        {/* === 第四列：关于 === */}
        <div>
          <h3 className="font-semibold text-slate-900 mb-4">{t('Footer.aboutTitle')}</h3>
          <ul className="space-y-3 text-sm">
            <li>
              <Link href="/about" className="hover:text-slate-900 hover:underline transition-colors">
                {t('Footer.aboutUs')}
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-slate-900 hover:underline transition-colors">
                {t('Footer.privacyPolicy')}
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-slate-900 hover:underline transition-colors">
                {t('Footer.termsOfService')}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* 底部版权栏 */}
      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-slate-100 text-center text-sm text-slate-400">
        <p>{t('Footer.copyright')}</p>
      </div>
    </footer>
  )
}
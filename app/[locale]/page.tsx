"use client"

import { Button } from "@/components/ui/button"
import HeroModule from "@/components/hero-module"
import BeadDashboard from "@/components/BeadDashboard"
import { useTranslations } from "next-intl"
import FaqComponent from "@/components/shadcn-studio/blocks/faq-component-01/faq-component-01"

export default function Home() {
  const t = useTranslations()

  const testimonials = t.raw('Testimonials.reviews')
  const faqItems = t.raw('FAQ.items')

  return (
    <main className="w-full bg-white text-slate-900">
      <HeroModule />

      {/* Dashboard 区域 */}
      <section className="w-full py-12 bg-slate-100 flex justify-center">
        {/* 
            👇 修改点：
            保持 container 和 padding 约束宽度。
        */}
        <div className="container mx-auto px-4">
          
          {/* 
             👇 重点修改：
             1. 移除了 rounded-2xl, shadow-xl, ring-1, overflow-hidden, bg-white。
             2. 这些样式现在移交给 BeadDashboard 内部处理。
             3. 这里只保留 min-h-[800px] 作为一个最小占位。
          */}
          <div className="w-full min-h-[800px]">
            <BeadDashboard />
          </div>

        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* ❌ 原来的 标题和副标题区域 已删除 */}
          
          {/* ✅ 仅保留 FAQ 组件 */}
          <FaqComponent faqItems={faqItems} />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-white font-bold mb-4">{t('Header.brand')}</h3>
            <p className="text-sm">{t('Footer.tagline')}</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">{t('Footer.products')}</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">{t('Footer.sizeConversion')}</a></li>
              <li><a href="#" className="hover:text-white transition">{t('Footer.brandComparison')}</a></li>
              <li><a href="#" className="hover:text-white transition">{t('Footer.shoppingGuide')}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">{t('Footer.help')}</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">{t('Footer.howToUse')}</a></li>
              <li><a href="#" className="hover:text-white transition">{t('Footer.faq')}</a></li>
              <li><a href="#" className="hover:text-white transition">{t('Footer.contactUs')}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">{t('Footer.about')}</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">{t('Footer.aboutUs')}</a></li>
              <li><a href="#" className="hover:text-white transition">{t('Footer.privacyPolicy')}</a></li>
              <li><a href="#" className="hover:text-white transition">{t('Footer.termsOfService')}</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-8 text-center text-sm">
          <p>{t('Footer.copyright')}</p>
        </div>
      </footer>
    </main>
  )
}
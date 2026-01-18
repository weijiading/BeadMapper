"use client"

import HeroModule from "@/components/hero-module"
import { useTranslations } from "next-intl"
import FaqComponent from "@/components/shadcn-studio/blocks/faq-component-01/faq-component-01"
import { SiteFooter } from "@/components/site-footer"

export default function Home() {
  const t = useTranslations()
  const faqItems = t.raw('FAQ.items')

  return (
    <main className="w-full bg-white text-slate-900">
      
      {/* HeroModule 内部包含 SiteHeader 和 BeadDashboard */}
      <HeroModule />

      {/* FAQ 区域 */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <FaqComponent faqItems={faqItems} />
        </div>
      </section>

      {/* 页脚 */}
      <SiteFooter />
      
    </main>
  )
}
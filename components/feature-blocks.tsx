import React from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react" // 这是一个可选图标，如果不需要可以删掉

export default function FeatureBlocks() {
  return (
    <section className="container mx-auto px-4 py-16 space-y-24 md:py-24">
      {/* 顶部标题区域 */}
      <div className="mx-auto max-w-[800px] text-center space-y-4">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Your all-in-one AI photo studio
        </h2>
        {/* 如果需要副标题可以加在这里 */}
      </div>

      {/* Block 1: 左图 右文 */}
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
        {/* 图片区域 - 浅蓝色背景容器 */}
        <div className="relative rounded-[2rem] bg-[#F4F7FE] p-8 md:p-12 overflow-hidden min-h-[400px] flex items-center justify-center order-1">
          {/* 这里使用 img 标签作为占位，实际使用时换成 Next.js 的 <Image /> */}
          <div className="relative w-full h-full flex items-center justify-center">
             {/* 模拟截图中的鞋子图片效果 */}
            <img
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop"
              alt="Product photography example"
              className="w-full max-w-[400px] h-auto object-contain shadow-xl rounded-xl rotate-[-6deg] hover:rotate-0 transition-transform duration-500"
            />
            {/* 模拟背景移除效果的浮层 */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#F4F7FE]/20 to-transparent" />
          </div>
        </div>

        {/* 文本区域 */}
        <div className="flex flex-col space-y-6 order-2">
          <h3 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
            From photo to profit — visuals that actually convert
          </h3>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Photoroom is built for sellers: our AI removes backgrounds with
            best-in-class precision (even on transparent products!) and generates
            the visuals you need to boost trust and drive sales. From product
            listings to social content, ads, logos, CRM images, and print, we
            help you create it all.
          </p>
          <div className="pt-2">
            <Button size="lg" className="h-12 px-8 text-base font-semibold">
              Start creating for free
            </Button>
          </div>
        </div>
      </div>

      {/* Block 2: 左文 右图 (Z字形布局) */}
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
        {/* 文本区域 - 在桌面端放在左边(order-1)，移动端放在下面(order-2) */}
        <div className="flex flex-col space-y-6 order-2 lg:order-1">
          <h3 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
            Cut your photo costs by 90%, not your quality
          </h3>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Save thousands of dollars and hundreds of hours with the photo
            editing solution of Photoroom. Our AI tools bring your vision to
            life with visuals that convert better without looking like AI. No
            design skills needed.
          </p>
          <div className="pt-2">
            <Button size="lg" className="h-12 px-8 text-base font-semibold">
              Start creating for free
            </Button>
          </div>
        </div>

        {/* 图片区域 - 在桌面端放在右边(order-2)，移动端放在上面(order-1) */}
        <div className="relative rounded-[2rem] bg-[#F4F7FE] p-8 md:p-12 overflow-hidden min-h-[400px] flex items-center justify-center order-1 lg:order-2">
          <div className="grid grid-cols-2 gap-4 w-full max-w-[450px]">
            {/* 模拟截图中的多图拼贴效果 */}
            <img
              src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1000&auto=format&fit=crop"
              alt="Lifestyle example 1"
              className="w-full aspect-[3/4] object-cover rounded-xl shadow-lg translate-y-8"
            />
            <img
              src="https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?q=80&w=1000&auto=format&fit=crop"
              alt="Lifestyle example 2"
              className="w-full aspect-[3/4] object-cover rounded-xl shadow-lg -translate-y-4"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
'use client'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

const brands = [
  { name: 'NIKE', placeholder: 'NIKE' },
  { name: 'ADIDAS', placeholder: 'ADIDAS' },
  { name: 'NEW BALANCE', placeholder: 'NB' },
  { name: 'PUMA', placeholder: 'PUMA' },
  { name: 'DHL', placeholder: 'DHL' },
  { name: 'MERCEDES', placeholder: 'MB' },
]

export default function LogoCloud() {
  const t = useTranslations()
  const duplicatedBrands = [...brands, ...brands, ...brands, ...brands] 

  return (
    // ✅ 修改点：移除了 'border-t border-black/5'
    <section className="py-16 px-4 md:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <p className="text-center text-sm font-semibold text-black/50 mb-12 uppercase tracking-wide">
          {t('LogoCloud.title')}
        </p>

        <div className="relative w-full overflow-hidden py-4">
          <motion.div
            className="flex gap-8"
            animate={{
              x: [0, -160 * brands.length * 2] 
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: 'linear',
              repeatType: 'loop',
            }}
          >
            {duplicatedBrands.map((brand, idx) => (
              <motion.div
                key={`brand-${idx}`} 
                className="flex-shrink-0 w-32 h-16 flex items-center justify-center bg-black/5 rounded-lg border border-black/10 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 hover:border-black/20 transition-all duration-300 cursor-pointer group"
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
                style={{
                  transformOrigin: 'center center',
                }}
              >
                <span className="font-bold text-black/60 group-hover:text-black/100 text-sm transition-colors">
                  {brand.placeholder}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* 渐变遮罩 */}
          <div className="absolute left-0 top-4 bottom-4 w-20 bg-gradient-to-r from-white to-transparent pointer-events-none z-10" />
          <div className="absolute right-0 top-4 bottom-4 w-20 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />
        </div>
      </div>
    </section>
  )
}
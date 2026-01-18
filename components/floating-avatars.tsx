'use client'

import React from 'react'
import { cn } from "@/lib/utils"

// ✅ 1. 定义类型接口，明确 mobileHidden, left, right 为可选属性
type AvatarItem = {
  id: number
  size: string
  top: string
  left?: string         // 可选
  right?: string        // 可选
  mobileHidden?: boolean // ✅ 可选：解决报错的核心
  delay: number
  svgFile: string
  rotate: string
}

export default function FloatingAvatars() {
  // ✅ 2. 显式应用类型 : AvatarItem[]
  const floatingAvatarData: AvatarItem[] = [
    { 
      id: 1, 
      size: 'w-10 h-10 md:w-16 md:h-16', 
      top: '-5%', left: '2%', 
      delay: 0, svgFile: 'svg-1.svg', rotate: '0deg' 
    },
    { 
      id: 2, 
      size: 'w-8 h-8 md:w-16 md:h-16', 
      top: '0%', right: '5%', 
      delay: 0.1, svgFile: 'svg-2.svg', rotate: '45deg' 
    },
    { 
      id: 3, 
      size: 'w-12 h-12 md:w-20 md:h-20', 
      top: '30%', left: '5%', 
      delay: 0.2, svgFile: 'svg-3.svg', rotate: '-15deg' 
    },
    { 
      id: 4, 
      size: 'w-9 h-9 md:w-14 md:h-14', 
      top: '35%', right: '10%', 
      delay: 0.3, svgFile: 'svg-4.svg', rotate: '30deg' 
    },
    { 
      id: 5, 
      size: 'w-11 h-11 md:w-18 md:h-18', 
      top: '65%', left: '0%', 
      delay: 0.4, svgFile: 'svg-5.svg', rotate: '-30deg' 
    },
    { 
      id: 6,
      size: 'w-12 h-12 md:w-20 md:h-20',
      top: '65%', right: '0%',
      mobileHidden: true,
      delay: 0.5, svgFile: 'svg-6.svg', rotate: '20deg'
    },
  ]

  const BuiltInSvg = ({ id, className, rotate }: { id: number; className?: string; rotate?: string }) => {
    const colors = [['#3B82F6', '#1E40AF'], ['#10B981', '#047857'], ['#8B5CF6', '#6D28D9'], ['#F59E0B', '#D97706'], ['#EF4444', '#DC2626'], ['#06B6D4', '#0891B2'], ['#EC4899', '#BE185D'], ['#F97316', '#EA580C']]
    const colorIndex = (id - 1) % colors.length
    const [fillColor, strokeColor] = colors[colorIndex]
    const shapes = [
      <circle key="c" cx="50" cy="50" r="40" fill={fillColor} stroke={strokeColor} strokeWidth="3"/>,
      <rect key="r" x="15" y="15" width="70" height="70" rx="10" fill={fillColor} stroke={strokeColor} strokeWidth="3"/>,
      <polygon key="h" points="50,10 85,30 85,70 50,90 15,70 15,30" fill={fillColor} stroke={strokeColor} strokeWidth="3"/>,
      <polygon key="p" points="50,10 80,40 65,80 35,80 20,40" fill={fillColor} stroke={strokeColor} strokeWidth="3"/>,
      <polygon key="d" points="50,10 90,50 50,90 10,50" fill={fillColor} stroke={strokeColor} strokeWidth="3"/>,
      <polygon key="s" points="50,10 61,40 95,40 68,58 79,88 50,70 21,88 32,58 5,40 39,40" fill={fillColor} stroke={strokeColor} strokeWidth="2"/>,
      <polygon key="o" points="30,20 70,20 80,30 80,70 70,80 30,80 20,70 20,30" fill={fillColor} stroke={strokeColor} strokeWidth="3"/>,
      <path key="he" d="M50,85 C60,75 85,50 85,30 C85,15 70,10 60,20 C55,25 50,30 50,30 C50,30 45,25 40,20 C30,10 15,15 15,30 C15,50 40,75 50,85" fill={fillColor} stroke={strokeColor} strokeWidth="3"/>,
    ]
    const shapeIndex = (id - 1) % shapes.length
    
    return (
      <div className={cn("relative", className)} style={{ transform: `rotate(${rotate})` }}>
        <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {shapes[shapeIndex]}
          <text x="50" y="60" textAnchor="middle" fill="white" fontSize="30" fontWeight="bold" fontFamily="Arial, sans-serif">{id}</text>
        </svg>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @media (min-width: 768px) {
          @keyframes floatCustom {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          .animate-float-desktop {
            animation: floatCustom 6s ease-in-out infinite;
            will-change: transform;
          }
        }
      `}</style>

      <div className={cn(
        "w-full flex flex-row justify-center items-center gap-3 py-2 z-10 pointer-events-none",
        "md:absolute md:inset-0 md:h-full md:block md:py-0 md:gap-0 md:overflow-visible"
      )}>
        {floatingAvatarData.map((avatar) => {
          return (
            <div
              key={avatar.id}
              className={cn(
                "transition-all duration-300",
                // ✅ 这里现在安全了，因为 TS 知道 mobileHidden 是 boolean | undefined
                avatar.mobileHidden ? "hidden md:block" : "block",
                "md:absolute" 
              )}
              style={{
                top: avatar.top,
                left: avatar.left,
                right: avatar.right,
              }}
            >
              <div 
                className="md:animate-float-desktop"
                style={{ animationDelay: `${avatar.delay}s` }}
              >
                <div 
                  className={cn(
                    avatar.size, 
                    "aspect-square flex-shrink-0",
                    "md:pointer-events-auto md:transition-transform md:duration-500 md:ease-[cubic-bezier(0.2,0.8,0.2,1)]",
                    "md:hover:!scale-150 md:hover:z-50 md:hover:cursor-pointer"
                  )}
                  style={{ 
                    transform: `rotate(${avatar.rotate})`,
                  }}
                >
                  <div className="w-full h-full border-none shadow-sm md:shadow-xl overflow-hidden rounded-full ring-0 bg-white p-1.5 md:p-2">
                    {avatar.svgFile ? (
                      <img 
                        src={`/images/${avatar.svgFile}`}
                        alt={`Avatar ${avatar.id}`}
                        className="w-full h-full object-contain"
                        style={{ transform: 'none' }}
                        onError={(e) => e.currentTarget.style.display = 'none'}
                      />
                    ) : (
                      <BuiltInSvg id={avatar.id} className="w-full h-full" rotate="0deg" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
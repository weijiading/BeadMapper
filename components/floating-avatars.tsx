'use client'

import React from 'react'

export default function FloatingAvatars() {
  // ✅ 修改：size 字段现在包含响应式类名
  // 格式：'w-[手机尺寸] h-[手机尺寸] md:w-[电脑尺寸] md:h-[电脑尺寸]'
  const floatingAvatarData = [
    { 
      id: 1, 
      // 手机: w-10 (40px), 电脑: w-16 (64px)
      size: 'w-10 h-10 md:w-16 md:h-16', 
      top: '10%', left: '5%', 
      mobileTop: '75%', mobileLeft: '10%', 
      delay: 0, svgFile: 'svg-1.svg', rotate: '0deg' 
    },
    { 
      id: 2, 
      // 手机: w-8 (32px), 电脑: w-12 (48px)
      size: 'w-8 h-8 md:w-12 md:h-12', 
      top: '20%', right: '8%', 
      mobileTop: '78%', mobileLeft: '30%', 
      delay: 0.1, svgFile: 'svg-2.svg', rotate: '45deg' 
    },
    { 
      id: 3, 
      // 手机: w-12 (48px), 电脑: w-20 (80px) -> C位最大的稍微保留一点大小优势
      size: 'w-12 h-12 md:w-20 md:h-20', 
      top: '35%', left: '10%', 
      mobileTop: '72%', mobileLeft: '50%', 
      delay: 0.2, svgFile: 'svg-3.svg', rotate: '-15deg' 
    },
    { 
      id: 4, 
      // 手机: w-9 (36px), 电脑: w-14 (56px)
      size: 'w-9 h-9 md:w-14 md:h-14', 
      top: '40%', right: '12%', 
      mobileTop: '78%', mobileLeft: '70%', 
      delay: 0.3, svgFile: 'svg-4.svg', rotate: '30deg' 
    },
    { 
      id: 5, 
      // 手机: w-11 (44px), 电脑: w-18 (72px)
      size: 'w-11 h-11 md:w-18 md:h-18', 
      top: '55%', left: '15%', 
      mobileTop: '75%', mobileLeft: '90%', 
      delay: 0.4, svgFile: 'svg-5.svg', rotate: '-30deg' 
    },
    // 下面这些在手机端是隐藏的 (mobileHidden: true)，所以只需要写电脑端尺寸即可，
    // 但为了保持格式统一，写上也无妨，反正不会显示。
    { id: 6, size: 'w-12 h-12', top: '60%', right: '10%', mobileHidden: true, delay: 0.5, svgFile: 'svg-6.svg', rotate: '20deg' },
    { id: 7, size: 'w-16 h-16', top: '70%', left: '8%', mobileHidden: true, delay: 0.2, svgFile: 'svg-7.svg', rotate: '-45deg' },
    { id: 8, size: 'w-14 h-14', top: '75%', right: '15%', mobileHidden: true, delay: 0.1, svgFile: 'svg-8.svg', rotate: '15deg' },
  ]

  const BuiltInSvg = ({ id, className = "", rotate = "0deg" }: { id: number; className?: string; rotate?: string }) => {
    // ... BuiltInSvg 的逻辑完全不需要变，为了节省篇幅我省略了中间的SVG代码 ...
    // ... 请保留你原有的 BuiltInSvg 完整代码 ...
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
      <div className={`relative ${className}`} style={{ transform: `rotate(${rotate})` }}>
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
        @keyframes floatCustom {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .floating-layer {
          animation: floatCustom 6s ease-in-out infinite;
          will-change: transform;
        }
        .avatar-hover-effect {
          transition: transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
          transform-origin: center center;
        }
        .avatar-hover-effect:hover {
          transform: scale(1.5) rotate(0deg) !important;
          z-index: 50;
        }
        .avatar-position-wrapper {
          position: absolute;
          top: var(--mobile-top);
          left: var(--mobile-left);
          right: auto;
          transform: translate(-50%, -50%);
        }
        .avatar-position-wrapper[data-mobile-hidden="true"] {
          display: none;
        }
        @media (min-width: 768px) {
          .avatar-position-wrapper {
            top: var(--desktop-top);
            left: var(--desktop-left);
            right: var(--desktop-right);
            transform: none;
            display: block !important;
          }
        }
      `}</style>

      {floatingAvatarData.map((avatar) => {
        const styleVariables = {
          '--mobile-top': avatar.mobileTop || '50%',
          '--mobile-left': avatar.mobileLeft || '50%',
          '--desktop-top': avatar.top,
          '--desktop-left': avatar.left || 'auto',
          '--desktop-right': avatar.right || 'auto',
        } as React.CSSProperties

        return (
          <div
            key={avatar.id}
            className="avatar-position-wrapper pointer-events-none"
            data-mobile-hidden={avatar.mobileHidden}
            style={{
              ...styleVariables,
              zIndex: 10
            }}
          >
            <div 
              className="floating-layer"
              style={{ animationDelay: `${avatar.delay}s` }}
            >
              {/* 
                  ✅ 这里直接使用了 avatar.size
                  因为它现在包含了像 "w-10 h-10 md:w-16 md:h-16" 这样的类名
                  浏览器会自动根据屏幕宽度切换大小
              */}
              <div 
                className={`${avatar.size} aspect-square flex-shrink-0 pointer-events-auto avatar-hover-effect`}
                style={{ 
                  transform: `rotate(${avatar.rotate})`,
                  transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)'
                }}
              >
                <div className="w-full h-full border-none shadow-xl cursor-pointer overflow-hidden rounded-full ring-0 bg-white p-2">
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
    </>
  )
}
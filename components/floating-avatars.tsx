'use client'

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

export default function FloatingAvatars() {
  // 修改：在数据数组中添加 image 字段，指定图片文件名
  const floatingAvatarData = [
    { id: 1, size: 'w-16 h-16', top: '10%', left: '5%', delay: 0, image: 'avatar-1.jpg' },
    { id: 2, size: 'w-12 h-12', top: '20%', right: '8%', delay: 0.1, image: 'avatar-2.jpg' },
    { id: 3, size: 'w-20 h-20', top: '35%', left: '10%', delay: 0.2, image: 'avatar-3.jpg' },
    { id: 4, size: 'w-14 h-14', top: '40%', right: '12%', delay: 0.3, image: 'avatar-4.jpg' },
    { id: 5, size: 'w-18 h-18', top: '55%', left: '15%', delay: 0.4, image: 'avatar-5.jpg' },
    { id: 6, size: 'w-12 h-12', top: '60%', right: '10%', delay: 0.5, image: 'avatar-6.jpg' },
    { id: 7, size: 'w-16 h-16', top: '70%', left: '8%', delay: 0.2, image: 'avatar-7.jpg' },
    { id: 8, size: 'w-14 h-14', top: '75%', right: '15%', delay: 0.1, image: 'avatar-8.jpg' },
  ]

  return (
    <>
      <style>{`
        @keyframes floatCustom {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
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
          transform: scale(1.5);
          z-index: 50;
        }
      `}</style>

      {floatingAvatarData.map((avatar) => (
        <div
          key={avatar.id}
          className="absolute pointer-events-none"
          style={{
            top: avatar.top,
            [avatar.left ? 'left' : 'right']: avatar.left || avatar.right,
            zIndex: 10
          }}
        >
          {/* 第一层：只负责上下漂浮动画 */}
          <div 
            className="floating-layer"
            style={{ animationDelay: `${avatar.delay}s` }}
          >
            {/* 第二层：只负责鼠标悬停缩放，通过 aspect-square 强制锁定正方形 */}
            <div className={`${avatar.size} aspect-square flex-shrink-0 pointer-events-auto avatar-hover-effect`}>
              <Avatar className="w-full h-full border-none shadow-xl cursor-pointer overflow-hidden rounded-full ring-0">
                <AvatarImage
                  src={`/images/${avatar.image}`}
                  alt={`Avatar ${avatar.id}`}
                  className="object-cover w-full h-full"
                />
                <AvatarFallback>AV</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
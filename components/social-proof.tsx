'use client'

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

export default function SocialProof() {
  const avatars = [
    { id: 1, name: 'User 1' },
    { id: 2, name: 'User 2' },
    { id: 3, name: 'User 3' },
    { id: 4, name: 'User 4' },
  ]

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
      {/* Overlapping Avatars */}
      <div className="flex -space-x-3">
        {avatars.map((avatar, index) => (
          <Avatar
            key={avatar.id}
            className="w-12 h-12 border-3 border-white shadow-md hover:z-50 transition-transform hover:scale-110"
            style={{ zIndex: avatars.length - index }}
          >
            <AvatarImage
              src={`https://i.pravatar.cc/150?u=social${avatar.id}`}
              alt={avatar.name}
            />
            <AvatarFallback>{avatar.name[0]}</AvatarFallback>
          </Avatar>
        ))}
      </div>

      {/* Text */}
      <p className="text-sm sm:text-base font-semibold text-black">
        Loved by <span className="font-bold">+23k</span> more people
      </p>
    </div>
  )
}

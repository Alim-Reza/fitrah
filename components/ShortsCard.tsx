'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MoreVertical } from 'lucide-react';

interface ShortsCardProps {
  id: string;
}

export default function ShortsCard({ id }: ShortsCardProps) {
  const thumbnailUrl = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;

  return (
    <Link href={`/watch?v=${id}`} className="block relative">
      <div className="relative w-full aspect-[9/16] bg-gray-900 rounded-lg overflow-hidden hover:scale-[1.02] transition-transform">
        <Image
          src={thumbnailUrl}
          alt="Shorts thumbnail"
          fill
          className="object-cover"
          unoptimized
        />
        
        {/* 3-dot menu */}
        <button 
          className="absolute top-2 right-2 text-white hover:text-gray-300 z-10"
          onClick={(e) => e.preventDefault()}
        >
          <MoreVertical size={20} />
        </button>
        
        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/60 to-transparent p-3 pt-12">
          <h3 className="text-white text-sm font-medium line-clamp-2">
            He didn't expect him to do THAT 😱 #anime
          </h3>
        </div>
      </div>
    </Link>
  );
}

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MoreVertical } from 'lucide-react';

interface VideoCardProps {
  id: string;
}

export default function VideoCard({ id }: VideoCardProps) {
  const thumbnailUrl = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;

  return (
    <div className="w-full mb-4">
      <Link href={`/video/${id}`} className="block">
        {/* Thumbnail with overlay */}
        <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden hover:rounded-none transition-all">
          <Image
            src={thumbnailUrl}
            alt="Video thumbnail"
            fill
            className="object-cover"
            unoptimized
          />
          {/* Duration badge */}
          <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-white text-xs font-semibold">
            12:34
          </div>
        </div>
      </Link>
      
      {/* Video Info */}
      <div className="flex gap-3 mt-3 pr-2">
        {/* Channel Avatar */}
        <div className="flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-gray-700" />
        </div>
        
        {/* Title and metadata */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white text-sm font-medium line-clamp-2 mb-1">
            Video Title - Sample Content for Testing
          </h3>
          <div className="flex flex-col text-gray-400 text-xs">
            <span>Channel Name</span>
            <div className="flex items-center gap-1">
              <span>148K views</span>
              <span>•</span>
              <span>6 days ago</span>
            </div>
          </div>
        </div>
        
        {/* 3-dot menu */}
        <button className="flex-shrink-0 text-white hover:text-gray-300">
          <MoreVertical size={20} />
        </button>
      </div>
    </div>
  );
}

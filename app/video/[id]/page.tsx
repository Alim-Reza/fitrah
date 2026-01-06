'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Header from '@/components/Header';
import { ArrowLeft, ThumbsUp, ThumbsDown, Share2, MoreVertical, Eye } from 'lucide-react';
import { useWatchTracking } from '@/hooks/useWatchTracking';
import { resetConsecutiveShortsCount, setLastVideoType } from '@/lib/firebase/shorts-tracking';

export default function VideoPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.id as string;
  
  // Track watch time
  useWatchTracking({ videoId, type: 'video' });
  
  // Reset consecutive shorts counter when viewing regular video
  useEffect(() => {
    resetConsecutiveShortsCount();
    setLastVideoType('video');
  }, []);

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Header */}
      <Header />

      {/* Video Player Container */}
      <div className="pt-[60px] pb-6 px-0">
        {/* YouTube Embed - Landscape Format */}
        <div className="relative w-full bg-black" style={{ paddingBottom: '56.25%' }}>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1&rel=0`}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ border: 'none' }}
          />
        </div>

        {/* Video Info Section */}
        <div className="px-4 py-4">
          {/* Video Title */}
          <h1 className="text-white text-lg font-bold mb-3">
            Video Title - Educational Content
          </h1>

          {/* Stats and Actions Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4 text-gray-400 text-sm">
              <div className="flex items-center gap-1">
                <Eye size={16} />
                <span>1.2M views</span>
              </div>
              <span>•</span>
              <span>2 days ago</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#272727] text-white rounded-full hover:bg-[#3f3f3f] transition whitespace-nowrap">
              <ThumbsUp size={18} />
              <span className="text-sm">Like</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#272727] text-white rounded-full hover:bg-[#3f3f3f] transition whitespace-nowrap">
              <ThumbsDown size={18} />
              <span className="text-sm">Dislike</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#272727] text-white rounded-full hover:bg-[#3f3f3f] transition whitespace-nowrap">
              <Share2 size={18} />
              <span className="text-sm">Share</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#272727] text-white rounded-full hover:bg-[#3f3f3f] transition whitespace-nowrap">
              <MoreVertical size={18} />
            </button>
          </div>

          {/* Channel Info */}
          <div className="mt-4 p-4 bg-[#272727] rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full"></div>
                <div>
                  <h3 className="text-white font-semibold text-sm">Channel Name</h3>
                  <p className="text-gray-400 text-xs">1.5M subscribers</p>
                </div>
              </div>
              <button className="px-6 py-2 bg-white text-black text-sm font-semibold rounded-full hover:bg-gray-200 transition">
                Subscribe
              </button>
            </div>
            <p className="text-gray-300 text-sm">
              Educational content for learning and growth. Follow for more videos!
            </p>
          </div>

          {/* Description */}
          <div className="mt-4 p-4 bg-[#272727] rounded-lg">
            <h3 className="text-white font-semibold text-sm mb-2">Description</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              This is the video description. It can contain detailed information about the video content,
              links, timestamps, and other relevant information for viewers.
            </p>
          </div>

          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="mt-6 w-full py-3 bg-[#272727] text-white rounded-lg hover:bg-[#3f3f3f] transition flex items-center justify-center gap-2"
          >
            <ArrowLeft size={20} />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

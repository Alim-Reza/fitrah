'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Header from '@/components/Header';
import { ArrowLeft, ThumbsUp, ThumbsDown, Share2, MoreVertical } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { getUserVideoList, VideoItem } from '@/lib/firebase/firestore';

// Default video list for non-authenticated users
const defaultVideoList = [
  { type: "video", id: "qGk6on_CDkg" },
  { type: "shorts", id: "5JN7SZ6NETQ" },
  { type: "shorts", id: "3Kn7bkpA1-c" },
  { type: "video", id: "1MGjcMVEHuU" },
  { type: "video", id: "FknTw9bJsXM" },
  { type: "shorts", id: "5JN7SZ6NETQ" },
  { type: "shorts", id: "3Kn7bkpA1-c" },
  { type: "video", id: "FknTw9bJsXM" },
];

interface ShortVideo {
  id: string;
  type: 'shorts';
}

export default function ShortsPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const initialVideoId = params.id as string;
  
  const [shortsList, setShortsList] = useState<ShortVideo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fetchingVideos, setFetchingVideos] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasScrolledToInitial = useRef(false);

  // Create circular list by tripling the shorts array
  const [circularList, setCircularList] = useState<ShortVideo[]>([]);

  // Fetch user's shorts list
  useEffect(() => {
    async function fetchShorts() {
      setFetchingVideos(true);
      try {
        let videoList: Array<{ type: string; id: string }> = [];

        if (user && !loading) {
          const userVideos = await getUserVideoList(user.uid);
          if (userVideos.length > 0) {
            videoList = userVideos
              .sort((a, b) => a.order - b.order)
              .map(v => ({ type: v.type, id: v.id }));
          } else {
            videoList = defaultVideoList;
          }
        } else if (!loading) {
          videoList = defaultVideoList;
        }

        // Filter only shorts
        const shorts = videoList
          .filter(v => v.type === 'shorts')
          .map(v => ({ id: v.id, type: 'shorts' as const }));

        setShortsList(shorts);

        // Create circular list (3 copies for infinite scroll effect)
        const circular = [...shorts, ...shorts, ...shorts];
        setCircularList(circular);

        // Find initial index in the middle copy
        const initialIdx = shorts.findIndex(s => s.id === initialVideoId);
        const middleCopyStart = shorts.length;
        const targetIndex = initialIdx >= 0 ? middleCopyStart + initialIdx : middleCopyStart;
        setCurrentIndex(targetIndex);

      } catch (error) {
        console.error('Error fetching shorts:', error);
        const defaultShorts = defaultVideoList
          .filter(v => v.type === 'shorts')
          .map(v => ({ id: v.id, type: 'shorts' as const }));
        setShortsList(defaultShorts);
        const circular = [...defaultShorts, ...defaultShorts, ...defaultShorts];
        setCircularList(circular);
      } finally {
        setFetchingVideos(false);
      }
    }

    fetchShorts();
  }, [user, loading, initialVideoId]);

  // Scroll to initial video after list is loaded
  useEffect(() => {
    if (!fetchingVideos && circularList.length > 0 && containerRef.current && !hasScrolledToInitial.current) {
      // Set scroll position immediately without animation
      const windowHeight = window.innerHeight - 60;
      const scrollTo = currentIndex * windowHeight;
      
      // Disable smooth scrolling temporarily
      if (containerRef.current) {
        containerRef.current.style.scrollBehavior = 'auto';
        containerRef.current.scrollTop = scrollTo;
        hasScrolledToInitial.current = true;
        
        // Re-enable smooth scrolling after a brief delay
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.style.scrollBehavior = 'smooth';
          }
        }, 100);
      }
    }
  }, [fetchingVideos, circularList.length, currentIndex]);

  // Handle scroll snap and circular scrolling
  useEffect(() => {
    if (!containerRef.current || circularList.length === 0) return;

    const handleScroll = () => {
      if (!containerRef.current || shortsList.length === 0) return;
      const scrollTop = containerRef.current.scrollTop;
      const windowHeight = window.innerHeight - 60; // minus header
      const newIndex = Math.round(scrollTop / windowHeight);
      
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < circularList.length) {
        setCurrentIndex(newIndex);

        // Handle circular scrolling - jump to middle copy when reaching edges
        const listLength = shortsList.length;
        const middleCopyStart = listLength;
        const middleCopyEnd = listLength * 2;

        if (newIndex < middleCopyStart) {
          // Scrolled past top, jump to equivalent position in middle copy
          const offset = middleCopyStart - newIndex;
          const targetIndex = middleCopyEnd - offset;
          setTimeout(() => {
            if (containerRef.current) {
              containerRef.current.scrollTop = targetIndex * windowHeight;
              setCurrentIndex(targetIndex);
            }
          }, 50);
        } else if (newIndex >= middleCopyEnd) {
          // Scrolled past bottom, jump to equivalent position in middle copy
          const offset = newIndex - middleCopyEnd;
          const targetIndex = middleCopyStart + offset;
          setTimeout(() => {
            if (containerRef.current) {
              containerRef.current.scrollTop = targetIndex * windowHeight;
              setCurrentIndex(targetIndex);
            }
          }, 50);
        }
      }
    };

    const container = containerRef.current;
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [currentIndex, circularList.length, shortsList.length]);

  if (fetchingVideos) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">Loading shorts...</div>
      </div>
    );
  }

  if (shortsList.length === 0) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <div className="text-white text-lg">No shorts available</div>
        <button
          onClick={() => router.back()}
          className="px-6 py-3 bg-white text-black rounded-full hover:bg-gray-200 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black overflow-hidden">
      {/* Header - Always visible */}
      <Header />

      {/* Back Button - Fixed overlay */}
      <button
        onClick={() => router.back()}
        className="fixed top-[76px] left-4 z-50 w-10 h-10 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition"
      >
        <ArrowLeft size={20} />
      </button>

      {/* Scrollable Shorts Container */}
      <div
        ref={containerRef}
        className="h-[calc(100vh-60px)] mt-[60px] overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
      >
        {circularList.map((short, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={`${short.id}-${index}`}
              className="relative h-[calc(100vh-60px)] w-full snap-start snap-always flex items-center justify-center"
            >
              {/* YouTube Embed - Vertical Format */}
              <div className="relative w-full h-full max-w-[500px] mx-auto">
                <iframe
                  src={`https://www.youtube.com/embed/${short.id}?autoplay=${isActive ? 1 : 0}&controls=1&modestbranding=1&rel=0&playsinline=1&loop=1&playlist=${short.id}`}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ border: 'none' }}
                />

                {/* Action Buttons (Right Side) */}
                <div className="absolute right-4 bottom-20 z-10 flex flex-col gap-6">
                  <button className="flex flex-col items-center gap-1 text-white">
                    <div className="w-12 h-12 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center transition">
                      <ThumbsUp size={24} />
                    </div>
                    <span className="text-xs">Like</span>
                  </button>

                  <button className="flex flex-col items-center gap-1 text-white">
                    <div className="w-12 h-12 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center transition">
                      <ThumbsDown size={24} />
                    </div>
                    <span className="text-xs">Dislike</span>
                  </button>

                  <button className="flex flex-col items-center gap-1 text-white">
                    <div className="w-12 h-12 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center transition">
                      <Share2 size={24} />
                    </div>
                    <span className="text-xs">Share</span>
                  </button>

                  <button className="flex flex-col items-center gap-1 text-white">
                    <div className="w-12 h-12 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center transition">
                      <MoreVertical size={24} />
                    </div>
                    <span className="text-xs">More</span>
                  </button>
                </div>

                {/* Video Info (Bottom Overlay) */}
                <div className="absolute bottom-4 left-4 right-20 z-10 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full"></div>
                    <span className="font-semibold text-sm">Channel Name</span>
                    <button className="ml-2 px-4 py-1 bg-white text-black text-xs font-semibold rounded-full hover:bg-gray-200 transition">
                      Subscribe
                    </button>
                  </div>
                  <p className="text-sm line-clamp-2 mb-1">
                    Short #{(index % shortsList.length) + 1} of {shortsList.length}
                  </p>
                  <p className="text-xs text-gray-400">#shorts #viral</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

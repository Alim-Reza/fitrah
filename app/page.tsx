'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import VideoCard from '@/components/VideoCard';
import ShortsCard from '@/components/ShortsCard';
import { Video, MoreVertical } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { getUserVideoList, VideoItem } from '@/lib/firebase/firestore';

// Default video list for non-authenticated users
const defaultVideoList = [
  { type: "video", id: "m_tjxz4yS_U" },
  { type: "video", id: "1MGjcMVEHuU" },
  { type: "shorts", id: "xqupg9XVQKM" },
  { type: "shorts", id: "Po098TRdOn4" },
  { type: "video", id: "fdGWRq1dVBA" },
  { type: "video", id: "zvY-EPgYB4Y" },
  { type: "shorts", id: "kt4lFNVV8l8" },
  { type: "shorts", id: "0uYqRviBnjY" },
  { type: "video", id: "FSwy85bAJE0" },
  { type: "shorts", id: "tUobhHz4ziE" },
];

export default function Home() {
  const { user, loading } = useAuth();
  const [videoList, setVideoList] = useState<Array<{ type: string; id: string }>>(defaultVideoList);
  const [fetchingVideos, setFetchingVideos] = useState(false);

  useEffect(() => {
    async function fetchUserVideos() {
      if (user && !loading) {
        setFetchingVideos(true);
        try {
          const userVideos = await getUserVideoList(user.uid);
          
          if (userVideos.length > 0) {
            // Convert VideoItem[] to the format expected by the component
            const formattedVideos = userVideos
              .sort((a, b) => a.order - b.order)
              .map(v => ({ type: v.type, id: v.id }));
            setVideoList(formattedVideos);
          } else {
            // If user has no videos, show default list
            setVideoList(defaultVideoList);
          }
        } catch (error) {
          console.error('Error fetching user videos:', error);
          setVideoList(defaultVideoList);
        } finally {
          setFetchingVideos(false);
        }
      } else if (!user && !loading) {
        // Not logged in, show default list
        setVideoList(defaultVideoList);
      }
    }

    fetchUserVideos();
  }, [user, loading]);

  // Group items by type for section rendering
  
  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <Header />
      
      <main className="pt-[120px] pb-24 px-4 max-w-7xl mx-auto">
        {fetchingVideos ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-white text-lg">Loading your videos...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Group consecutive shorts together */}
            {(() => {
              const groupedItems: JSX.Element[] = [];
              let i = 0;
              
              while (i < videoList.length) {
                const item = videoList[i];
                
                if (item.type === "video") {
                  // Regular video
                  groupedItems.push(
                    <div key={`video-${i}`}>
                      <VideoCard id={item.id} />
                    </div>
                  );
                  i++;
                } else if (item.type === "shorts") {
                  // Collect consecutive shorts
                  const shorts: Array<{ type: string; id: string }> = [];
                  let shortsStartIndex = i;
                  
                  while (i < videoList.length && videoList[i].type === "shorts") {
                    shorts.push(videoList[i]);
                    i++;
                  }
                  
                  // Add shorts header if we have any shorts
                  if (shorts.length > 0) {
                    groupedItems.push(
                      <div key={`shorts-section-${shortsStartIndex}`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Video className="text-red-600" size={24} fill="currentColor" />
                            <h2 className="text-white text-lg font-semibold">Shorts</h2>
                          </div>
                          <button className="text-white hover:text-gray-300">
                            <MoreVertical size={24} />
                          </button>
                        </div>
                        
                        {/* Render shorts in pairs (2 per row) */}
                        <div className="space-y-2">
                          {Array.from({ length: Math.ceil(shorts.length / 2) }, (_, rowIndex) => {
                            const startIdx = rowIndex * 2;
                            const pair = shorts.slice(startIdx, startIdx + 2);
                            
                            return (
                              <div key={`shorts-row-${rowIndex}`} className="grid grid-cols-2 gap-2">
                                <ShortsCard id={pair[0].id} />
                                {pair[1] && <ShortsCard id={pair[1].id} />}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                }
              }
              
              return groupedItems;
            })()}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}


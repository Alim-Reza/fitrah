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
  {
    type: "video",
    id: "FknTw9bJsXM",
  },
  {
    type: "shorts",
    id: "5JN7SZ6NETQ",
  },
  {
    type: "shorts",
    id: "3Kn7bkpA1-c",
  },
  {
    type: "video",
    id: "FknTw9bJsXM",
  },
  {
    type: "video",
    id: "FknTw9bJsXM",
  },
  {
    type: "shorts",
    id: "5JN7SZ6NETQ",
  },
  {
    type: "shorts",
    id: "3Kn7bkpA1-c",
  },
  {
    type: "video",
    id: "FknTw9bJsXM",
  },
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
  let currentSection = '';
  
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
            {videoList.map((item, index) => {
              const needsShortsHeader = item.type === "shorts" && currentSection !== "shorts";
              if (item.type === "shorts") currentSection = "shorts";
              else currentSection = "video";
              
              if (item.type === "video") {
                return (
                  <div key={index}>
                    <VideoCard id={item.id} />
                  </div>
                );
              } else {
                // For shorts, check if next item is also shorts to group them
                const nextItem = videoList[index + 1];
                const isNextShorts = nextItem && nextItem.type === "shorts";
                
                // Skip if this is the second short in a pair
                if (index > 0 && videoList[index - 1].type === "shorts") {
                  return null;
                }
                
                return (
                  <div key={index}>
                    {needsShortsHeader && (
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Video className="text-red-600" size={24} fill="currentColor" />
                          <h2 className="text-white text-lg font-semibold">Shorts</h2>
                        </div>
                        <button className="text-white hover:text-gray-300">
                          <MoreVertical size={24} />
                        </button>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <ShortsCard id={item.id} />
                      {isNextShorts && <ShortsCard id={nextItem.id} />}
                    </div>
                  </div>
                );
              }
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}


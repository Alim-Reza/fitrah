import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import VideoCard from '@/components/VideoCard';
import ShortsCard from '@/components/ShortsCard';
import { Video, MoreVertical } from 'lucide-react';

const videoList = [
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
  // Group items by type for section rendering
  let currentSection = '';
  
  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <Header />
      
      <main className="pt-[120px] pb-24 px-4 max-w-7xl mx-auto">
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
      </main>

      <BottomNav />
    </div>
  );
}


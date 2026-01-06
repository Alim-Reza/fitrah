'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { getWatchHistory, WatchHistoryItem } from '@/lib/firebase/watch-history';
import { Clock, Video, Film } from 'lucide-react';

export default function HistoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadHistory();
    }
  }, [user, loading, router]);

  async function loadHistory() {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const watchHistory = await getWatchHistory(user.uid, 100);
      setHistory(watchHistory);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  function formatDate(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  }

  function handleVideoClick(item: WatchHistoryItem) {
    if (item.type === 'shorts') {
      router.push(`/shorts/${item.videoId}`);
    } else {
      router.push(`/video/${item.videoId}`);
    }
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-white text-lg">Loading history...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] pb-20">
      <Header />
      
      <div className="pt-[60px] px-4">
        {/* Page Title */}
        <div className="mb-6 mt-4">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Clock size={28} />
            Watch History
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {history.length} video{history.length !== 1 ? 's' : ''} watched
          </p>
        </div>

        {/* History List */}
        {history.length === 0 ? (
          <div className="text-center py-12">
            <Clock size={48} className="mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 text-lg">No watch history yet</p>
            <p className="text-gray-500 text-sm mt-2">
              Videos you watch will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item, index) => (
              <div
                key={`${item.videoId}-${index}`}
                onClick={() => handleVideoClick(item)}
                className="bg-[#272727] rounded-lg p-4 hover:bg-[#3f3f3f] transition cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  {/* Thumbnail placeholder */}
                  <div className="relative flex-shrink-0 w-32 h-20 bg-[#0f0f0f] rounded-lg overflow-hidden">
                    <img
                      src={`https://img.youtube.com/vi/${item.videoId}/mqdefault.jpg`}
                      alt="Video thumbnail"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 text-white text-xs rounded">
                      {formatDuration(item.watchDuration)}
                    </div>
                  </div>

                  {/* Video Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-1">
                      {item.type === 'shorts' ? (
                        <Film size={16} className="text-red-500 flex-shrink-0 mt-1" />
                      ) : (
                        <Video size={16} className="text-blue-500 flex-shrink-0 mt-1" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium line-clamp-2">
                          {item.title || `${item.type === 'shorts' ? 'Short' : 'Video'} - ${item.videoId}`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-400 text-xs mt-2">
                      <span>{formatDate(item.watchedAt)}</span>
                      <span>•</span>
                      <span>Watched {formatDuration(item.watchDuration)}</span>
                      {item.completed && (
                        <>
                          <span>•</span>
                          <span className="text-green-500">Completed</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

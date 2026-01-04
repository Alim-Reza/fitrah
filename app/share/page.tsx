'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { addVideoToUserList } from '@/lib/firebase/firestore';
import { extractYouTubeVideoId } from '@/lib/youtube-utils';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function SharePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing shared video...');
  const [videoType, setVideoType] = useState<'video' | 'shorts'>('video');

  useEffect(() => {
    async function handleSharedContent() {
      // Wait for auth to load
      if (authLoading) return;

      // Check if user is logged in
      if (!user) {
        setStatus('error');
        setMessage('Please log in to add videos');
        setTimeout(() => {
          router.push('/login?redirect=/share?' + searchParams.toString());
        }, 2000);
        return;
      }

      // Get shared data from URL parameters
      const title = searchParams.get('title') || '';
      const text = searchParams.get('text') || '';
      const url = searchParams.get('url') || '';

      // Try to find YouTube URL from any of the parameters
      const sharedContent = `${title} ${text} ${url}`;
      
      // Extract YouTube video ID
      const videoId = extractYouTubeVideoId(sharedContent);

      if (!videoId) {
        setStatus('error');
        setMessage('No valid YouTube video found in shared content');
        setTimeout(() => {
          router.push('/add-video');
        }, 2000);
        return;
      }

      // Detect if it's a shorts URL
      const isShorts = sharedContent.toLowerCase().includes('/shorts/');
      const detectedType = isShorts ? 'shorts' : 'video';
      setVideoType(detectedType);

      try {
        // Add video to user's list
        await addVideoToUserList(user.uid, {
          id: videoId,
          type: detectedType,
        });

        setStatus('success');
        setMessage(`${detectedType === 'shorts' ? 'Short' : 'Video'} added successfully!`);
        
        // Redirect to home after 1.5 seconds
        setTimeout(() => {
          router.push('/');
        }, 1500);
      } catch (error: any) {
        console.error('Error adding video:', error);
        setStatus('error');
        setMessage(error.message || 'Failed to add video');
        
        // Redirect to add-video page after 2 seconds
        setTimeout(() => {
          router.push('/add-video');
        }, 2000);
      }
    }

    handleSharedContent();
  }, [user, authLoading, searchParams, router]);

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          {status === 'processing' && (
            <Loader2 className="text-white animate-spin" size={64} />
          )}
          {status === 'success' && (
            <CheckCircle2 className="text-green-500" size={64} />
          )}
          {status === 'error' && (
            <XCircle className="text-red-500" size={64} />
          )}
        </div>

        {/* Message */}
        <h1 className="text-white text-2xl font-bold mb-2">
          {status === 'processing' && 'Processing...'}
          {status === 'success' && 'Success!'}
          {status === 'error' && 'Oops!'}
        </h1>
        <p className="text-gray-400 text-lg">{message}</p>

        {/* Additional Info */}
        {status === 'success' && (
          <div className="mt-4 text-sm text-gray-500">
            Type: {videoType === 'shorts' ? 'Shorts' : 'Full Video'}
          </div>
        )}

        {/* Manual redirect button for errors */}
        {status === 'error' && (
          <button
            onClick={() => router.push('/')}
            className="mt-6 px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition"
          >
            Go to Home
          </button>
        )}
      </div>
    </div>
  );
}

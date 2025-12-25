'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { addVideoToUserList } from '@/lib/firebase/firestore';
import { extractYouTubeVideoId } from '@/lib/youtube-utils';
import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';

export default function AddVideoPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoType, setVideoType] = useState<'video' | 'shorts'>('video');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Redirect to login if not authenticated
  if (!loading && !user) {
    router.push('/login');
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!youtubeUrl.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    const videoId = extractYouTubeVideoId(youtubeUrl);

    if (!videoId) {
      setError('Invalid YouTube URL. Please enter a valid YouTube link.');
      return;
    }

    if (!user) {
      setError('You must be logged in to add videos');
      return;
    }

    setSubmitting(true);

    try {
      await addVideoToUserList(user.uid, {
        id: videoId,
        type: videoType,
      });

      // Success - redirect to home
      router.push('/');
    } catch (error: any) {
      setError(error.message || 'Failed to add video. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] pt-6 pb-24 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="text-white hover:text-gray-300 transition"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-white text-2xl font-bold">Add Video</h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* YouTube URL Input */}
          <div>
            <label htmlFor="youtube-url" className="block text-sm font-medium text-gray-300 mb-2">
              YouTube URL
            </label>
            <input
              id="youtube-url"
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full px-4 py-3 bg-[#272727] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
              disabled={submitting}
            />
            <p className="text-gray-500 text-xs mt-2">
              Supports: youtube.com/watch, youtu.be, youtube.com/shorts
            </p>
          </div>

          {/* Video Type Radio Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Video Type
            </label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="video-type"
                  value="video"
                  checked={videoType === 'video'}
                  onChange={(e) => setVideoType('video')}
                  className="w-5 h-5 text-white bg-[#272727] border-gray-600 focus:ring-2 focus:ring-white"
                  disabled={submitting}
                />
                <div>
                  <div className="text-white font-medium">Full Video</div>
                  <div className="text-gray-500 text-xs">Landscape format, full width display</div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="video-type"
                  value="shorts"
                  checked={videoType === 'shorts'}
                  onChange={(e) => setVideoType('shorts')}
                  className="w-5 h-5 text-white bg-[#272727] border-gray-600 focus:ring-2 focus:ring-white"
                  disabled={submitting}
                />
                <div>
                  <div className="text-white font-medium">Shorts</div>
                  <div className="text-gray-500 text-xs">Vertical format, half width display</div>
                </div>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              'Adding...'
            ) : (
              <>
                <Plus size={20} />
                Add Video
              </>
            )}
          </button>
        </form>

        {/* Help Text */}
        <div className="mt-8 p-4 bg-[#272727] rounded-lg">
          <h3 className="text-white font-medium mb-2">How to use:</h3>
          <ol className="text-gray-400 text-sm space-y-1 list-decimal list-inside">
            <li>Copy a YouTube video or shorts URL</li>
            <li>Paste it in the URL field above</li>
            <li>Select the video type (Full Video or Shorts)</li>
            <li>Click "Add Video" to save to your list</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

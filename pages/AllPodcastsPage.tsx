

import React, { useState, useEffect, useCallback } from 'react';
import { BlogPost } from '../types';
import * as blogService from '../services/blogService';
import BlogPostCard from '../components/Blog/BlogPostCard';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { useNotification } from '../contexts/NotificationContext';
import { SpeakerWaveIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const AllPodcastsPage: React.FC = () => {
  const [podcastPosts, setPodcastPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useNotification();

  const fetchAllPodcasts = useCallback(async () => {
    setLoading(true);
    try {
      const posts = await blogService.fetchBlogs();
      const publishedPodcasts = posts
        .filter(p => p.status === 'published' && p.postType === 'podcast')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPodcastPosts(publishedPodcasts);
    } catch (error) {
      console.error("Failed to fetch all podcast posts:", error);
      addToast({ message: 'Could not load podcasts. Please try again later.', type: 'error' });
    }
    setLoading(false);
  }, [addToast]);

  useEffect(() => {
    fetchAllPodcasts();
  }, [fetchAllPodcasts]);

  const handleRefresh = () => {
    addToast({ message: 'Refreshing podcasts...', type: 'info' });
    fetchAllPodcasts();
  }

  if (loading) {
    return <LoadingSpinner message="Loading all podcasts..." className="py-20 min-h-[calc(100vh-20rem)]" />;
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-center pb-6 border-b border-brand-border dark:border-brand-border-dark">
        <div className="flex items-center mb-3 sm:mb-0">
          <SpeakerWaveIcon className="h-9 w-9 text-purple-500 dark:text-purple-400 mr-3" />
          <h1 className="text-3xl font-bold text-brand-text dark:text-brand-text-dark">
            All Podcasts
          </h1>
        </div>
        <button 
            onClick={handleRefresh}
            className="text-purple-500 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold py-1.5 px-3 rounded-md hover:bg-purple-500/10 dark:hover:bg-purple-500/10 transition-colors flex items-center text-sm"
        >
            <ArrowPathIcon className="h-4 w-4 mr-1.5"/>
            Refresh Podcasts
        </button>
      </header>

      {podcastPosts.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {podcastPosts.map(post => (
            <BlogPostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p className="text-brand-text-muted dark:text-brand-text-muted-dark text-center py-12 text-lg bg-brand-surface dark:bg-brand-surface-dark rounded-lg shadow-sm border border-brand-border dark:border-brand-border-dark">
          No podcasts have been published yet. Check back soon!
        </p>
      )}
    </div>
  );
};

export default AllPodcastsPage;
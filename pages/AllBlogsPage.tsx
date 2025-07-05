



import React, { useState, useEffect, useCallback } from 'react';
import { BlogPost } from '../types';
import * as blogService from '../services/blogService';
import BlogPostCard from '../components/Blog/BlogPostCard';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { useNotification } from '../contexts/NotificationContext';
import { BookOpenIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const AllBlogsPage: React.FC = () => {
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useNotification();

  const fetchAllBlogPosts = useCallback(async () => {
    setLoading(true);
    try {
      const posts = await blogService.fetchBlogs();
      const publishedPosts = posts
        .filter(p => p.status === 'published')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setAllPosts(publishedPosts);
    } catch (error) {
      console.error("Failed to fetch all blog posts:", error);
      addToast({ message: 'Could not load blog posts. Please try again later.', type: 'error' });
    }
    setLoading(false);
  }, [addToast]);

  useEffect(() => {
    fetchAllBlogPosts();
  }, [fetchAllBlogPosts]);

  const handleRefresh = () => {
    addToast({ message: 'Refreshing blog posts...', type: 'info' });
    fetchAllBlogPosts();
  }

  if (loading) {
    return <LoadingSpinner message="Loading all blog posts..." className="py-20 min-h-[calc(100vh-20rem)]" />;
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-center pb-6 border-b border-brand-border dark:border-brand-border-dark">
        <div className="flex items-center mb-3 sm:mb-0">
          <BookOpenIcon className="h-9 w-9 text-brand-accent dark:text-brand-accent-dark mr-3" />
          <h1 className="text-3xl font-bold text-brand-text dark:text-brand-text-dark">
            All Blog Posts
          </h1>
        </div>
        <button 
            onClick={handleRefresh}
            className="text-brand-accent dark:text-brand-accent-dark hover:text-brand-accent/80 dark:hover:text-brand-accent-dark/80 font-semibold py-1.5 px-3 rounded-md hover:bg-brand-accent/10 dark:hover:bg-brand-accent-dark/10 transition-colors flex items-center text-sm"
        >
            <ArrowPathIcon className="h-4 w-4 mr-1.5"/>
            Refresh Posts
        </button>
      </header>

      {allPosts.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {allPosts.map(post => (
            <BlogPostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p className="text-brand-text-muted dark:text-brand-text-muted-dark text-center py-12 text-lg bg-brand-surface dark:bg-brand-surface-dark rounded-lg shadow-sm border border-brand-border dark:border-brand-border-dark">
          No blog posts have been published yet. Check back soon!
        </p>
      )}
    </div>
  );
};

export default AllBlogsPage;
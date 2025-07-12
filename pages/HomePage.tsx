


import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { BlogPost } from '../types';
import * as blogService from '../services/blogService';
import BlogPostCard from '../components/Blog/BlogPostCard';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { useNotification } from '../contexts/NotificationContext';
import { ArrowPathIcon, FireIcon, NewspaperIcon, SpeakerWaveIcon, TagIcon } from '@heroicons/react/24/outline';
import { APP_NAME } from '../constants';
import FeaturedCategories from '../components/Home/FeaturedCategories';
import Button from '../components/Common/Button';
import { updatePageMeta, removeJSONLD, setSiteDefaults } from '../utils/seoUtils';

const POSTS_PER_SECTION = 6; 

const HomePage: React.FC = () => {
  const [allPublishedPosts, setAllPublishedPosts] = useState<BlogPost[]>([]);
  const [popularPosts, setPopularPosts] = useState<BlogPost[]>([]);
  const [latestPodcasts, setLatestPodcasts] = useState<BlogPost[]>([]);
  const [latestArticles, setLatestArticles] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useNotification();
  const navigate = ReactRouterDOM.useNavigate();

  useEffect(() => {
    setSiteDefaults();
    updatePageMeta({
      title: `${APP_NAME} - Your Modern Blogging Platform`,
      description: `Discover articles on technology, writing, and more on ${APP_NAME}. AI-powered content creation and a vibrant community.`,
      url: window.location.origin + window.location.pathname,
    });
     return () => {
        removeJSONLD();
    };
  }, []);

  const fetchBlogData = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedAllPostsRaw = await blogService.fetchBlogs();
      const publishedPosts = fetchedAllPostsRaw
        .filter(p => p.status === 'published')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setAllPublishedPosts(publishedPosts);
      
      // Popular Posts (by reactions)
      const getTotalReactions = (post: BlogPost) => Object.values(post.reactions || {}).reduce((sum, users) => sum + (users?.length || 0), 0);
      const sortedByLikes = [...publishedPosts].sort((a,b) => getTotalReactions(b) - getTotalReactions(a));
      const popular = sortedByLikes.slice(0, 3);
      setPopularPosts(popular);

      const popularIds = new Set(popular.map(p => p.id));
      const remainingPosts = publishedPosts.filter(p => !popularIds.has(p.id));

      // Latest Podcasts
      const podcasts = remainingPosts.filter(p => p.postType === 'podcast').slice(0, 3);
      setLatestPodcasts(podcasts);
      
      // Latest Articles (filter out podcasts already shown)
      const podcastIds = new Set(podcasts.map(p => p.id));
      const articles = remainingPosts.filter(p => p.postType !== 'podcast' && !podcastIds.has(p.id)).slice(0, POSTS_PER_SECTION);
      setLatestArticles(articles);

    } catch (error) {
      console.error("Failed to fetch blog data:", error);
      addToast({ message: 'Could not load blog posts. Please try again later.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchBlogData().catch(error => {
      console.error('Failed to fetch blog data:', error);
      addToast({ message: 'Failed to load blog posts. Please try again later.', type: 'error' });
    });
  }, [fetchBlogData, addToast]);
    const getTotalReactions = (post: BlogPost) => Object.values(post.reactions || {}).reduce((sum, users) => sum + (users?.length || 0), 0);
    const sortedByLikes = [...allPublishedPosts].sort((a,b) => getTotalReactions(b) - getTotalReactions(a));
    const popular = sortedByLikes.slice(0, 3);
    setPopularPosts(popular);

    const popularIds = new Set(popular.map(p => p.id));
    const remainingPosts = allPublishedPosts.filter(p => !popularIds.has(p.id));

    // Latest Podcasts
    const podcasts = remainingPosts.filter(p => p.postType === 'podcast').slice(0, 3);
    setLatestPodcasts(podcasts);
    
    // Latest Articles (filter out podcasts already shown)
    const podcastIds = new Set(podcasts.map(p => p.id));
    const articles = remainingPosts.filter(p => p.postType !== 'podcast' && !podcastIds.has(p.id)).slice(0, POSTS_PER_SECTION);
    setLatestArticles(articles);

  }, [allPublishedPosts, loading]);

  const handleRefresh = () => {
    addToast({ message: 'Refreshing blog posts...', type: 'info' });
    fetchBlogData();
  };

  if (loading && allPublishedPosts.length === 0) { 
    return <LoadingSpinner message={"Loading latest articles..."} className="py-20 min-h-[calc(100vh-20rem)]" />;
  }

  const HeroSection: React.FC = () => (
    <section className="text-center py-20 md:py-28">
      <h1 className="text-4xl md:text-6xl font-display font-extrabold text-brand-text dark:text-brand-text-dark mb-4">
        A World of Ideas Awaits.
      </h1>
      <p className="text-lg md:text-xl text-brand-text-muted dark:text-brand-text-muted-dark max-w-2xl mx-auto mb-8">
        Dive into a curated collection of articles, podcasts, and insights from our team of expert creators.
      </p>
      <div className="flex justify-center items-center gap-4">
        <Button size="lg" variant="primary" onClick={() => navigate('/blogs')}>Explore Articles</Button>
        <Button size="lg" variant="secondary" onClick={() => navigate('/signup')}>Get Started</Button>
      </div>
    </section>
  );

  return (
    <div className="space-y-16 md:space-y-20">
      <HeroSection />
      
      <FeaturedCategories />

      {popularPosts.length > 0 && (
         <section>
            <div className="flex justify-between items-center mb-6 md:mb-8">
                <h2 className="text-2xl md:text-3xl font-display font-bold text-brand-text dark:text-brand-text-dark flex items-center">
                    <FireIcon className="h-7 w-7 text-brand-highlight mr-2.5" /> Popular This Week
                </h2>
            </div>
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {popularPosts.map(post => (
                    <BlogPostCard key={post.id} post={post} />
                ))}
            </div>
         </section>
      )}

      {latestPodcasts.length > 0 && (
         <section>
            <div className="flex justify-between items-center mb-6 md:mb-8">
                <h2 className="text-2xl md:text-3xl font-display font-bold text-brand-text dark:text-brand-text-dark flex items-center">
                    <SpeakerWaveIcon className="h-7 w-7 text-purple-500 mr-2.5" /> Latest Podcasts
                </h2>
                <Button variant="ghost" size="sm" onClick={() => navigate('/podcasts')}>View All</Button>
            </div>
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {latestPodcasts.map(post => (
                    <BlogPostCard key={post.id} post={post} />
                ))}
            </div>
         </section>
      )}

      <section>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 md:mb-8">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-brand-text dark:text-brand-text-dark flex items-center mb-3 sm:mb-0">
                <NewspaperIcon className="h-8 w-8 text-brand-accent dark:text-brand-accent-dark mr-3" />
                Latest Articles
            </h2>
             <button 
                onClick={handleRefresh}
                className="text-brand-accent dark:text-brand-accent-dark hover:text-brand-accent/80 dark:hover:text-brand-accent-dark/80 font-semibold py-1.5 px-3 rounded-md hover:bg-brand-accent/10 dark:hover:bg-brand-accent-dark/10 transition-colors flex items-center text-sm self-start sm:self-center"
                aria-label="Refresh posts"
            >
                <ArrowPathIcon className="h-4 w-4 mr-1.5"/>
                Refresh
            </button>
        </div>
        
        {latestArticles.length > 0 ? (
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {latestArticles.map(post => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          !loading && ( 
            <div className="text-brand-text-muted dark:text-brand-text-muted-dark text-center py-12 text-lg bg-brand-surface dark:bg-brand-surface-dark rounded-lg shadow-md border border-brand-border dark:border-brand-border-dark">
              <NewspaperIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p>No new articles to display at the moment.</p>
            </div>
          )
        )}
        
        <div className="mt-10 text-center">
            <Button onClick={() => navigate('/blogs')} variant="primary" size="md" className="!text-base">
                View All Articles
            </Button>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
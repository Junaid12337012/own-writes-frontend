import React, { useState, useEffect, useCallback } from 'react';
import { User, BlogPost } from '../../types';
import { apiService } from '../../services/mockApiService';
import LoadingSpinner from '../Common/LoadingSpinner';
import BlogPostCard from './BlogPostCard';
import { useNotification } from '../../contexts/NotificationContext';
import { DEFAULT_PROFILE_PICTURE, APP_NAME } from '../../constants';
import { ArrowUturnLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import Button from '../Common/Button';
import { updatePageMeta, injectJSONLD, removeJSONLD } from '../../utils/seoUtils';
import { useAuth } from '../../contexts/AuthContext';

interface AuthorProfileProps {
  authorId: string;
}

const AuthorProfile: React.FC<AuthorProfileProps> = ({ authorId }) => {
  const [author, setAuthor] = useState<User | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useNotification();
  const navigate = useNavigate();
  const { user, followAuthor, unfollowAuthor } = useAuth();
  
  const isFollowing = user?.following.includes(authorId) ?? false;
  const isOwnProfile = user?.id === authorId;


  useEffect(() => {
    if (author) {
      const pageUrl = `${window.location.origin}/#/author/${author.id}`;
      updatePageMeta({
        title: `Posts by ${author.username}`,
        description: author.bio || `Read articles written by ${author.username} on ${APP_NAME}.`,
        imageUrl: author.profilePictureUrl || DEFAULT_PROFILE_PICTURE,
        url: pageUrl,
        author: author.username,
      });
      injectJSONLD({
        "@context": "https://schema.org",
        "@type": "Person",
        "name": author.username,
        "url": pageUrl,
        "image": author.profilePictureUrl || DEFAULT_PROFILE_PICTURE,
        "description": author.bio || `Author on ${APP_NAME}`,
        // "sameAs": [ // Add links to social profiles if available
        //   "https://twitter.com/authorhandle",
        //   "https://linkedin.com/in/authorprofile"
        // ]
      });
    }
    return () => {
        removeJSONLD();
    };
  }, [author]);

  const fetchAuthorData = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedAuthor = await apiService.getUserById(authorId);
      if (fetchedAuthor) {
        setAuthor(fetchedAuthor);
        const authorPosts = await apiService.getBlogsByAuthor(authorId);
        setPosts(authorPosts.filter(p => p.status === 'published'));
      } else {
        addToast({ message: 'Author not found.', type: 'error' });
        // navigate('/404'); 
      }
    } catch (error) {
      console.error("Failed to fetch author data:", error);
      addToast({ message: 'Could not load author profile.', type: 'error' });
    }
    setLoading(false);
  }, [authorId, addToast]);

  useEffect(() => {
    fetchAuthorData();
  }, [fetchAuthorData]);

  const handleFollowToggle = () => {
      if (!user) {
          addToast({ message: 'Please log in to follow authors.', type: 'info' });
          navigate('/login');
          return;
      }
      if (isFollowing) {
          unfollowAuthor(authorId);
      } else {
          followAuthor(authorId);
      }
  }

  if (loading) {
    return <LoadingSpinner message="Loading author profile..." className="py-20" />;
  }

  if (!author) {
    return <div className="text-center py-10 text-xl text-brand-text-muted dark:text-brand-text-muted-dark">Author not found.</div>;
  }

  const profileImage = author.profilePictureUrl || DEFAULT_PROFILE_PICTURE;

  return (
    <div className="max-w-5xl mx-auto">
      <Button onClick={() => navigate(-1)} variant="ghost" size="sm" className="mb-6 !text-brand-text dark:!text-brand-text-dark hover:!text-brand-accent dark:hover:!text-brand-accent-dark" leftIcon={<ArrowUturnLeftIcon className="h-5 w-5"/>}>
            Back
      </Button>
      <header className="bg-brand-surface dark:bg-brand-surface-dark p-8 rounded-lg shadow-md mb-10 text-center border border-brand-border dark:border-brand-border-dark flex flex-col items-center">
        <img 
            src={profileImage} 
            alt={author.username} 
            className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover mb-5 border-2 border-brand-border dark:border-brand-border-dark"
            onError={(e) => (e.currentTarget.src = DEFAULT_PROFILE_PICTURE)}
        />
        <h1 className="text-3xl font-bold text-brand-text dark:text-brand-text-dark mb-1.5">{author.username}</h1>
        <p className="text-brand-text-muted dark:text-brand-text-muted-dark mb-3">{author.email}</p>
        {author.bio && (
          <p className="text-brand-text-muted dark:text-brand-text-muted-dark max-w-xl mx-auto italic text-sm mb-4">{author.bio}</p>
        )}
        
        {!isOwnProfile && (
             <Button onClick={handleFollowToggle} variant={isFollowing ? 'secondary' : 'primary'} size="md">
                {isFollowing ? 'Unfollow' : 'Follow'}
            </Button>
        )}
      </header>

      <section>
        <h2 className="text-2xl font-semibold text-brand-text dark:text-brand-text-dark mb-6 text-center md:text-left">
          Posts by {author.username} ({posts.length})
        </h2>
        {posts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {posts.map(post => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-brand-text-muted dark:text-brand-text-muted-dark text-center py-10">This author has not published any posts yet.</p>
        )}
      </section>
    </div>
  );
};

export default AuthorProfile;
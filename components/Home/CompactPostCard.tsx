
import React from 'react';
import { Link } from 'react-router-dom';
import { BlogPost } from '../../types';
import { DEFAULT_FEATURED_IMAGE } from '../../constants';
import { createExcerpt } from '../../utils/helpers';

interface CompactPostCardProps {
  post: BlogPost;
  orientation?: 'vertical' | 'horizontal';
}

const CompactPostCard: React.FC<CompactPostCardProps> = ({ post, orientation = 'horizontal' }) => {
  const displayImage = post.featuredImage || DEFAULT_FEATURED_IMAGE;

  if (orientation === 'vertical') {
    return (
       <Link 
        to={`/blog/${post.id}`} 
        className="block group bg-brand-surface dark:bg-brand-surface-dark rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-brand-border dark:border-brand-border-dark"
        aria-label={`Read more about ${post.title}`}
      >
        <img 
          src={displayImage}
          alt={post.title}
          className="w-full h-32 object-cover transition-transform group-hover:scale-105 duration-300"
          onError={(e) => (e.currentTarget.src = DEFAULT_FEATURED_IMAGE)}
        />
        <div className="p-3">
          <h4 className="text-base font-semibold text-brand-text dark:text-brand-text-dark group-hover:text-brand-accent dark:group-hover:text-brand-accent-dark transition-colors line-clamp-2 leading-tight mb-1">
            {post.title}
          </h4>
          <p className="text-xs text-brand-text-muted dark:text-brand-text-muted-dark">By {post.authorName}</p>
        </div>
      </Link>
    );
  }

  // Horizontal orientation (default)
  return (
    <Link
      to={`/blog/${post.id}`}
      className="block group bg-brand-surface dark:bg-brand-surface-dark p-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-brand-border dark:border-brand-border-dark"
      aria-label={`Read more about ${post.title}`}
    >
      <div className="flex items-center space-x-3">
        <img
          src={displayImage}
          alt={post.title}
          className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md flex-shrink-0 transition-transform group-hover:scale-105 duration-300"
          onError={(e) => (e.currentTarget.src = DEFAULT_FEATURED_IMAGE)}
        />
        <div className="flex-1">
          <h4 className="text-md font-semibold text-brand-text dark:text-brand-text-dark group-hover:text-brand-accent dark:group-hover:text-brand-accent-dark transition-colors line-clamp-2 leading-snug mb-0.5">
            {post.title}
          </h4>
          <p className="text-xs text-brand-text-muted dark:text-brand-text-muted-dark line-clamp-2 mb-0.5">
            {post.excerpt || createExcerpt(post.content, 60)}
          </p>
          <p className="text-xs text-brand-text-muted dark:text-brand-text-muted-dark">By {post.authorName}</p>
        </div>
      </div>
    </Link>
  );
};

export default CompactPostCard;
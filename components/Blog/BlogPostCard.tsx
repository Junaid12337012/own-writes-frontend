

import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { BlogPost } from '../../types';
import { DEFAULT_FEATURED_IMAGE, DEFAULT_PROFILE_PICTURE } from '../../constants';
import { createExcerpt } from '../../utils/helpers';
import { SpeakerWaveIcon } from '@heroicons/react/24/outline';

interface BlogPostCardProps {
  post: BlogPost;
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({ post }) => {
  const displayImage = post.featuredImage || DEFAULT_FEATURED_IMAGE;
  const authorImage = DEFAULT_PROFILE_PICTURE; 

  return (
    <article className="bg-brand-surface dark:bg-brand-surface-dark rounded-xl shadow-lg flex flex-col overflow-hidden group border border-brand-border dark:border-brand-border-dark card-lift-hover">
      {/* Image Section */}
      <div className="overflow-hidden relative">
        <ReactRouterDOM.Link to={`/blog/${post.id}`} aria-label={`Read more about ${post.title}`}>
            <img 
                src={displayImage} 
                alt={post.title} 
                className="w-full aspect-[16/10] object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out" 
                onError={(e) => (e.currentTarget.src = DEFAULT_FEATURED_IMAGE)}
            />
            {post.postType === 'podcast' && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <SpeakerWaveIcon className="h-14 w-14 text-white/80 drop-shadow-lg" />
                </div>
            )}
        </ReactRouterDOM.Link>
      </div>

      {/* Content Section */}
      <div className="p-5 md:p-6 flex flex-col flex-grow">
        {post.tags.slice(0, 1).map(tag => ( 
            <ReactRouterDOM.Link 
              key={tag} 
              to={`/category/${encodeURIComponent(tag)}`} 
              className="text-brand-highlight dark:text-brand-highlight-dark text-sm font-display font-semibold uppercase tracking-wider mb-2 self-start hover:underline"
              aria-label={`View posts tagged with ${tag}`}
            >
              {tag}
            </ReactRouterDOM.Link>
          ))}

        {/* Title */}
        <h2 className="text-xl lg:text-2xl font-display font-bold text-brand-text dark:text-brand-text-dark mb-3 leading-tight flex-grow">
          <ReactRouterDOM.Link to={`/blog/${post.id}`} className="hover:text-brand-accent dark:hover:text-brand-accent-dark transition-colors duration-200 line-clamp-3">
            {post.title}
          </ReactRouterDOM.Link>
        </h2>

        {/* Excerpt */}
        <p className="text-brand-text-muted dark:text-brand-text-muted-dark text-sm mb-4 line-clamp-3 leading-relaxed">
          {post.excerpt || createExcerpt(post.content, 130)}
        </p>

        {/* Footer: Author & Date */}
        <div className="mt-auto pt-4">
          <div className="flex items-center">
            <div>
              <ReactRouterDOM.Link to={`/author/${post.authorId}`} className="text-sm font-display font-semibold text-brand-text dark:text-brand-text-dark hover:text-brand-accent dark:hover:text-brand-accent-dark transition-colors">{post.authorName}</ReactRouterDOM.Link>
              <p className="text-xs text-brand-text-muted dark:text-brand-text-muted-dark">{new Date(post.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default BlogPostCard;
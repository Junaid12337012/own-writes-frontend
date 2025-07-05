import React, { useState, useMemo } from 'react';
import { BlogPost, ReactionType, ReactionTypes } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import * as blogService from '../../services/blogService';
import { HeartIcon } from '@heroicons/react/24/outline'; // Fallback icon

interface ReactionsControlProps {
  post: BlogPost;
  setPost: React.Dispatch<React.SetStateAction<BlogPost | null>>;
}

const ReactionsControl: React.FC<ReactionsControlProps> = ({ post, setPost }) => {
  const { user } = useAuth();
  const { addToast } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState<ReactionType | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const timerRef = React.useRef<number | null>(null);

  const userReaction = useMemo(() => {
    if (!user) return null;
    for (const type in post.reactions) {
      if (post.reactions[type as ReactionType]?.includes(user.id)) {
        return type as ReactionType;
      }
    }
    return null;
  }, [post.reactions, user]);
  
  const totalReactionCount = useMemo(() => {
      return Object.values(post.reactions || {}).reduce((acc, userIds) => acc + (userIds?.length || 0), 0);
  }, [post.reactions]);

  const handleReaction = async (type: ReactionType) => {
    if (!user) {
      addToast({ message: 'You must be logged in to react.', type: 'warning' });
      return;
    }
    
    setIsSubmitting(type);
    
    try {
      const updatedPost = await blogService.addReaction(post.id, type);
      setPost(updatedPost);
    } catch (error) {
      addToast({ message: 'Failed to update reaction.', type: 'error' });
    } finally {
      setIsSubmitting(null);
      setShowPicker(false);
    }
  };

  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setShowPicker(true);
  };

  const handleMouseLeave = () => {
    timerRef.current = window.setTimeout(() => {
      setShowPicker(false);
    }, 200);
  };

  const ReactionButton: React.FC<{ type: ReactionType, emoji: string }> = ({ type, emoji }) => (
    <button
      onClick={() => handleReaction(type)}
      disabled={!!isSubmitting}
      className={`p-1.5 rounded-full transition-transform transform hover:scale-125 focus:outline-none ${userReaction === type ? 'bg-brand-accent/20' : 'hover:bg-brand-bg dark:hover:bg-brand-bg-dark'}`}
      title={type.charAt(0).toUpperCase() + type.slice(1)}
    >
      <span className="text-xl">{emoji}</span>
    </button>
  );

  return (
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button
        onClick={() => userReaction ? handleReaction(userReaction) : setShowPicker(!showPicker)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-border dark:border-brand-border-dark bg-brand-surface dark:bg-brand-surface-dark hover:border-brand-accent dark:hover:border-brand-accent-dark transition-colors"
      >
        <span className="text-lg">{userReaction ? ReactionTypes[userReaction] : <HeartIcon className="h-5 w-5 text-brand-text-muted dark:text-brand-text-muted-dark"/>}</span>
        <span className="text-sm font-medium text-brand-text dark:text-brand-text-dark">{totalReactionCount}</span>
      </button>

      {showPicker && (
        <div 
          className="absolute bottom-full mb-2 left-0 bg-brand-surface dark:bg-brand-surface-dark border border-brand-border dark:border-brand-border-dark rounded-full shadow-lg p-1.5 flex items-center space-x-1.5 z-20"
        >
          {Object.entries(ReactionTypes).map(([type, emoji]) => (
            <ReactionButton key={type} type={type as ReactionType} emoji={emoji} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReactionsControl;

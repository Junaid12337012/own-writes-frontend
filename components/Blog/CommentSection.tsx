import React, { useState, useEffect, useCallback } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Comment } from '../../types';
import * as commentService from '../../services/commentService';
import Button from '../Common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { PaperAirplaneIcon, SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { DEFAULT_PROFILE_PICTURE } from '../../constants';
import { getProfileImage } from '../../utils/image';
import { geminiService } from '../../services/geminiService';

interface CommentSectionProps {
  blogPostId: string;
}

type AuthUser = ReturnType<typeof useAuth>["user"]; // derives the user type from AuthContext
const CommentItem: React.FC<{ comment: Comment; onReply: (parentId: string, userName: string) => void; currentUser: AuthUser }> = ({ comment, onReply, currentUser }) => {
  const [showReplies, setShowReplies] = useState(false);

  return (
    <div className={`py-4 ${comment.parentId ? 'ml-6 sm:ml-8 pl-3 border-l-2 border-brand-border dark:border-brand-border-dark' : ''}`}>
      <div className="flex items-start space-x-3 sm:space-x-3.5">
        <img 
            src={getProfileImage(comment.userProfilePictureUrl)} 
            alt={comment.userName} 
            className="h-9 w-9 sm:h-10 sm:w-10 rounded-full object-cover shadow-sm"
            onError={(e) => (e.currentTarget.src = DEFAULT_PROFILE_PICTURE)}
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-brand-text dark:text-brand-text-dark">{comment.userName}</p>
            <span className="text-xs text-brand-text-muted dark:text-brand-text-muted-dark">{new Date(comment.createdAt).toLocaleString()}</span>
          </div>
          <div className="text-brand-text-muted dark:text-brand-text-muted-dark mt-1 prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: comment.content }}></div>
          <div className="mt-2 space-x-3 text-xs">
            {currentUser && <button onClick={() => onReply(comment.id, comment.userName)} className="font-medium text-brand-accent dark:text-brand-accent-dark hover:text-brand-accent/80 dark:hover:text-brand-accent-dark/80 hover:underline">Reply</button>}
             {comment.replies && comment.replies.length > 0 && (
               <button onClick={() => setShowReplies(!showReplies)} className="font-medium text-brand-text-muted dark:text-brand-text-muted-dark hover:text-brand-text dark:hover:text-brand-text-dark">
                 {showReplies ? 'Hide' : 'Show'} {comment.replies.length} replies
               </button>
             )}
          </div>
        </div>
      </div>
      {showReplies && comment.replies && comment.replies.length > 0 && (
        <div className="mt-2.5">
          {comment.replies.map(reply => (
            <CommentItem key={reply.id} comment={reply} onReply={onReply} currentUser={currentUser} />
          ))}
        </div>
      )}
    </div>
  );
};


const CommentSection: React.FC<CommentSectionProps> = ({ blogPostId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string, name: string } | null>(null); 
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { addToast } = useNotification();
  
  const [commentSummary, setCommentSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [showSummary, setShowSummary] = useState(false);


  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedComments = await commentService.fetchComments(blogPostId);
      const commentsWithReplies = fetchedComments
        .filter((c: Comment) => !c.parentId && !c.reported)
        .map((parent: Comment) => ({
          ...parent,
          replies: fetchedComments
            .filter((reply: Comment) => reply.parentId === parent.id && !reply.reported && reply.id !== parent.id)
            .sort((a: Comment, b: Comment) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) 
        })).sort((a: Comment, b: Comment) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); 
      setComments(commentsWithReplies);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      addToast({ message: 'Could not load comments.', type: 'error' });
    }
    setLoading(false);
  }, [blogPostId, addToast]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      addToast({ message: 'You must be logged in to comment.', type: 'warning' });
      return;
    }
    if (!newComment.trim()) {
      addToast({ message: 'Comment cannot be empty.', type: 'warning' });
      return;
    }

    setSubmitting(true);
    try {
      await commentService.postComment(blogPostId, newComment, replyTo?.id || undefined);
      setNewComment('');
      setReplyTo(null); 
      addToast({ message: 'Comment posted!', type: 'success' });
      await fetchComments(); 
    } catch (error) {
      addToast({ message: 'Failed to post comment.', type: 'error' });
    }
    setSubmitting(false);
  };

  const handleReply = (parentId: string, userName: string) => {
    setReplyTo({ id: parentId, name: userName });
    const textarea = document.getElementById('comment-textarea');
    if (textarea) textarea.focus();
  };
  
  const handleSummarizeComments = async () => {
    const allCommentsForSummary = comments.flatMap(c => [c, ...(c.replies || [])]);
    if (allCommentsForSummary.length === 0) {
      addToast({ message: "No comments to summarize.", type: 'info'});
      return;
    }
    setLoadingSummary(true);
    setCommentSummary(null);
    try {
      const summaryText = await geminiService.summarizeComments(allCommentsForSummary);
      setCommentSummary(summaryText);
      setShowSummary(true);
    } catch (error: any) {
      addToast({ message: `Failed to get summary: ${error.message || 'An error occurred.'}`, type: 'error'});
    } finally {
      setLoadingSummary(false);
    }
  };

  const totalCommentsCount = comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);

  return (
    <div className="mt-12 bg-transparent dark:bg-brand-surface-dark/50 p-0 sm:p-2 rounded-lg"> 
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-3">
        <h3 className="text-2xl lg:text-3xl font-display font-semibold text-brand-text dark:text-brand-text-dark">Comments ({totalCommentsCount})</h3>
        {totalCommentsCount > 3 && (
            <Button
                onClick={handleSummarizeComments}
                isLoading={loadingSummary}
                disabled={loadingSummary}
                variant="ghost"
                size="sm"
                leftIcon={<SparklesIcon className="h-5 w-5"/>}
                className="!text-brand-accent dark:!text-brand-accent-dark hover:!bg-brand-accent/10 dark:hover:!bg-brand-accent-dark/10 self-start sm:self-center"
            >
                {loadingSummary ? 'Analyzing...' : 'Summarize Comments'}
            </Button>
        )}
      </div>

      {showSummary && commentSummary && (
        <div className="mb-8 p-4 bg-brand-accent/5 dark:bg-brand-surface-dark border-l-4 border-brand-accent dark:border-brand-accent-dark rounded-r-lg relative">
          <button onClick={() => setShowSummary(false)} className="absolute top-2 right-2 p-1 text-brand-text-muted dark:text-brand-text-muted-dark hover:bg-black/10 dark:hover:bg-white/10 rounded-full" aria-label="Close summary">
            <XMarkIcon className="h-5 w-5" />
          </button>
          <h4 className="font-semibold text-brand-text dark:text-brand-text-dark flex items-center mb-2">
            <SparklesIcon className="h-5 w-5 mr-2 text-brand-accent" />
            AI Summary of Comments
          </h4>
          <ul className="prose prose-sm dark:prose-invert max-w-none list-disc pl-5 space-y-1">
            {commentSummary.split('* ').filter(s => s.trim()).map((s, i) => <li key={i}>{s.trim()}</li>)}
          </ul>
        </div>
      )}
      
      {user ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="flex items-start space-x-3 sm:space-x-3.5">
            <img 
                src={getProfileImage(user.profilePictureUrl)} 
                alt={user.username} 
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-full object-cover shadow-sm"
                onError={(e) => (e.currentTarget.src = DEFAULT_PROFILE_PICTURE)}
            />
            <div className="flex-1">
              {replyTo && (
                 <div className="text-xs text-brand-text-muted dark:text-brand-text-muted-dark mb-1.5 flex justify-between items-center">
                    <span>Replying to <strong>{replyTo.name}</strong></span>
                    <button type="button" onClick={() => setReplyTo(null)} className="font-semibold hover:text-red-500 dark:hover:text-red-400">Cancel Reply</button>
                 </div>
              )}
              <textarea
                id="comment-textarea"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
                className="w-full p-3 border border-brand-border dark:border-brand-border-dark bg-brand-surface dark:bg-brand-surface-dark text-brand-text dark:text-brand-text-dark rounded-lg focus:outline-none focus:ring-1 focus:ring-offset-1 dark:focus:ring-offset-brand-surface-dark focus:ring-brand-accent dark:focus:ring-brand-accent-dark focus:border-brand-accent dark:focus:border-brand-accent-dark transition-colors placeholder-brand-text-muted dark:placeholder-brand-text-muted-dark text-sm"
                disabled={submitting}
                aria-label="Comment input"
              />
            </div>
          </div>
          <div className="text-right mt-3">
            <Button type="submit" isLoading={submitting} disabled={!newComment.trim() || submitting} leftIcon={<PaperAirplaneIcon className="h-5 w-5"/>}>
              Post Comment
            </Button>
          </div>
        </form>
      ) : (
          <p className="text-brand-text-muted dark:text-brand-text-muted-dark mb-8 p-4 bg-brand-bg dark:bg-brand-surface-dark rounded-lg text-center">
              Please <ReactRouterDOM.Link to="/login" className="font-semibold text-brand-accent dark:text-brand-accent-dark hover:underline">log in</ReactRouterDOM.Link> or <ReactRouterDOM.Link to="/signup" className="font-semibold text-brand-accent dark:text-brand-accent-dark hover:underline">sign up</ReactRouterDOM.Link> to post a comment.
          </p>
      )}

      {loading && comments.length === 0 && <p className="text-brand-text-muted dark:text-brand-text-muted-dark py-5 text-center">Loading comments...</p>}
      {!loading && comments.length === 0 && <p className="text-brand-text-muted dark:text-brand-text-muted-dark py-5 text-center">No comments yet. Be the first to share your thoughts!</p>}
      
      <div className="space-y-3 divide-y divide-brand-border dark:divide-brand-border-dark">
        {comments.map(comment => (
          <CommentItem key={comment.id} comment={comment} onReply={handleReply} currentUser={user} />
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
import React, { useState, useEffect, useCallback } from 'react';
import { Comment } from '../../types';
import * as adminService from '../../services/adminService';
import LoadingSpinner from '../Common/LoadingSpinner';
import Button from '../Common/Button';
import { useNotification } from '../../contexts/NotificationContext';
import { Link } from 'react-router-dom';
import { CheckCircleIcon, NoSymbolIcon, TrashIcon } from '@heroicons/react/24/outline';

const AdminCommentModeration: React.FC = () => {
  const [reportedComments, setReportedComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useNotification();

  const fetchReportedComments = useCallback(async () => {
    setLoading(true);
    try {
      const comments = await adminService.fetchPendingComments();
      setReportedComments(comments);
    } catch (error) {
      addToast({ message: 'Failed to load reported comments.', type: 'error' });
    }
    setLoading(false);
  }, [addToast]);

  useEffect(() => {
    fetchReportedComments();
  }, [fetchReportedComments]);

  const handleApproveComment = async (commentId: string) => {
    try {
      await adminService.approveComment(commentId);
      setReportedComments(prev => prev.filter(c => c.id !== commentId));
      addToast({ message: 'Comment approved.', type: 'success' });
    } catch (error) {
      addToast({ message: 'Failed to approve comment.', type: 'error' });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment permanently?')) {
      try {
        await adminService.deleteComment(commentId); 
        setReportedComments(prev => prev.filter(c => c.id !== commentId));
        addToast({ message: 'Comment deleted.', type: 'success' });
      } catch (error) {
        addToast({ message: 'Failed to delete comment.', type: 'error' });
      }
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading reported comments..." />;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold text-brand-text dark:text-brand-text-dark">Comment Moderation</h3>
      {reportedComments.length === 0 ? (
        <p className="text-brand-text-muted dark:text-brand-text-muted-dark p-4 bg-brand-bg dark:bg-brand-surface-dark/50 border border-brand-border dark:border-brand-border-dark rounded-md">No comments currently reported for moderation. Good job!</p>
      ) : (
        <div className="space-y-4">
          {reportedComments.map(comment => (
            <div key={comment.id} className="bg-brand-surface dark:bg-brand-surface-dark p-4 shadow-sm rounded-lg border border-yellow-400 dark:border-yellow-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-brand-text-muted dark:text-brand-text-muted-dark">
                    User: <span className="font-medium text-brand-text dark:text-brand-text-dark">{comment.userName}</span>
                  </p>
                  <p className="text-sm text-brand-text-muted dark:text-brand-text-muted-dark">
                    On post: <Link to={`/blog/${comment.blogPostId}`} className="text-brand-accent dark:text-brand-accent-dark hover:underline">View Post</Link>
                  </p>
                   <p className="text-sm text-brand-text-muted dark:text-brand-text-muted-dark">
                    Reported at: <span className="font-medium text-brand-text dark:text-brand-text-dark">{new Date(comment.createdAt).toLocaleString()}</span>
                  </p>
                </div>
                <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300 px-2 py-1 rounded-full">Reported</span>
              </div>
              <p className="mt-2 text-brand-text dark:text-brand-text-dark border-l-4 border-yellow-500 dark:border-yellow-400 pl-3 py-1">{comment.content}</p>
              <div className="mt-3 flex space-x-3">
                <Button size="sm" variant="secondary" onClick={() => handleApproveComment(comment.id)} leftIcon={<CheckCircleIcon className="h-4 w-4 text-green-600 dark:text-green-400"/>} className="!border-green-500 !text-green-700 dark:!border-green-600 dark:!text-green-300 hover:!bg-green-100 dark:hover:!bg-green-700/50">
                  Approve
                </Button>
                <Button size="sm" variant="danger" onClick={() => handleDeleteComment(comment.id)} leftIcon={<TrashIcon className="h-4 w-4"/>}>
                  Delete Comment
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCommentModeration;

import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { BlogPost } from '../../types';
import Button from '../Common/Button';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface DashboardPostsTableProps {
  posts: BlogPost[];
  onDelete: (postId: string) => void;
}

export const DashboardPostsTable: React.FC<DashboardPostsTableProps> = ({ posts, onDelete }) => {
  const navigate = ReactRouterDOM.useNavigate();

  const getStatusChip = (status: BlogPost['status']) => {
    switch (status) {
      case 'published':
        return <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300">Published</span>;
      case 'draft':
        return <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300">Draft</span>;
      case 'scheduled':
        return <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300">Scheduled</span>;
      default:
        return null;
    }
  };

  return (
    <div className="overflow-x-auto bg-brand-surface dark:bg-brand-surface-dark shadow-sm rounded-lg border border-brand-border dark:border-brand-border-dark">
      <table className="min-w-full divide-y divide-brand-border dark:divide-brand-border-dark">
        <thead className="bg-brand-bg dark:bg-brand-surface-dark/50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-muted dark:text-brand-text-muted-dark uppercase tracking-wider">Title</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-muted dark:text-brand-text-muted-dark uppercase tracking-wider">Status</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-muted dark:text-brand-text-muted-dark uppercase tracking-wider hidden md:table-cell">Created</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-muted dark:text-brand-text-muted-dark uppercase tracking-wider hidden sm:table-cell">Reactions</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-muted dark:text-brand-text-muted-dark uppercase tracking-wider hidden sm:table-cell">Comments</th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-brand-text-muted dark:text-brand-text-muted-dark uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-brand-surface dark:bg-brand-surface-dark divide-y divide-brand-border dark:divide-brand-border-dark">
          {posts.map(post => {
            const totalReactions = Object.values(post.reactions || {}).flat().length;
            return (
              <tr key={post.id} className="hover:bg-brand-bg/50 dark:hover:bg-brand-bg-dark/50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <ReactRouterDOM.Link to={`/blog/${post.id}`} className="text-sm font-medium text-brand-text dark:text-brand-text-dark hover:text-brand-accent dark:hover:text-brand-accent-dark line-clamp-2" title={post.title}>
                    {post.title}
                  </ReactRouterDOM.Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{getStatusChip(post.status)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text-muted dark:text-brand-text-muted-dark hidden md:table-cell">{new Date(post.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text-muted dark:text-brand-text-muted-dark hidden sm:table-cell">{totalReactions}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text-muted dark:text-brand-text-muted-dark hidden sm:table-cell">{post.commentCount || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/blog/edit/${post.id}`)} title="Edit Post" className="!p-1.5">
                    <PencilIcon className="h-5 w-5 text-brand-text-muted hover:text-yellow-500"/>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(post.id)} title="Delete Post" className="!p-1.5">
                    <TrashIcon className="h-5 w-5 text-brand-text-muted hover:text-red-500"/>
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

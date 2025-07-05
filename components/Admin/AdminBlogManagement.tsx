import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BlogPost } from '../../types';
import { fetchAllBlogs, deleteBlog } from '../../services/adminService';
import LoadingSpinner from '../Common/LoadingSpinner';
import Button from '../Common/Button';
import { useNotification } from '../../contexts/NotificationContext';
import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';


const AdminBlogManagement: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useNotification();
  const navigate = useNavigate();
  const { user } = useAuth(); 


  const fetchAllPosts = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedPosts = await fetchAllBlogs(); 
      setPosts(fetchedPosts);
    } catch (error) {
      addToast({ message: 'Failed to load blog posts.', type: 'error' });
    }
    setLoading(false);
  }, [addToast]);

  useEffect(() => {
    fetchAllPosts();
  }, [fetchAllPosts]);

  const handleDeletePost = async (postId: string, postTitle: string) => {
    if (!user) {
        addToast({ message: 'Authentication error.', type: 'error'});
        return;
    }
    if (window.confirm(`Are you sure you want to delete the post "${postTitle}"? This action cannot be undone.`)) {
      try {
        await deleteBlog(postId); 
        setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
        addToast({ message: `Post "${postTitle}" deleted successfully.`, type: 'success' });
      } catch (error) {
        addToast({ message: `Failed to delete post "${postTitle}".`, type: 'error' });
      }
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading all blog posts..." />;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold text-brand-text dark:text-brand-text-dark">Blog Post Management</h3>
      {posts.length === 0 ? <p className="text-brand-text-muted dark:text-brand-text-muted-dark">No blog posts found in the system.</p> : (
        <div className="overflow-x-auto bg-brand-surface dark:bg-brand-surface-dark shadow-sm rounded-lg border border-brand-border dark:border-brand-border-dark">
          <table className="min-w-full divide-y divide-brand-border dark:divide-brand-border-dark">
            <thead className="bg-brand-bg dark:bg-brand-surface-dark/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-muted dark:text-brand-text-muted-dark uppercase tracking-wider">Title</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-muted dark:text-brand-text-muted-dark uppercase tracking-wider">Author</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-muted dark:text-brand-text-muted-dark uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-muted dark:text-brand-text-muted-dark uppercase tracking-wider">Created At</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-muted dark:text-brand-text-muted-dark uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-brand-surface dark:bg-brand-surface-dark divide-y divide-brand-border dark:divide-brand-border-dark">
              {posts.map(post => (
                <tr key={post.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand-text dark:text-brand-text-dark max-w-xs truncate" title={post.title}>
                    <Link to={`/blog/${post.id}`} className="hover:text-brand-accent dark:hover:text-brand-accent-dark">{post.title}</Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text-muted dark:text-brand-text-muted-dark">
                    <Link to={`/author/${post.authorId}`} className="hover:text-brand-accent dark:hover:text-brand-accent-dark">{post.authorName}</Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        post.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300' : 
                        post.status === 'draft' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300' 
                      }`}>
                        {post.status}
                      </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text-muted dark:text-brand-text-muted-dark">{new Date(post.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-1">
                     <Button variant="ghost" size="sm" onClick={() => navigate(`/blog/${post.id}`)} title="View Post" className="p-1.5">
                        <EyeIcon className="h-5 w-5 text-brand-text-muted dark:text-brand-text-muted-dark hover:text-brand-accent dark:hover:text-brand-accent-dark"/>
                     </Button>
                     <Button variant="ghost" size="sm" onClick={() => navigate(`/blog/edit/${post.id}`)} title="Edit Post" className="p-1.5">
                        <PencilIcon className="h-5 w-5 text-brand-text-muted dark:text-brand-text-muted-dark hover:text-yellow-500 dark:hover:text-yellow-400"/>
                     </Button>
                     <Button variant="ghost" size="sm" onClick={() => handleDeletePost(post.id, post.title)} title="Delete Post" className="p-1.5">
                        <TrashIcon className="h-5 w-5 text-brand-text-muted dark:text-brand-text-muted-dark hover:text-red-500 dark:hover:text-red-400"/>
                     </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminBlogManagement;
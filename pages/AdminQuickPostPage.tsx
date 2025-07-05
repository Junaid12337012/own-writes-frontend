import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as categoryService from '../services/categoryService';
import * as blogService from '../services/blogService';
import { useNotification } from '../contexts/NotificationContext';
import Button from '../components/Common/Button';

const AdminQuickPostPage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useNotification();
  const [categories, setCategories] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [loading, setLoading] = useState(false);
  const [catLoading, setCatLoading] = useState(true);
  const [catError, setCatError] = useState('');

  const fetchCats = async () => {
    setCatLoading(true);
    setCatError('');
    try {
      const cats = await categoryService.fetchCategories();
      setCategories(cats);
    } catch (err: any) {
      setCatError(err?.response?.data?.message || err.message || 'Failed to fetch categories from backend.');
      addToast({ message: 'Failed to fetch categories.', type: 'error' });
    }
    setCatLoading(false);
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !categoryId) {
      addToast({ message: 'Title, content, and category are required.', type: 'warning' });
      return;
    }
    setLoading(true);
    try {
      const postData = {
        title,
        content,
        categories: [categoryId],
        published: status === 'published',
      };
      await blogService.createBlog(postData);
      addToast({ message: `Post ${status === 'published' ? 'published' : 'saved as draft'}!`, type: 'success' });
      setTitle('');
      setContent('');
      setCategoryId('');
      setStatus('draft');
    } catch (error: any) {
      addToast({ message: error?.response?.data?.message || error.message || 'Failed to create post.', type: 'error' });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h2 className="text-2xl font-bold mb-6">Quick Admin Post</h2>
      {catLoading ? (
        <div className="flex items-center justify-center py-10">
          <span className="animate-spin mr-2">⏳</span> Loading categories...
        </div>
      ) : catError ? (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          <div className="mb-2">Failed to load categories: {catError}</div>
          <Button onClick={fetchCats}>Retry</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 bg-white dark:bg-brand-surface-dark p-6 rounded-lg shadow">
          <div>
            <label className="block mb-1 font-medium">Title</label>
            <input
              className="w-full border rounded p-2"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Content</label>
            <textarea
              className="w-full border rounded p-2 min-h-[120px]"
              value={content}
              onChange={e => setContent(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Category</label>
            <select
              className="w-full border rounded p-2"
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              required
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat._id || cat.id || cat.name} value={cat._id || cat.id || cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Status</label>
            <select
              className="w-full border rounded p-2"
              value={status}
              onChange={e => setStatus(e.target.value as 'draft' | 'published')}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <Button type="submit" isLoading={loading}>
            {status === 'published' ? 'Publish Post' : 'Save as Draft'}
          </Button>
        </form>
      )}
    </div>
  );
};

export default AdminQuickPostPage;

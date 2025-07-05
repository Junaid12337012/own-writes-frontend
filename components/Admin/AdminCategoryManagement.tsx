import React, { useState, useEffect, useCallback } from 'react';
import * as categoryService from '../../services/categoryService';
import LoadingSpinner from '../Common/LoadingSpinner';
import Button from '../Common/Button';
import { useNotification } from '../../contexts/NotificationContext';
import { TrashIcon, TagIcon, PlusIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

interface ManagedCategoryWithCount {
    id: string;
    name: string;
    count: number;
}

const AdminCategoryManagement: React.FC = () => {
  const [categoriesWithCount, setCategoriesWithCount] = useState<ManagedCategoryWithCount[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useNotification();

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedCategories = await categoryService.fetchCategories();
      // If backend returns an array of categories, add count: 0 to each for compatibility
      setCategoriesWithCount(
        fetchedCategories.map((cat: any) => ({ id: cat._id || cat.id, name: cat.name, count: cat.count ?? 0 }))
      );
    } catch (error) {
      addToast({ message: 'Failed to load categories.', type: 'error' });
    }
    setLoading(false);
  }, [addToast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      addToast({ message: 'Category name cannot be empty.', type: 'warning' });
      return;
    }
    setIsSubmitting(true);
    try {
      await categoryService.createCategory({ name: newCategoryName });
      addToast({ message: `Category "${newCategoryName}" added successfully.`, type: 'success' });
      setNewCategoryName('');
      await fetchCategories(); // Refresh list
    } catch (error: any) {
      addToast({ message: error.message || 'Failed to add category.', type: 'error' });
    }
    setIsSubmitting(false);
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (window.confirm(`Are you sure you want to delete the category "${categoryName}"? This will remove the tag from all posts.`)) {
      try {
        await categoryService.deleteCategory(categoryId);
        addToast({ message: `Category "${categoryName}" deleted.`, type: 'success' });
        await fetchCategories(); // Refresh list
      } catch (error) {
        addToast({ message: 'Failed to delete category.', type: 'error' });
      }
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading categories..." />;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold text-brand-text dark:text-brand-text-dark">Category Management</h3>
      
      {/* Add Category Form */}
      <div className="bg-brand-bg dark:bg-brand-surface-dark/50 p-4 rounded-lg border border-brand-border dark:border-brand-border-dark">
        <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="New category name"
            className="flex-grow mt-1 block w-full px-3 py-2 border border-brand-border dark:border-brand-border-dark bg-brand-surface dark:bg-brand-bg-dark text-brand-text dark:text-brand-text-dark rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-offset-1 dark:focus:ring-offset-brand-surface-dark focus:ring-brand-accent dark:focus:ring-brand-accent-dark sm:text-sm"
          />
          <Button type="submit" isLoading={isSubmitting} leftIcon={<PlusIcon className="h-5 w-5" />} className="sm:w-auto w-full justify-center">
            Add Category
          </Button>
        </form>
      </div>

      {/* Categories List */}
      <div className="overflow-x-auto bg-brand-surface dark:bg-brand-surface-dark shadow-sm rounded-lg border border-brand-border dark:border-brand-border-dark">
        <table className="min-w-full divide-y divide-brand-border dark:divide-brand-border-dark">
          <thead className="bg-brand-bg dark:bg-brand-surface-dark/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-muted dark:text-brand-text-muted-dark uppercase tracking-wider flex items-center gap-2"><TagIcon className="h-4 w-4"/>Category Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-muted dark:text-brand-text-muted-dark uppercase tracking-wider flex items-center gap-2"><DocumentTextIcon className="h-4 w-4"/>Posts</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-muted dark:text-brand-text-muted-dark uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-brand-surface dark:bg-brand-surface-dark divide-y divide-brand-border dark:divide-brand-border-dark">
            {categoriesWithCount.length > 0 ? categoriesWithCount.map(cat => (
              <tr key={cat.name}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand-text dark:text-brand-text-dark">{cat.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text-muted dark:text-brand-text-muted-dark">{cat.count}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Button size="sm" variant="ghost" onClick={() => handleDeleteCategory(cat.id, cat.name)} title="Delete Category" className="p-1.5">
                    <TrashIcon className="h-5 w-5 text-brand-text-muted dark:text-brand-text-muted-dark hover:text-red-500 dark:hover:text-red-400"/>
                  </Button>
                </td>
              </tr>
            )) : (
                <tr>
                    <td colSpan={3} className="text-center py-5 text-brand-text-muted dark:text-brand-text-muted-dark">No managed categories found.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCategoryManagement;

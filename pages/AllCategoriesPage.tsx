




import React, { useState, useEffect, useCallback } from 'react';
import { BlogPost } from '../types';
import * as categoryService from '../services/categoryService';
import * as blogService from '../services/blogService';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { useNotification } from '../contexts/NotificationContext';
import FeaturedCategoryCard from '../components/Home/FeaturedCategoryCard';
import { Squares2X2Icon, TagIcon } from '@heroicons/react/24/outline'; 

interface CategoryInfo {
  name: string;
  postCount: number;
}

const AllCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useNotification();

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      // fetch categories collection
      const cats = await categoryService.fetchCategories();
      // fetch counts per category via blogs (optional)
      const allPosts = await blogService.fetchBlogs();
      const counts: Record<string,string[]> = {};
      allPosts.forEach(p=>{
        (p.tags||[]).forEach((name:string)=>{ const key = name.toLowerCase();
          if (!counts[key]) counts[key]=[];
          counts[key].push(p.id);
        })
      });
      const categoryList: CategoryInfo[] = cats.map((c:any)=>({name:c.name, postCount:(counts[c.name.toLowerCase()]?.length)||0}));
      setCategories(categoryList.sort((a,b)=>b.postCount-a.postCount || a.name.localeCompare(b.name)));
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      addToast({ message: 'Could not load categories. Please try again later.', type: 'error' });
    }
    setLoading(false);
  }, [addToast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  if (loading) {
    return <LoadingSpinner message="Loading all categories..." className="py-20 min-h-[calc(100vh-20rem)]" />;
  }

  return (
    <div className="space-y-8">
      <header className="pb-6 border-b border-brand-border dark:border-brand-border-dark">
        <div className="flex items-center">
          <Squares2X2Icon className="h-9 w-9 text-brand-accent dark:text-brand-accent-dark mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-brand-text dark:text-brand-text-dark">
              Explore All Categories
            </h1>
            <p className="text-brand-text-muted dark:text-brand-text-muted-dark mt-1">Discover topics that interest you from our collection of blog posts.</p>
          </div>
        </div>
      </header>

      {categories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
          {categories.map(category => (
            <FeaturedCategoryCard 
              key={category.name} 
              categoryName={category.name} 
              description={`${category.postCount} ${category.postCount === 1 ? 'post' : 'posts'}`}
              icon={TagIcon} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-brand-surface dark:bg-brand-surface-dark rounded-lg shadow-md border border-brand-border dark:border-brand-border-dark">
          <Squares2X2Icon className="h-16 w-16 text-brand-border dark:text-brand-border-dark mx-auto mb-5" />
          <p className="text-xl text-brand-text dark:text-brand-text-dark mb-2">No categories found.</p>
          <p className="text-brand-text-muted dark:text-brand-text-muted-dark">It seems we haven't categorized any posts yet. Check back soon!</p>
        </div>
      )}
    </div>
  );
};

export default AllCategoriesPage;
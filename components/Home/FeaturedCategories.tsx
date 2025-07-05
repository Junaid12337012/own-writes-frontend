

import React, { useState, useEffect } from 'react';
import * as categoryService from '../../services/categoryService';
import * as blogService from '../../services/blogService';
import FeaturedCategoryCard from './FeaturedCategoryCard';
import { TagIcon, GlobeAltIcon, RocketLaunchIcon, HeartIcon, CpuChipIcon } from '@heroicons/react/24/outline'; // Example icons

const FeaturedCategories: React.FC = () => {
    const [categories, setCategories] = useState<Array<{ name: string; count: number }>>([]);
    const [loading, setLoading] = useState(true);

    // Mapping of category names to icons for better visuals
    const categoryIcons: { [key: string]: React.ElementType } = {
        'Technology': CpuChipIcon,
        'Lifestyle': HeartIcon,
        'Web Development': RocketLaunchIcon,
        'Travel': GlobeAltIcon,
        'AI': CpuChipIcon,
        'Productivity': RocketLaunchIcon,
    };

    useEffect(() => {
        const fetchCategories = async () => {
            setLoading(true);
            try {
                const cats = await categoryService.fetchCategories();
                const allPosts = await blogService.fetchBlogs();
                const counts: Record<string, number> = {};
                allPosts.filter(p=>p.status==='published').forEach(p=>{
                    (p.tags||[]).forEach((name:string)=>{
                      const key=name.toLowerCase();
                      counts[key]=(counts[key]||0)+1;
                    })
                });
                const categoryList = cats.map((c:any)=>({ name:c.name, count: counts[c.name.toLowerCase()]||0 }))
                    .sort((a,b)=>b.count-a.count)
                    .slice(0,5);
                setCategories(categoryList);
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            }
            setLoading(false);
        };
        fetchCategories();
    }, []);

    if (loading || categories.length === 0) {
        return null; // Don't show the section if loading or no categories
    }

    return (
        <section>
            <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-display font-bold text-brand-text dark:text-brand-text-dark">
                    Featured Categories
                </h2>
                <p className="mt-2 text-lg text-brand-text-muted dark:text-brand-text-muted-dark max-w-xl mx-auto">
                    Dive into topics that matter to you.
                </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                {categories.map(category => (
                    <FeaturedCategoryCard 
                        key={category.name}
                        categoryName={category.name}
                        icon={categoryIcons[category.name] || TagIcon}
                        description={`${category.count} ${category.count === 1 ? 'post' : 'posts'}`}
                    />
                ))}
            </div>
        </section>
    );
};

export default FeaturedCategories;
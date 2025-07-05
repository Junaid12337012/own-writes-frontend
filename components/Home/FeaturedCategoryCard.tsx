

import React from 'react';
import { Link } from 'react-router-dom';
import { TagIcon as DefaultCategoryIcon } from '@heroicons/react/24/outline';

interface FeaturedCategoryCardProps {
  categoryName: string;
  icon?: React.ElementType;
  description?: string; 
}

const FeaturedCategoryCard: React.FC<FeaturedCategoryCardProps> = ({ categoryName, icon: IconComponent, description }) => {
  const Icon = IconComponent || DefaultCategoryIcon;
  return (
    <Link
      to={`/category/${encodeURIComponent(categoryName)}`}
      className="block bg-brand-surface dark:bg-brand-surface-dark p-5 rounded-lg shadow-md hover:shadow-lg dark:hover:shadow-black/20 transform hover:-translate-y-1 transition-all duration-300 ease-in-out group border border-brand-border dark:border-brand-border-dark"
      aria-label={`View posts in category ${categoryName}`}
    >
      <div className="flex flex-col items-center text-center">
        <div className="p-2.5 bg-brand-accent/10 dark:bg-brand-accent-dark/10 rounded-full mb-3 group-hover:bg-brand-accent/20 dark:group-hover:bg-brand-accent-dark/20 transition-colors">
          <Icon className="h-8 w-8 text-brand-accent dark:text-brand-accent-dark transition-colors" />
        </div>
        <h3 className="text-lg font-semibold text-brand-text dark:text-brand-text-dark group-hover:text-brand-accent dark:group-hover:text-brand-accent-dark transition-colors mb-1">
          {categoryName}
        </h3>
        {description && (
          <p className="text-xs text-brand-text-muted dark:text-brand-text-muted-dark line-clamp-2">{description}</p>
        )}
      </div>
    </Link>
  );
};

export default FeaturedCategoryCard;
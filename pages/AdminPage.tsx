import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import AdminUserManagement from '../components/Admin/AdminUserManagement';
import AdminBlogManagement from '../components/Admin/AdminBlogManagement';
import AdminCommentModeration from '../components/Admin/AdminCommentModeration';
import AdminAnalyticsOverview from '../components/Admin/AdminAnalyticsOverview';
import AdminCategoryManagement from '../components/Admin/AdminCategoryManagement'; // New Import
import { UsersIcon, DocumentTextIcon, ChatBubbleLeftEllipsisIcon, ChartBarIcon, TagIcon } from '@heroicons/react/24/outline';

const AdminPage: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/admin/analytics', label: 'Analytics Overview', icon: ChartBarIcon },
    { path: '/admin/users', label: 'User Management', icon: UsersIcon },
    { path: '/admin/blogs', label: 'Blog Management', icon: DocumentTextIcon },
    { path: '/admin/comments', label: 'Comment Moderation', icon: ChatBubbleLeftEllipsisIcon },
    { path: '/admin/categories', label: 'Category Management', icon: TagIcon }, // New Nav Item
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <aside className="md:w-1/4 lg:w-1/5">
        <h2 className="text-2xl font-semibold text-brand-text dark:text-brand-text-dark mb-5">Admin Panel</h2>
        <nav className="space-y-1.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path) || (location.pathname === '/admin' && item.path === '/admin/analytics');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-md transition-colors
                            ${isActive ? 'bg-brand-accent dark:bg-brand-accent-dark text-white shadow-sm' 
                                      : 'text-brand-text-muted dark:text-brand-text-muted-dark hover:bg-brand-accent/10 dark:hover:bg-brand-surface hover:text-brand-accent dark:hover:text-brand-accent-dark'}`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-brand-text-muted dark:text-brand-text-muted-dark'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <section className="flex-1 bg-brand-surface dark:bg-brand-surface-dark p-6 rounded-lg shadow-md border border-brand-border dark:border-brand-border-dark">
        <Routes>
          <Route path="/" element={<AdminAnalyticsOverview />} /> 
          <Route path="analytics" element={<AdminAnalyticsOverview />} />
          <Route path="users" element={<AdminUserManagement />} />
          <Route path="blogs" element={<AdminBlogManagement />} />
          <Route path="comments" element={<AdminCommentModeration />} />
          <Route path="categories" element={<AdminCategoryManagement />} /> {/* New Route */}
        </Routes>
      </section>
    </div>
  );
};

export default AdminPage;
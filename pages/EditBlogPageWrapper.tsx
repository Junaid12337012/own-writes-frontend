





import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { BlogEditor } from '../components/Blog/BlogEditor';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

const EditBlogPageWrapper: React.FC = () => {
  const { id } = ReactRouterDOM.useParams<{ id: string }>();
  const { user, loadingAuth } = useAuth();

  if (loadingAuth) {
    return <LoadingSpinner message="Loading editor..." />;
  }

  if (!user) {
    return <p className="text-red-500 dark:text-red-400">You need to be logged in to edit posts.</p>;
  }
  
  if (!id) {
    return <p className="text-red-500 dark:text-red-400">Error: Blog post ID is missing for editing.</p>;
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-brand-text dark:text-brand-text-dark">Edit Blog Post</h1>
        <p className="text-brand-text-muted dark:text-brand-text-muted-dark mt-1">Refine your masterpiece.</p>
      </header>
      <BlogEditor blogId={id} />
    </div>
  );
};

export default EditBlogPageWrapper;
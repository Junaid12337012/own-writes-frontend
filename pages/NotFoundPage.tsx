
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Common/Button';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-15rem)] flex flex-col items-center justify-center text-center px-4">
      <ExclamationTriangleIcon className="h-20 w-20 text-yellow-400 dark:text-yellow-500 mb-6" />
      <h1 className="text-5xl font-extrabold text-brand-text dark:text-brand-text-dark mb-3">404</h1>
      <h2 className="text-2xl font-semibold text-brand-text dark:text-brand-text-dark mb-5">Page Not Found</h2>
      <p className="text-brand-text-muted dark:text-brand-text-muted-dark mb-8 max-w-md">
        Oops! The page you're looking for doesn't seem to exist. It might have been moved, deleted, or maybe you just mistyped the URL.
      </p>
      <Link to="/">
        <Button variant="primary" size="lg">
          Go Back Home
        </Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
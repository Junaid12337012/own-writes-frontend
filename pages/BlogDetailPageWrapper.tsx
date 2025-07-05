

import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import BlogDetail from '../components/Blog/BlogDetail';

const BlogDetailPageWrapper: React.FC = () => {
  const { id } = ReactRouterDOM.useParams<{ id: string }>();

  if (!id) {
    return <div className="text-center py-10 text-red-500">Error: Blog post ID is missing.</div>;
  }

  return <BlogDetail blogId={id} />;
};

export default BlogDetailPageWrapper;

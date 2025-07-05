

import React, { useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import HomePage from './pages/HomePage';
import BlogDetailPageWrapper from './pages/BlogDetailPageWrapper';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import CreateBlogPage from './pages/CreateBlogPage';
import EditBlogPageWrapper from './pages/EditBlogPageWrapper';
import AuthorPageWrapper from './pages/AuthorPageWrapper';
import CategoryPageWrapper from './pages/CategoryPageWrapper';
import AllCategoriesPage from './pages/AllCategoriesPage'; // New Import
import NotFoundPage from './pages/NotFoundPage';
import { useAuth } from './contexts/AuthContext';
import NotificationsDisplay from './components/Common/NotificationsDisplay';
import { UserRole } from './types';
import AboutPage from './pages/AboutPage';
import AllBlogsPage from './pages/AllBlogsPage';
import TermsOfServicePage from './pages/TermsOfServicePage'; 
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'; 
import FaqPage from './pages/FaqPage'; 
import ContactUsPage from './pages/ContactUsPage'; 
import ScrollToTop from './components/Common/ScrollToTop';
import BackToTopButton from './components/Common/BackToTopButton'; // New Import
import { PostAnalyticsPage } from './pages/PostAnalyticsPage';
import { useNotification } from './contexts/NotificationContext';
import AllPodcastsPage from './pages/AllPodcastsPage';


const App: React.FC = () => {
  const { user, loadingAuth } = useAuth();
  const { fetchNotificationsForUser } = useNotification();

  useEffect(() => {
    fetchNotificationsForUser(user?.id ?? null);
  }, [user, fetchNotificationsForUser]);


  if (loadingAuth) {
    return <div className="flex items-center justify-center min-h-screen bg-brand-bg dark:bg-brand-bg-dark"><div className="text-xl text-brand-accent dark:text-brand-accent-dark">Loading application...</div></div>;
  }

  return (
    <ReactRouterDOM.HashRouter>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen bg-brand-bg dark:bg-brand-bg-dark"> 
        <Navbar />
        <NotificationsDisplay />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-8 md:pb-12">
          <div className="page-content-enter">
            <ReactRouterDOM.Routes>
              <ReactRouterDOM.Route path="/" element={<HomePage />} />
              <ReactRouterDOM.Route path="/podcasts" element={<AllPodcastsPage />} />
              <ReactRouterDOM.Route path="/category/:categoryName" element={<CategoryPageWrapper />} />
              <ReactRouterDOM.Route path="/categories" element={<AllCategoriesPage />} /> 
              <ReactRouterDOM.Route path="/blogs" element={<AllBlogsPage />} />
              <ReactRouterDOM.Route path="/about" element={<AboutPage />} />
              <ReactRouterDOM.Route path="/terms" element={<TermsOfServicePage />} />
              <ReactRouterDOM.Route path="/privacy" element={<PrivacyPolicyPage />} />
              <ReactRouterDOM.Route path="/faq" element={<FaqPage />} />
              <ReactRouterDOM.Route path="/contact" element={<ContactUsPage />} />
              
              <ReactRouterDOM.Route path="/login" element={user ? <ReactRouterDOM.Navigate to="/dashboard" /> : <LoginPage />} />
              <ReactRouterDOM.Route path="/signup" element={user ? <ReactRouterDOM.Navigate to="/dashboard" /> : <SignupPage />} />
              
              <ReactRouterDOM.Route path="/blog/:id" element={<BlogDetailPageWrapper />} />
              <ReactRouterDOM.Route path="/author/:authorId" element={<AuthorPageWrapper />} />
              
              <ReactRouterDOM.Route path="/dashboard" element={user ? <DashboardPage /> : <ReactRouterDOM.Navigate to="/login" />} />
              <ReactRouterDOM.Route path="/blog/create" element={user ? (user.role !== UserRole.USER ? <CreateBlogPage /> : <ReactRouterDOM.Navigate to="/" />) : <ReactRouterDOM.Navigate to="/login" />} />
              <ReactRouterDOM.Route path="/blog/edit/:id" element={user ? <EditBlogPageWrapper /> : <ReactRouterDOM.Navigate to="/login" />} />
              <ReactRouterDOM.Route path="/dashboard/posts/:id/analytics" element={user ? <PostAnalyticsPage /> : <ReactRouterDOM.Navigate to="/login" />} />
              
              <ReactRouterDOM.Route 
                path="/admin/*" 
                element={user && user.role === UserRole.ADMIN ? <AdminPage /> : <ReactRouterDOM.Navigate to="/" />} 
              />
              
              <ReactRouterDOM.Route path="*" element={<NotFoundPage />} />
            </ReactRouterDOM.Routes>
          </div>
        </main>
        <Footer />
        <BackToTopButton /> {/* Added BackToTopButton */}
      </div>
    </ReactRouterDOM.HashRouter>
  );
};

export default App;
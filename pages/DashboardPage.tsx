
import React, { useState, useEffect, useCallback } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BlogPost, User, Bookmark, UserRole } from '../types';
import * as blogService from '../services/blogService';
import * as userService from '../services/userService';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Button from '../components/Common/Button';
import { 
    BookmarkIcon as BookmarkOutlineIcon, DocumentPlusIcon, 
    CogIcon, SparklesIcon, NewspaperIcon, RssIcon, UserGroupIcon
} from '@heroicons/react/24/outline';
import { useNotification } from '../contexts/NotificationContext';
import { DEFAULT_PROFILE_PICTURE, DEFAULT_FEATURED_IMAGE } from '../constants';
import BlogPostIdeaGenerator from '../components/Common/BlogPostIdeaGenerator'; 
import BlogPostCard from '../components/Blog/BlogPostCard';
import { DashboardPostsTable } from '../components/Dashboard/DashboardPostsTable';

type DashboardTab = 'posts' | 'bookmarks' | 'feed';

const DashboardPage: React.FC = () => {
  const { user, updateUserContext } = useAuth();
  const [myPosts, setMyPosts] = useState<BlogPost[]>([]);
  const [bookmarks, setBookmarks] = useState<Array<BlogPost & { bookmarkedAt: string }>>([]);
  const [feedPosts, setFeedPosts] = useState<BlogPost[]>([]);

  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<DashboardTab>('posts');

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({ username: '', bio: '', profilePictureUrl: '' });
  const [isUploading, setIsUploading] = useState(false);

  const navigate = ReactRouterDOM.useNavigate();
  const { addToast } = useNotification();

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username,
        bio: user.bio || '',
        profilePictureUrl: user.profilePictureUrl || ''
      });
    }
  }, [user]);

  const fetchDashboardData = useCallback(async (tab: DashboardTab) => {
    if (!user) return;
    setLoading(true);
    try {
        switch (tab) {
            case 'posts':
                const allPosts = await blogService.fetchBlogs();
                setMyPosts(allPosts.filter(p=>p.authorId===user.id));
                break;
            case 'bookmarks':
                // Bookmarks feature not yet implemented in backend
                setBookmarks([]);
                break;
            case 'feed':
                const published = (await blogService.fetchBlogs()).filter(p=>p.status==='published');
                setFeedPosts(published.slice(0,20));
                break;
        }
    } catch (error) {
        addToast({ message: `Failed to load data for ${tab}.`, type: 'error' });
    }
    setLoading(false);
  }, [user, addToast]);


  useEffect(() => {
    fetchDashboardData(activeTab);
  }, [activeTab, fetchDashboardData]);

  const handleDeletePost = async (postId: string) => {
    if (!user) return;
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        // TODO: implement delete via backend admin or author endpoint
        await blogService.deleteBlog ? blogService.deleteBlog(postId) : null;
        addToast({ message: 'Post deleted successfully.', type: 'success' });
        setMyPosts(prev => prev.filter(p => p.id !== postId)); 
      } catch (error) {
        addToast({ message: 'Failed to delete post.', type: 'error' });
      }
    }
  };

  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({ ...prev, profilePictureUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsUploading(true);
    try {
      const updatedUser = await userService.updateProfile(profileData);
      updateUserContext(updatedUser); 
      addToast({ message: 'Profile updated successfully.', type: 'success' });
      setEditingProfile(false);
    } catch (error) {
      addToast({ message: 'Failed to update profile.', type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  if (!user) {
    return <ReactRouterDOM.Navigate to="/login" />;
  }
  
  const TabButton = ({ tab, label, icon: Icon }: {tab: DashboardTab, label: string, icon: React.FC<any>}) => (
       <button
        onClick={() => setActiveTab(tab)}
        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === tab 
            ? 'bg-brand-accent text-white shadow' 
            : 'text-brand-text dark:text-brand-text-dark hover:bg-gray-500/10 dark:hover:bg-white/5'
        }`}
        >
        <Icon className="h-5 w-5" />
        <span>{label}</span>
      </button>
  );
  
  const renderTabContent = () => {
      if (loading) {
          return <LoadingSpinner message={`Loading ${activeTab}...`} />;
      }
      
      switch (activeTab) {
          case 'posts':
              return myPosts.length > 0 ? (
                  <DashboardPostsTable posts={myPosts} onDelete={handleDeletePost} />
              ) : <p className="text-brand-text-muted dark:text-brand-text-muted-dark text-center py-6 bg-brand-surface dark:bg-brand-surface-dark rounded-lg shadow-sm border border-brand-border dark:border-brand-border-dark">You haven't created any posts yet.</p>;
          
          case 'bookmarks':
              return bookmarks.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {bookmarks.map((post) => (
                          <div key={post.id} className="bg-brand-surface dark:bg-brand-surface-dark rounded-lg shadow-sm p-4 hover:shadow-md dark:hover:shadow-black/20 transition-shadow border border-brand-border dark:border-brand-border-dark flex flex-col card-lift-hover">
                              <ReactRouterDOM.Link to={`/blog/${post.id}`} className="flex-grow">
                                  <img src={post.featuredImage || DEFAULT_FEATURED_IMAGE} alt={post.title} className="w-full h-32 object-cover rounded-md mb-3" onError={(e) => (e.currentTarget.src = DEFAULT_FEATURED_IMAGE)} />
                                  <h3 className="font-semibold text-brand-accent dark:text-brand-accent-dark hover:underline line-clamp-2 flex items-start">
                                    <span className="flex-1">{post.title}</span>
                                  </h3>
                              </ReactRouterDOM.Link>
                              <p className="text-xs text-brand-text-muted dark:text-brand-text-muted-dark mt-1">By {post.authorName}</p>
                              <p className="text-xs text-brand-text-muted dark:text-brand-text-muted-dark mt-1">Bookmarked on: {new Date(post.bookmarkedAt).toLocaleDateString()}</p>
                          </div>
                      ))}
                  </div>
              ) : <p className="text-brand-text-muted dark:text-brand-text-muted-dark text-center py-6 bg-brand-surface dark:bg-brand-surface-dark rounded-lg shadow-sm border border-brand-border dark:border-brand-border-dark">You haven't bookmarked any posts yet.</p>;

          case 'feed':
              return feedPosts.length > 0 ? (
                  <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                      {feedPosts.map(post => <BlogPostCard key={post.id} post={post} />)}
                  </div>
              ) : (
                  <div className="text-center py-10 bg-brand-surface dark:bg-brand-surface-dark rounded-lg shadow-sm border border-brand-border dark:border-brand-border-dark">
                      <UserGroupIcon className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                      <h3 className="text-lg font-semibold text-brand-text dark:text-brand-text-dark">Your feed is empty.</h3>
                      <p className="text-brand-text-muted dark:text-brand-text-muted-dark mt-1">Follow authors to see their latest posts here.</p>
                      <Button onClick={() => navigate('/blogs')} className="mt-4">Explore Blogs & Authors</Button>
                  </div>
              );

          default: return null;
      }
  }


  return (
    <div className="space-y-10">
      <header className="bg-brand-surface dark:bg-brand-surface-dark shadow-lg p-6 sm:p-8 rounded-xl border border-brand-border dark:border-brand-border-dark">
        <div className="flex flex-col sm:flex-row items-start sm:space-x-6">
            <div className="relative mb-4 sm:mb-0">
                <img 
                    src={profileData.profilePictureUrl || DEFAULT_PROFILE_PICTURE} 
                    alt={user.username} 
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-brand-surface dark:border-brand-surface-dark shadow-md"
                    onError={(e) => (e.currentTarget.src = DEFAULT_PROFILE_PICTURE)}
                />
                 <button onClick={() => setEditingProfile(true)} className="absolute bottom-0 right-0 p-1.5 bg-brand-accent hover:bg-brand-accent/90 rounded-full text-white shadow-md border-2 border-brand-surface dark:border-brand-surface-dark" title="Edit Profile">
                    <CogIcon className="h-5 w-5"/>
                </button>
            </div>
            <div className="flex-grow">
                <h1 className="text-3xl font-bold text-brand-text dark:text-brand-text-dark">Welcome, {user.username}!</h1>
                <p className="text-brand-text-muted dark:text-brand-text-muted-dark mt-1">{user.email}</p>
                <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs font-semibold inline-block py-1 px-2.5 uppercase rounded-full text-brand-accent bg-brand-accent/10 dark:text-brand-accent-dark dark:bg-brand-accent-dark/10">
                        Role: {user.role}
                    </span>
                </div>
                {user.bio && <p className="text-sm text-brand-text-muted dark:text-brand-text-muted-dark mt-3 italic max-w-lg">{user.bio}</p>}
            </div>
        </div>
      </header>

      {editingProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 dark:bg-opacity-80 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
            <div className="bg-brand-surface dark:bg-brand-surface-dark p-6 rounded-xl shadow-xl w-full max-w-lg border border-brand-border dark:border-brand-border-dark">
                <h2 className="text-2xl font-semibold mb-4 text-brand-text dark:text-brand-text-dark">Edit Profile</h2>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-brand-text-muted dark:text-brand-text-muted-dark">Username</label>
                        <input type="text" name="username" id="username" value={profileData.username} onChange={handleProfileInputChange} className="mt-1 block w-full px-3 py-2 border border-brand-border dark:border-brand-border-dark bg-brand-surface dark:bg-brand-surface-dark text-brand-text dark:text-brand-text-dark rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-offset-1 dark:focus:ring-offset-brand-surface-dark focus:ring-brand-accent dark:focus:ring-brand-accent-dark sm:text-sm"/>
                    </div>
                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-brand-text-muted dark:text-brand-text-muted-dark">Bio</label>
                        <textarea name="bio" id="bio" value={profileData.bio} onChange={handleProfileInputChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-brand-border dark:border-brand-border-dark bg-brand-surface dark:bg-brand-surface-dark text-brand-text dark:text-brand-text-dark rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-offset-1 dark:focus:ring-offset-brand-surface-dark focus:ring-brand-accent dark:focus:ring-brand-accent-dark sm:text-sm"/>
                    </div>
                    <div>
                        <label htmlFor="profilePictureFile" className="mt-2 block text-sm font-medium text-brand-text-muted dark:text-brand-text-muted-dark">Upload New Picture:</label>
                        <input type="file" name="profilePictureFile" id="profilePictureFile" accept="image/*" onChange={handleProfilePictureChange} className="mt-1 block w-full text-sm text-brand-text-muted dark:text-brand-text-muted-dark file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-accent/10 file:text-brand-accent dark:file:bg-brand-accent-dark/10 dark:file:text-brand-accent-dark hover:file:bg-brand-accent/20 dark:hover:file:bg-brand-accent-dark/20 rounded-lg"/>
                    </div>
                    <div className="flex justify-end space-x-3 pt-2">
                        <Button type="button" variant="ghost" onClick={() => setEditingProfile(false)}>Cancel</Button>
                        <Button type="submit" isLoading={isUploading}>Save Changes</Button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {user.role !== UserRole.USER && (
        <section>
          <BlogPostIdeaGenerator />
        </section>
      )}

      <section>
          <div className="border-b border-brand-border dark:border-brand-border-dark mb-5">
              <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
                  {user.role !== UserRole.USER && <TabButton tab="posts" label="My Posts" icon={NewspaperIcon} />}
                  <TabButton tab="bookmarks" label="My Bookmarks" icon={BookmarkOutlineIcon} />
                  <TabButton tab="feed" label="My Feed" icon={RssIcon} />
              </nav>
          </div>
          
          <div className="mt-5">
            <h2 className="text-2xl font-semibold text-brand-text dark:text-brand-text-dark mb-4 capitalize">{activeTab}</h2>
            {renderTabContent()}
          </div>
      </section>
    </div>
  );
};

export default DashboardPage;



import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { BlogPost, User, GeneratedImage } from '../../types';
import * as blogService from '../../services/blogService';
import { apiService } from '../../services/mockApiService';
import { geminiService } from '../../services/geminiService';
import LoadingSpinner from '../Common/LoadingSpinner';
import CommentSection from './CommentSection';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { ttsService } from '../../services/ttsService';
import { DEFAULT_FEATURED_IMAGE, DEFAULT_PROFILE_PICTURE, APP_NAME } from '../../constants';
import { 
    CalendarDaysIcon, PencilIcon, TrashIcon, 
    SpeakerWaveIcon, SpeakerXMarkIcon, BookmarkIcon as BookmarkSolidIcon, ArrowUturnLeftIcon,
    LinkIcon, ShareIcon as ShareOutlineIcon, Bars3BottomLeftIcon, XMarkIcon as XMarkIconOutline, EnvelopeIcon,
    ClipboardIcon, CameraIcon, ClockIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkOutlineIcon } from '@heroicons/react/24/outline';
import { updatePageMeta, injectJSONLD, removeJSONLD } from '../../utils/seoUtils';
import { createExcerpt, estimateReadingTime } from '../../utils/helpers';
import ReactionsControl from './ReactionsControl';
import Button from '../Common/Button';
import TextShotModal from './TextShotModal';
import TableOfContents from './TableOfContents';
import NewsletterCTA from '../Home/NewsletterCTA';

interface BlogDetailProps {
  blogId: string;
}

interface TocItem {
  id: string;
  text: string;
  level: number; 
  active: boolean;
}

const BlogDetail: React.FC<BlogDetailProps> = ({ blogId }) => {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [author, setAuthor] = useState<User | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  const [showTextActionToolbar, setShowTextActionToolbar] = useState(false);
  const [textActionToolbarPosition, setTextActionToolbarPosition] = useState({ top: 0, left: 0 });
  const [selectedText, setSelectedText] = useState('');
  
  const [isTextShotModalOpen, setIsTextShotModalOpen] = useState(false);
  const [textShotImage, setTextShotImage] = useState<GeneratedImage | null>(null);
  const [loadingTextShot, setLoadingTextShot] = useState(false);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [isTocVisibleMobile, setIsTocVisibleMobile] = useState(false);

  const { user } = useAuth();
  const { addToast } = useNotification();
  const navigate = ReactRouterDOM.useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);
  const textActionToolbarRef = useRef<HTMLDivElement>(null);

  const fetchBlogDetails = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedPost = await blogService.fetchBlog(blogId);
      if (fetchedPost) {
        setPost(fetchedPost);
        // TODO: replace with real author, related posts, and bookmark API once backend endpoints exist
        setAuthor(undefined);
        setRelatedPosts([]);
        setIsBookmarked(false);
      } else {
        addToast({ message: 'Blog post not found.', type: 'error' });
        navigate('/404');
      }
    } catch (error) {
      console.error("Failed to fetch blog details:", error);
      addToast({ message: 'Could not load blog post.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [blogId, user, addToast, navigate]);

  useEffect(() => {
    fetchBlogDetails();
    return () => { 
      if (ttsService.isSpeaking()) {
        ttsService.stop();
      }
    };
  }, [fetchBlogDetails]);

  useEffect(() => {
    if (post && author) {
      const pageUrl = `${window.location.origin}/#/blog/${post.id}`;
      updatePageMeta({
        title: post.title,
        description: post.metaDescription || post.excerpt || createExcerpt(post.content, 160),
        imageUrl: post.featuredImage || DEFAULT_FEATURED_IMAGE,
        url: pageUrl,
        author: author.username,
        keywords: post.tags.join(', ')
      });

      injectJSONLD({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "mainEntityOfPage": { "@type": "WebPage", "@id": pageUrl },
        "headline": post.title,
        "description": post.metaDescription || post.excerpt || createExcerpt(post.content, 160),
        "image": post.featuredImage || DEFAULT_FEATURED_IMAGE,
        "datePublished": post.publishedAt || post.createdAt,
        "dateModified": post.updatedAt,
        "author": { "@type": "Person", "name": author.username, "url": `${window.location.origin}/#/author/${author.id}` },
        "publisher": { "@type": "Organization", "name": APP_NAME, "logo": { "@type": "ImageObject", "url": `${window.location.origin}/apple-touch-icon.png` } },
        "keywords": post.tags.join(', '),
        "isAccessibleForFree": "True",
      });
    }
    return () => removeJSONLD();
  }, [post, author]);

  const handleScroll = useCallback(() => {
    const mainElement = document.documentElement; 
    const windowHeight = mainElement.clientHeight;
    const documentHeight = mainElement.scrollHeight; 
    
    let progress = (mainElement.scrollTop / (documentHeight - windowHeight)) * 100;
    setScrollProgress(Math.min(100, Math.max(0, progress)));
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

   // Handle click outside for menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showTextActionToolbar && textActionToolbarRef.current && !textActionToolbarRef.current.contains(event.target as Node)) setShowTextActionToolbar(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTextActionToolbar]);

  // Setup TOC and IntersectionObserver for active heading
  useEffect(() => {
    if (post && contentRef.current) {
      const headings = Array.from(contentRef.current.querySelectorAll('h2, h3, h4'));
      const items: TocItem[] = headings.map((heading, index) => {
        const text = heading.textContent || `Section ${index + 1}`;
        let id = heading.id;
        if (!id) {
          id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') + `-${index}`;
          heading.id = id;
        }
        const level = parseInt(heading.tagName.substring(1), 10);
        return { id, text, level, active: false };
      });
      setTocItems(items);
      
      const observerCallback: IntersectionObserverCallback = (entries) => {
        const visibleHeadings = entries.filter(e => e.isIntersecting);
        if (visibleHeadings.length > 0) {
            const topMostVisible = visibleHeadings.sort((a,b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
            setTocItems(prevItems => prevItems.map(item => ({...item, active: item.id === topMostVisible.target.id})));
        }
      };
      
      const observer = new IntersectionObserver(observerCallback, { rootMargin: "-20% 0px -65% 0px", threshold: 0.5 });
      headings.forEach(h => observer.observe(h));

      return () => observer.disconnect();
    }
  }, [post, loading]);

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      const text = selection.toString().trim();
      if (text.length > 10 && text.length <= 300) { 
        setSelectedText(text);
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        setTextActionToolbarPosition({ top: rect.top + window.scrollY - 45, left: rect.left + window.scrollX + (rect.width / 2) });
        setShowTextActionToolbar(true);
      } else {
        setShowTextActionToolbar(false);
      }
    } else {
      setShowTextActionToolbar(false);
    }
  }, []);

  const handleCreateTextShot = async () => {
    if (!selectedText) return;
    setShowTextActionToolbar(false);
    setIsTextShotModalOpen(true);
    setLoadingTextShot(true);
    setTextShotImage(null);
    try {
      const result = await geminiService.generateTextShotImage(selectedText);
      if (result?.base64Image) {
        setTextShotImage(result);
      } else {
        throw new Error('Image generation failed.');
      }
    } catch (error) {
      addToast({ message: 'Error generating Text Shot.', type: 'error' });
      setIsTextShotModalOpen(false);
    }
    setLoadingTextShot(false);
  };

  const handleCopySelectedText = () => {
    if (!selectedText) return;
    navigator.clipboard.writeText(selectedText)
      .then(() => {
        addToast({ message: 'Text copied to clipboard!', type: 'success' });
        setShowTextActionToolbar(false);
      })
      .catch(() => addToast({ message: 'Failed to copy text.', type: 'error' }));
  };

  const handleToggleTTS = async () => {
    if (!post) return;
    if (isSpeaking) {
      ttsService.stop();
      setIsSpeaking(false);
    } else {
      try {
        setIsSpeaking(true);
        const textToSpeak = post.title + ". " + (contentRef.current?.innerText || post.content.replace(/<[^>]+>/g, ''));
        await ttsService.speak(textToSpeak);
      } catch (error) {
        addToast({ message: (error as Error).message || 'Text-to-speech failed.', type: 'error' });
      } finally {
        setIsSpeaking(false);
      }
    }
  };

  const handleToggleBookmark = async () => {
    if (!post || !user) return addToast({ message: 'You need to be logged in to bookmark posts.', type: 'warning'});
    try {
        if (isBookmarked) {
            await apiService.removeBookmark(user.id, post.id);
            addToast({ message: 'Bookmark removed.', type: 'info'});
        } else {
            await apiService.addBookmark(user.id, post.id);
            addToast({ message: 'Post bookmarked!', type: 'success'});
        }
        setIsBookmarked(!isBookmarked);
    } catch (error) {
        addToast({ message: 'Failed to update bookmark.', type: 'error'});
    }
  };

  const handleDeletePost = async () => {
    if (!post || !user || (user.id !== post.authorId && user.role !== 'admin')) return addToast({ message: 'You are not authorized to delete this post.', type: 'error' });
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
        try {
            await apiService.deleteBlog(post.id, user.id);
            addToast({ message: 'Post deleted successfully.', type: 'success' });
            navigate(user.role === 'admin' ? '/admin/blogs' : '/dashboard');
        } catch (error) {
            addToast({ message: 'Failed to delete post.', type: 'error' });
        }
    }
  };
  
  const handleShare = (platform: 'twitter' | 'facebook' | 'linkedin' | 'email' | 'copy') => {
    if (!post) return;
    const url = `${window.location.origin}/#/blog/${post.id}`;
    const title = post.title;
    const text = `Check out this article: ${title}`;
    let shareUrl = '';

    switch (platform) {
      case 'twitter': shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`; break;
      case 'facebook': shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`; break;
      case 'linkedin': shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(post.excerpt || '')}`; break;
      case 'email': window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + '\n\n' + url)}`; break;
      case 'copy': navigator.clipboard.writeText(url).then(() => addToast({ message: 'Link copied!', type: 'success' })).catch(() => addToast({ message: 'Failed to copy.', type: 'error' })); break;
    }
    if (shareUrl) window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  const displayImage = useMemo(() => post?.featuredImage || DEFAULT_FEATURED_IMAGE, [post]);
  const authorImage = useMemo(() => author?.profilePictureUrl || DEFAULT_PROFILE_PICTURE, [author]);

  if (loading) return <LoadingSpinner message="Loading post..." className="py-20 min-h-screen" />;
  if (!post) return <div className="text-center py-10 text-xl text-brand-text dark:text-brand-text-dark">Blog post not found. <ReactRouterDOM.Link to="/" className="text-brand-accent dark:text-brand-accent-dark hover:underline">Go Home</ReactRouterDOM.Link></div>;

  return (
    <div className="bg-brand-bg dark:bg-brand-bg-dark selection:bg-brand-accent/20 selection:text-brand-accent">
      <div className="fixed top-20 left-0 h-1 bg-brand-accent z-[90] transition-all duration-100" style={{ width: `${scrollProgress}%` }} />
      
      <header className="relative w-full h-[40vh] sm:h-[50vh] lg:h-[60vh] group">
        <img src={displayImage} alt={post.title} className="absolute inset-0 w-full h-full object-cover" onError={(e) => (e.currentTarget.src = DEFAULT_FEATURED_IMAGE)} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
        {post.postType === 'podcast' && post.audioUrl && (
            <div className="absolute inset-0 flex items-center justify-center z-20 p-4">
                <div className="bg-black/50 backdrop-blur-md p-4 sm:p-6 rounded-lg w-full max-w-2xl shadow-lg border border-white/10">
                    <div className="flex items-center gap-4 mb-3">
                        <SpeakerWaveIcon className="h-8 w-8 text-blue-300 flex-shrink-0" />
                        <div>
                           <h3 className="text-white text-lg font-bold leading-tight">Listen to this episode</h3>
                           <p className="text-blue-200 text-sm">Now playing: {post.title}</p>
                        </div>
                    </div>
                    <audio controls src={post.audioUrl} className="w-full h-12">
                        Your browser does not support the audio element.
                    </audio>
                </div>
            </div>
        )}
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 lg:p-12 text-white z-10 max-w-5xl mx-auto w-full">
            {post.tags.slice(0,1).map(tag => <ReactRouterDOM.Link to={`/category/${encodeURIComponent(tag)}`} key={tag} className="text-sm font-display font-semibold tracking-wider uppercase text-brand-accent-dark/80 hover:text-white transition-colors self-start">{tag}</ReactRouterDOM.Link>)}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold font-display mt-2 mb-4 leading-tight shadow-text">{post.title}</h1>
            <div className="flex flex-wrap items-center text-sm text-gray-200 gap-x-6 gap-y-2">
                {author && <div className="flex items-center"><img src={authorImage} alt={author.username} className="h-8 w-8 rounded-full mr-2.5 object-cover border-2 border-white/50" onError={(e) => (e.currentTarget.src = DEFAULT_PROFILE_PICTURE)} /><ReactRouterDOM.Link to={`/author/${author.id}`} className="font-semibold hover:underline">{author.username}</ReactRouterDOM.Link></div>}
                <div className="flex items-center"><CalendarDaysIcon className="h-5 w-5 mr-1.5" /><span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
                <div className="flex items-center"><ClockIcon className="h-5 w-5 mr-1.5" /><span>{estimateReadingTime(post.content)}</span></div>
            </div>
        </div>
      </header>
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-0 py-10 md:py-12">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12">
            <aside className="hidden lg:block lg:col-span-3"><TableOfContents items={tocItems} /></aside>
            <main className="lg:col-span-9">
              <div className="bg-brand-surface dark:bg-brand-surface-dark p-2 sm:p-6 md:p-6 rounded-xl shadow-lg border border-brand-border dark:border-brand-border-dark">
                <div className="mb-8 pb-6 border-b border-brand-border dark:border-brand-border-dark flex flex-wrap items-center justify-start gap-3">
                    <ReactionsControl post={post} setPost={setPost} />
                    <Button onClick={handleToggleTTS} variant="ghost" size="sm" className="!text-brand-text-muted" leftIcon={isSpeaking ? <SpeakerXMarkIcon className="h-5 w-5"/> : <SpeakerWaveIcon className="h-5 w-5"/>}> {isSpeaking ? 'Stop' : 'Listen'} </Button>
                    <Button onClick={handleToggleBookmark} variant="ghost" size="sm" className="!text-brand-text-muted" leftIcon={isBookmarked ? <BookmarkSolidIcon className="h-5 w-5 text-yellow-500"/> : <BookmarkOutlineIcon className="h-5 w-5"/>} aria-pressed={isBookmarked}> {isBookmarked ? 'Saved' : 'Save'} </Button>
                    {(user?.id === post.authorId || user?.role === 'admin') && (<>
                        <Button onClick={() => navigate(`/blog/edit/${post.id}`)} variant="ghost" size="sm" className="!text-brand-text-muted" leftIcon={<PencilIcon className="h-5 w-5"/>}> Edit </Button>
                        <Button onClick={handleDeletePost} variant="ghost" size="sm" className="!text-red-500 !bg-red-50 hover:!bg-red-100 dark:!text-red-400 dark:!bg-red-900/50 dark:hover:!bg-red-900" leftIcon={<TrashIcon className="h-5 w-5"/>}> Delete </Button>
                    </>)}
                </div>
                {tocItems.length > 0 && (<div className="lg:hidden mb-10 p-4 bg-brand-bg dark:bg-brand-bg-dark rounded-lg border border-brand-border dark:border-brand-border-dark"><button onClick={() => setIsTocVisibleMobile(!isTocVisibleMobile)} className="flex justify-between items-center w-full font-semibold text-brand-text dark:text-brand-text-dark"><span className="flex items-center"><Bars3BottomLeftIcon className="h-5 w-5 mr-2"/>Table of Contents</span>{isTocVisibleMobile ? <XMarkIconOutline className="h-5 w-5"/> : <ShareOutlineIcon className="h-5 w-5 -rotate-90"/>}</button>{isTocVisibleMobile && (<div className="mt-4"><TableOfContents items={tocItems} isMobile={true} onLinkClick={() => setIsTocVisibleMobile(false)} /></div>)}</div>)}

                <article ref={contentRef} className="prose prose-lg dark:prose-invert max-w-none" onMouseUp={handleTextSelection} onTouchEnd={handleTextSelection}>
                  <div dangerouslySetInnerHTML={{ __html: post.content }} />
                </article>

                <div className="mt-12 pt-10 border-t border-brand-border dark:border-brand-border-dark flex items-center justify-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-brand-text-muted dark:text-brand-text-muted-dark mr-2">Share this post:</span>
                    <Button onClick={() => handleShare('twitter')} variant="ghost" size="sm">Twitter</Button>
                    <Button onClick={() => handleShare('facebook')} variant="ghost" size="sm">Facebook</Button>
                    <Button onClick={() => handleShare('linkedin')} variant="ghost" size="sm">LinkedIn</Button>
                    <Button onClick={() => handleShare('email')} variant="ghost" size="sm" className="!p-2" title="Share via Email"><EnvelopeIcon className="h-5 w-5"/></Button>
                    <Button onClick={() => handleShare('copy')} variant="ghost" size="sm" className="!p-2" title="Copy Link"><LinkIcon className="h-5 w-5"/></Button>
                </div>
                
                <NewsletterCTA />

                {author && (<section className="mt-10 pt-10 border-t border-brand-border dark:border-brand-border-dark"><div className="flex flex-col sm:flex-row items-center sm:items-start bg-brand-bg dark:bg-brand-surface-dark p-6 sm:p-8 rounded-lg border border-brand-border dark:border-brand-border-dark"><ReactRouterDOM.Link to={`/author/${author.id}`} className="flex-shrink-0 mb-5 sm:mb-0 sm:mr-6"><img src={authorImage} alt={author.username} className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-white dark:border-brand-surface-dark shadow-sm transition-transform hover:scale-105" onError={(e) => (e.currentTarget.src = DEFAULT_PROFILE_PICTURE)}/></ReactRouterDOM.Link><div className="text-center sm:text-left"><p className="text-xs text-brand-accent dark:text-brand-accent-dark uppercase tracking-wider font-semibold font-display">Written By</p><ReactRouterDOM.Link to={`/author/${author.id}`}> <h3 className="text-2xl lg:text-3xl font-display font-semibold text-brand-text dark:text-brand-text-dark hover:text-brand-accent dark:hover:text-brand-accent-dark transition-colors mt-1">{author.username}</h3> </ReactRouterDOM.Link>{author.bio && <p className="text-brand-text-muted dark:text-brand-text-muted-dark mt-2.5 text-sm leading-relaxed max-w-md">{author.bio}</p>}</div></div></section>)}

                <CommentSection blogPostId={blogId} />
            </div></main>
        </div>
      </div>

      {showTextActionToolbar && (<div ref={textActionToolbarRef} style={{ top: `${textActionToolbarPosition.top}px`, left: `${textActionToolbarPosition.left}px`, transform: 'translateX(-50%)' }} className="fixed z-[95] bg-slate-800 text-slate-100 px-2 py-1.5 rounded-md shadow-lg flex items-center space-x-1"><button onClick={handleCopySelectedText} className="p-1.5 hover:bg-slate-700 rounded" title="Copy selected text"><ClipboardIcon className="h-5 w-5"/> </button><div className="w-px h-5 bg-slate-600"></div> <button onClick={handleCreateTextShot} className="p-1.5 hover:bg-slate-700 rounded" title="Create Text Shot"><CameraIcon className="h-5 w-5"/> </button></div>)}
      {isTextShotModalOpen && <TextShotModal isOpen={isTextShotModalOpen} onClose={() => setIsTextShotModalOpen(false)} imageData={textShotImage} isLoading={loadingTextShot} originalText={selectedText}/>}

      {relatedPosts.length > 0 && (<section className="bg-brand-bg dark:bg-brand-bg-dark py-12 md:py-16"><div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"><h3 className="text-2xl md:text-3xl font-display font-bold text-brand-text dark:text-brand-text-dark mb-8 text-center">You Might Also Like</h3><div className="grid md:grid-cols-3 gap-6 lg:gap-8">{relatedPosts.map(relatedPost => (<div key={relatedPost.id} className="bg-brand-surface dark:bg-brand-surface-dark p-4 rounded-lg shadow-md hover:shadow-xl dark:hover:shadow-black/20 transition-all duration-300 transform hover:-translate-y-1.5 border border-brand-border dark:border-brand-border-dark"><ReactRouterDOM.Link to={`/blog/${relatedPost.id}`} className="group"><div className="overflow-hidden rounded-md mb-3"><img src={relatedPost.featuredImage || DEFAULT_FEATURED_IMAGE} alt={relatedPost.title} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out" onError={(e) => (e.currentTarget.src = DEFAULT_FEATURED_IMAGE)}/></div><h4 className="text-md font-semibold font-display text-brand-text dark:text-brand-text-dark group-hover:text-brand-accent dark:group-hover:text-brand-accent-dark transition-colors line-clamp-2 mb-1">{relatedPost.title}</h4><p className="text-xs text-brand-text-muted dark:text-brand-text-muted-dark">By {relatedPost.authorName}</p></ReactRouterDOM.Link></div>))}</div></div></section>)}
    </div>
  );
};

export default BlogDetail;
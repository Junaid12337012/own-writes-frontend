




import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { XMarkIcon, MagnifyingGlassIcon, GlobeAltIcon, LinkIcon } from '@heroicons/react/24/outline';
import { apiService } from '../../services/mockApiService';
import { geminiService } from '../../services/geminiService';
import { BlogPost, WebSearchResult } from '../../types';
import { useNotification } from '../../contexts/NotificationContext';
import LoadingSpinner from './LoadingSpinner';
import { DEFAULT_FEATURED_IMAGE } from '../../constants';

interface SearchOverlayProps {
  onClose: () => void;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [blogResults, setBlogResults] = useState<BlogPost[]>([]);
  const [webResult, setWebResult] = useState<WebSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeTab, setActiveTab] = useState<'blog' | 'web'>('blog');
  const { addToast } = useNotification();
  const inputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const performSearch = useCallback(async (term: string) => {
    if (!term.trim()) {
      setBlogResults([]);
      setWebResult(null);
      setLoading(false);
      setHasSearched(false);
      return;
    }
    
    setLoading(true);
    setHasSearched(true);

    try {
        if (activeTab === 'blog') {
            const filteredResults = await apiService.searchBlogsFullText(term);
            setBlogResults(filteredResults);
            setWebResult(null);
        } else { // activeTab === 'web'
            const webSearchResult = await geminiService.askTheWeb(term);
            setWebResult(webSearchResult);
            setBlogResults([]);
        }
    } catch (error: any) {
        addToast({ message: `Search failed: ${error.message || 'An unknown error occurred.'}`, type: 'error' });
        setBlogResults([]);
        setWebResult(null);
    }
    setLoading(false);
  }, [activeTab, addToast]);

  const handleSearchSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      performSearch(searchTerm);
  };
  
  const handleTabChange = (tab: 'blog' | 'web') => {
      setActiveTab(tab);
      setSearchTerm('');
      setBlogResults([]);
      setWebResult(null);
      setHasSearched(false);
      inputRef.current?.focus();
  }


  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim() || !text) {
      return text;
    }
    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, index) =>
          regex.test(part) ? (
            <mark key={index} className="bg-yellow-300 dark:bg-yellow-500 text-black px-0.5 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };
  
  const getMatchFieldDescription = (field?: BlogPost['matchField']): string => {
    if (!field) return '';
    switch (field) {
        case 'title': return 'Found in title';
        case 'content': return 'Found in content';
        case 'author': return 'Found in author name';
        case 'tag': return 'Found in tags';
        default: return '';
    }
  }

  const TabButton = ({ tab, label, icon: Icon }: {tab: 'blog' | 'web', label: string, icon: React.ElementType}) => (
       <button
        onClick={() => handleTabChange(tab)}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
            activeTab === tab 
            ? 'bg-brand-surface-dark/20 dark:bg-brand-surface-dark text-white' 
            : 'text-brand-text-muted-dark dark:text-brand-text-muted-dark hover:bg-brand-surface-dark/10 dark:hover:bg-brand-surface-dark/80 hover:text-white'
        }`}
        >
        <Icon className="h-5 w-5" />
        <span>{label}</span>
      </button>
  );

  return (
    <div className="fixed inset-0 bg-brand-bg-dark bg-opacity-95 z-[100] p-4 sm:p-6 lg:p-8 flex flex-col items-center backdrop-blur-sm">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 text-brand-text-muted-dark hover:text-white transition-colors"
        aria-label="Close search"
      >
        <XMarkIcon className="h-8 w-8" />
      </button>

      <div className="w-full max-w-3xl mt-12 sm:mt-16">
        <div className="flex space-x-1">
            <TabButton tab="blog" label="Search Our Blog" icon={MagnifyingGlassIcon} />
            <TabButton tab="web" label="Ask the Web" icon={GlobeAltIcon} />
        </div>
        
        <form onSubmit={handleSearchSubmit}>
          <div className="relative">
            <input
              ref={inputRef}
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={activeTab === 'blog' ? "Search by title, content, author..." : "Ask about recent events, definitions..."}
              className="w-full pl-12 pr-4 py-3 text-lg bg-brand-surface-dark/20 dark:bg-brand-surface-dark/80 border-b-2 border-brand-border-dark dark:border-brand-border-dark text-white placeholder-brand-text-muted-dark dark:placeholder-brand-text-muted-dark focus:outline-none focus:ring-0 focus:border-brand-accent-dark dark:focus:border-brand-accent-dark transition-colors rounded-b-lg rounded-tr-lg"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-6 w-6 text-brand-text-muted-dark" />
          </div>
        </form>

        <div className="mt-6 max-h-[calc(100vh-14rem)] overflow-y-auto pr-2 fancy-scrollbar">
          {loading && <LoadingSpinner message="Searching..." className="text-white dark:text-brand-text-dark" />}
          
          {!hasSearched && !loading && (
             <p className="text-center text-brand-text-muted-dark text-lg mt-8">
                {activeTab === 'blog' ? 'Search for articles on our platform.' : 'Ask a question to get up-to-date answers from the web.'}
            </p>
          )}

          {/* BLOG RESULTS */}
          {activeTab === 'blog' && !loading && hasSearched && blogResults.length === 0 && (
            <p className="text-center text-brand-text-muted-dark text-lg">No results found for "{searchTerm}".</p>
          )}
          {activeTab === 'blog' && blogResults.length > 0 && (
            <ul className="space-y-3">
                {blogResults.map(post => (
                <li key={post.id} className="bg-brand-surface-dark/20 dark:bg-brand-surface-dark/80 hover:bg-brand-surface-dark/40 dark:hover:bg-brand-surface-dark rounded-lg shadow-sm transition-all duration-200">
                    <Link to={`/blog/${post.id}`} onClick={onClose} className="block p-3.5">
                    <div className="flex items-start space-x-3.5">
                        <img 
                        src={post.featuredImage || DEFAULT_FEATURED_IMAGE} 
                        alt={post.title} 
                        className="w-20 h-14 object-cover rounded-md flex-shrink-0" 
                        onError={(e) => (e.currentTarget.src = DEFAULT_FEATURED_IMAGE)}
                        />
                        <div>
                        <h3 className="text-lg font-semibold text-brand-text-dark hover:text-brand-accent-dark transition-colors">
                            {highlightText(post.title, searchTerm)}
                        </h3>
                        {post.matchSnippet && (
                            <p className="text-sm text-brand-text-muted-dark mt-0.5 line-clamp-2">
                            {highlightText(post.matchSnippet, searchTerm)}
                            </p>
                        )}
                        <p className="text-xs text-brand-text-muted-dark/80 mt-1">
                                By {highlightText(post.authorName, searchTerm)} &bull; {new Date(post.createdAt).toLocaleDateString()}
                                {post.matchField && <span className="ml-2 italic opacity-80">({getMatchFieldDescription(post.matchField)})</span>}
                        </p>
                        </div>
                    </div>
                    </Link>
                </li>
                ))}
            </ul>
          )}


          {/* WEB RESULTS */}
           {activeTab === 'web' && !loading && hasSearched && !webResult && (
            <p className="text-center text-brand-text-muted-dark text-lg">No answer found for "{searchTerm}".</p>
          )}
          {activeTab === 'web' && webResult && (
            <div className="bg-brand-surface-dark/20 dark:bg-brand-surface-dark/80 rounded-lg p-5 text-white">
                <h3 className="text-xl font-semibold mb-3 text-brand-accent-dark">AI Answer</h3>
                <div className="prose prose-sm prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: webResult.answer.replace(/\n/g, '<br />') }}></div>

                {webResult.sources.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-brand-border-dark">
                        <h4 className="text-lg font-semibold mb-3 text-brand-accent-dark">Sources</h4>
                        <ul className="space-y-2">
                            {webResult.sources.map((source, index) => (
                                <li key={index}>
                                    <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 text-brand-text-dark hover:text-brand-accent-dark transition-colors group">
                                        <LinkIcon className="h-4 w-4 mt-1 flex-shrink-0 text-brand-text-muted-dark group-hover:text-brand-accent-dark" />
                                        <span className="text-sm underline">{source.web.title}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
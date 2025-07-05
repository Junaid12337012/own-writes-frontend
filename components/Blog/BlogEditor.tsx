
import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { BlogPost, AiContentSuggestion, GeneratedImage, AiFirstDraft, UserRole, PostType } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import * as blogService from '../../services/blogService';
import * as categoryService from '../../services/categoryService';
import { geminiService } from '../../services/geminiService';
import Button from '../Common/Button';
import LoadingSpinner from '../Common/LoadingSpinner';
import { useNotification } from '../../contexts/NotificationContext';
import { 
    LightBulbIcon, PhotoIcon, SparklesIcon, QueueListIcon,
    ChatBubbleBottomCenterTextIcon, CodeBracketIcon, MinusIcon, NoSymbolIcon, ListBulletIcon, TagIcon, XMarkIcon, LinkIcon,
    ArrowsPointingInIcon, ArrowsPointingOutIcon, StopIcon, TrashIcon
} from '@heroicons/react/24/outline';
import { DEFAULT_FEATURED_IMAGE } from '../../constants';
import AiPostOutlineGenerator from './AiPostOutlineGenerator';
import SelectionToolbar from './AiEditorToolbar';

interface BlogEditorProps {
  blogId?: string; 
  initialData?: AiFirstDraft | null;
}

const AUTOSAVE_INTERVAL = 5000; // ms

const ImageToolbar: React.FC<{
  position: { top: number; left: number };
  onDelete: () => void;
  onAlign: (alignment: 'left' | 'center' | 'right') => void;
  onResize: (size: 'sm' | 'md' | 'full') => void;
}> = ({ position, onDelete, onAlign, onResize }) => {
  const alignLeftIcon = <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>;
  const alignCenterIcon = <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>;
  const alignRightIcon = <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm6 4a1 1 0 011-1h6a1 1 0 110 2H10a1 1 0 01-1-1zm-6 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm6 4a1 1 0 011-1h6a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" /></svg>;

  return (
    <div
      style={{ top: position.top, left: position.left, transform: 'translateX(-50%)' }}
      className="fixed z-[95] bg-slate-800 text-slate-100 rounded-md shadow-lg flex items-center p-1"
      role="toolbar"
    >
      <button onClick={() => onResize('sm')} className="p-2 hover:bg-slate-700 rounded" title="Small (33%)"><ArrowsPointingInIcon className="h-5 w-5"/></button>
      <button onClick={() => onResize('md')} className="p-2 hover:bg-slate-700 rounded" title="Medium (66%)"><StopIcon className="h-5 w-5 transform rotate-90" /></button>
      <button onClick={() => onResize('full')} className="p-2 hover:bg-slate-700 rounded" title="Full Width"><ArrowsPointingOutIcon className="h-5 w-5"/></button>
      <div className="w-px h-5 bg-slate-600 mx-1"></div>
      <button onClick={() => onAlign('left')} className="p-2 hover:bg-slate-700 rounded" title="Align Left">{alignLeftIcon}</button>
      <button onClick={() => onAlign('center')} className="p-2 hover:bg-slate-700 rounded" title="Align Center">{alignCenterIcon}</button>
      <button onClick={() => onAlign('right')} className="p-2 hover:bg-slate-700 rounded" title="Align Right">{alignRightIcon}</button>
      <div className="w-px h-5 bg-slate-600 mx-1"></div>
      <button onClick={onDelete} className="p-2 hover:bg-slate-700 rounded" title="Delete Image"><TrashIcon className="h-5 w-5 text-red-400"/></button>
    </div>
  );
};


export const BlogEditor: React.FC<BlogEditorProps> = ({ blogId, initialData }) => {
  const { user } = useAuth();
  const navigate = ReactRouterDOM.useNavigate();
  const { addToast } = useNotification();
  const location = ReactRouterDOM.useLocation();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [metaDescription, setMetaDescription] = useState(''); 
  const [postType, setPostType] = useState<PostType>('blog');
  const [audioUrl, setAudioUrl] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [adminManagedCategories, setAdminManagedCategories] = useState<string[]>([]);
  const [postToEdit, setPostToEdit] = useState<BlogPost | null>(null);

  const [status, setStatus] = useState<'draft' | 'published' | 'scheduled'>('draft');
  const [featuredImage, setFeaturedImage] = useState<string>('');
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [scheduledPublishTime, setScheduledPublishTime] = useState('');

  const [loading, setLoading] = useState(false);
  const [isFetchingBlog, setIsFetchingBlog] = useState(!!blogId);
  const [aiSuggestions, setAiSuggestions] = useState<AiContentSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [loadingMeta, setLoadingMeta] = useState(false);
  
  const [showOutlineGenerator, setShowOutlineGenerator] = useState(false);
  
  const [showSelectionToolbar, setShowSelectionToolbar] = useState(false);
  const [selectionToolbarPosition, setSelectionToolbarPosition] = useState({ top: 0, left: 0 });
  const [selectedTextRange, setSelectedTextRange] = useState<Range | null>(null);

  const [imageToolbarState, setImageToolbarState] = useState<{
      visible: boolean;
      target: HTMLImageElement | null;
      position: { top: number; left: number };
  }>({ visible: false, target: null, position: { top: 0, left: 0 } });

  const editorRef = useRef<HTMLDivElement>(null);
  const selectionToolbarRef = useRef<HTMLDivElement>(null);
  const autoSaveTimerRef = useRef<number | null>(null);
  const imageUploadRef = useRef<HTMLInputElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const isRestoring = useRef(false);
  const autoSaveKey = `autosave-draft-${blogId || 'new'}`;

  const fetchAdminManagedCategoriesForChips = useCallback(async () => {
    try {
        const cats = await categoryService.fetchCategories();
        setAdminManagedCategories(cats.map((c: any) => c.name));
    } catch (error) {
        addToast({ message: "Could not load categories.", type: 'error' });
    }
  }, [addToast]);

  const loadBlogData = useCallback(async () => {
    if (!blogId || !user) {
        setIsFetchingBlog(false);
        return;
    }
    setIsFetchingBlog(true);
    try {
        const post = await blogService.fetchBlog(blogId);
        if (post && (post.authorId === user.id || user.role === 'admin')) {
          setPostToEdit(post);
          setTitle(post.title);
          setContent(post.content); 
          setMetaDescription(post.metaDescription || '');
          setPostType(post.postType || 'blog');
          setAudioUrl(post.audioUrl || '');
          setSelectedTags(Array.isArray(post.tags) ? post.tags : []); 
          setStatus(post.status);
          setFeaturedImage(post.featuredImage || '');
          setScheduledPublishTime(post.scheduledPublishTime ? new Date(post.scheduledPublishTime).toISOString().slice(0, 16) : '');
        } else if (post) {
            addToast({ message: 'You are not authorized to edit this post.', type: 'error'});
            navigate('/dashboard');
        } else {
            addToast({ message: 'Blog post not found.', type: 'error'});
            navigate('/404');
        }
    } catch (error) {
        addToast({ message: 'Failed to load blog post for editing.', type: 'error' });
    }
    setIsFetchingBlog(false);
  }, [blogId, user, navigate, addToast]);

  useEffect(() => {
    fetchAdminManagedCategoriesForChips();
    if (blogId) {
        loadBlogData();
    } else {
        if (initialData) {
            setTitle(initialData.title);
            setContent(initialData.content);
        } else {
            const queryParams = new URLSearchParams(location.search);
            const suggestedTitle = queryParams.get('title');
            if (suggestedTitle) setTitle(suggestedTitle);
        }
    }
  }, [blogId, initialData, location.search, loadBlogData, fetchAdminManagedCategoriesForChips]);

  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  useEffect(() => {
    if (!blogId && !isRestoring.current) {
        const savedDraftJson = localStorage.getItem(autoSaveKey);
        if (savedDraftJson) {
            isRestoring.current = true;
            const savedDraft = JSON.parse(savedDraftJson);
            if (savedDraft.title || savedDraft.content) {
                 if (window.confirm("An unsaved draft was found. Do you want to restore it?")) {
                    setTitle(savedDraft.title || '');
                    setContent(savedDraft.content || '');
                    setMetaDescription(savedDraft.metaDescription || '');
                    setSelectedTags(savedDraft.selectedTags || []);
                    setFeaturedImage(savedDraft.featuredImage || '');
                    setPostType(savedDraft.postType || 'blog');
                    setAudioUrl(savedDraft.audioUrl || '');
                    addToast({ message: "Draft restored.", type: 'info' });
                }
            }
        }
    }
  }, [blogId, autoSaveKey, addToast]);

  useEffect(() => {
    if (isFetchingBlog) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = window.setTimeout(() => {
        if (blogId) return;
        const currentContent = editorRef.current?.innerHTML || content;
        const isContentEmpty = !currentContent || currentContent === '<p><br></p>' || currentContent.trim() === '';
        if (title || !isContentEmpty) {
            const draftData = { title, content: currentContent, metaDescription, selectedTags, featuredImage, postType, audioUrl };
            localStorage.setItem(autoSaveKey, JSON.stringify(draftData));
        }
    }, AUTOSAVE_INTERVAL);
    return () => { if(autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current); }
  }, [title, content, metaDescription, selectedTags, featuredImage, postType, audioUrl, autoSaveKey, blogId, isFetchingBlog]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        if (showSelectionToolbar && selectionToolbarRef.current && !selectionToolbarRef.current.contains(target)) {
            setTimeout(() => setShowSelectionToolbar(false), 100);
        }
        if (imageToolbarState.visible) {
             const editorNode = editorRef.current;
             const isClickOnImageToolbar = (event.target as Element)?.closest('[role="toolbar"]');
             if (isClickOnImageToolbar) return;

             if (editorNode && !editorNode.contains(target)) {
                 setImageToolbarState(s => ({ ...s, visible: false, target: null }));
             }
             if (editorNode && editorNode.contains(target) && target !== imageToolbarState.target) {
                  setImageToolbarState(s => ({ ...s, visible: false, target: null }));
             }
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSelectionToolbar, imageToolbarState.visible, imageToolbarState.target]);

  const applyEditorFormat = useCallback((command: string, value?: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, value);
      const newHtml = editorRef.current.innerHTML;
      if (content !== newHtml) setContent(newHtml);
    }
  }, [content]);
  
  const handleInsertLink = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.toString().length === 0) {
        addToast({ message: "Please select text to create a link.", type: 'warning' });
        return;
    }
    const url = prompt("Enter the URL:");
    if (url) {
        const safeUrl = (url.startsWith('http://') || url.startsWith('https://')) ? url : `https://${url}`;
        applyEditorFormat('createLink', safeUrl);
    }
  }, [addToast, applyEditorFormat]);

  const handleContentEditableInput = (e: React.FormEvent<HTMLDivElement>) => {
    setContent(e.currentTarget.innerHTML);
  };
  
   useEffect(() => {
        const editorNode = editorRef.current;
        if (!editorNode) return;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey || event.metaKey) {
                let prevented = true;
                switch (event.key.toLowerCase()) {
                    case 'b': applyEditorFormat('bold'); break;
                    case 'i': applyEditorFormat('italic'); break;
                    case 'u': applyEditorFormat('underline'); break;
                    case 'k': handleInsertLink(); break;
                    default: prevented = false;
                }
                if(prevented) event.preventDefault();
            }
        };
        editorNode.addEventListener('keydown', handleKeyDown);
        return () => editorNode.removeEventListener('keydown', handleKeyDown);
    }, [applyEditorFormat, handleInsertLink]);

  const handleTextSelection = useCallback(() => {
    if (imageToolbarState.visible) return; // Don't show text toolbar if image toolbar is active
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && !selection.getRangeAt(0).collapsed) {
        const range = selection.getRangeAt(0);
        const text = range.toString().trim();
        if (text.length > 0 && editorRef.current?.contains(range.commonAncestorContainer)) {
            setSelectedTextRange(range.cloneRange());
            const rect = range.getBoundingClientRect();
            if (editorRef.current) {
                 const editorRect = editorRef.current.getBoundingClientRect();
                 setSelectionToolbarPosition({ 
                    top: rect.top - editorRect.top - 50,
                    left: rect.left - editorRect.left + (rect.width / 2)
                });
                setShowSelectionToolbar(true);
            }
        } else {
             setShowSelectionToolbar(false);
        }
    } else {
        setShowSelectionToolbar(false);
    }
  }, [imageToolbarState.visible]);

  const replaceSelectedText = (newText: string) => {
      if (selectedTextRange) {
          selectedTextRange.deleteContents();
          selectedTextRange.insertNode(document.createTextNode(newText));
          if(editorRef.current) setContent(editorRef.current.innerHTML);
      }
      setShowSelectionToolbar(false);
      setSelectedTextRange(null);
  };

  const handleGetAiSuggestions = async () => {
    const currentContentForAI = editorRef.current?.innerHTML || content;
    if (!currentContentForAI.trim() && !title.trim()) {
      addToast({ message: 'Please write some content or a title first.', type: 'warning' });
      return;
    }
    setLoadingSuggestions(true);
    try {
      const suggestions = await geminiService.getContentSuggestions(title, currentContentForAI);
      setAiSuggestions(suggestions);
    } catch (error) {
      addToast({ message: 'Failed to get AI suggestions.', type: 'error' });
    }
    setLoadingSuggestions(false);
  };

  const applySuggestion = (suggestionText: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('insertHTML', false, `<p>${suggestionText}</p>`);
      setContent(editorRef.current.innerHTML);
      setAiSuggestions([]);
    }
  };

  const handleGenerateMetaDescription = async () => {
    const currentContentForAI = editorRef.current?.innerHTML || content;
    if (!currentContentForAI.trim() || !title.trim()) {
        addToast({ message: 'A title and content are needed.', type: 'warning' });
        return;
    }
    setLoadingMeta(true);
    try {
        const description = await geminiService.generateMetaDescription(title, currentContentForAI);
        setMetaDescription(description);
        addToast({ message: 'Meta description generated!', type: 'success' });
    } catch (error) {
        addToast({ message: 'Failed to generate meta description.', type: 'error' });
    }
    setLoadingMeta(false);
  };

  const handleGenerateFeaturedImage = async () => {
    if (!title.trim()) {
      addToast({ message: 'Please provide a title to generate an image.', type: 'warning' });
      return;
    }
    setLoadingImage(true);
    try {
      const currentContentForPrompt = editorRef.current?.innerText || "";
      const promptText = title + (currentContentForPrompt ? (": " + currentContentForPrompt.substring(0,100)) : "");
      const generated: GeneratedImage | null = await geminiService.generateFeaturedImage(promptText);
      if (generated?.base64Image) {
        setFeaturedImage(generated.base64Image);
        setFeaturedImageFile(null); 
        addToast({ message: 'Featured image generated!', type: 'success' });
      } else {
        addToast({ message: 'Could not generate featured image.', type: 'warning' });
      }
    } catch (error) {
      addToast({ message: 'Error generating image.', type: 'error' });
    }
    setLoadingImage(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setLoadingImage(true);
        setFeaturedImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setFeaturedImage(reader.result as string);
            setLoadingImage(false);
        };
        reader.readAsDataURL(file);
    }
  };

  const triggerImageUploadToContent = () => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) savedRangeRef.current = selection.getRangeAt(0).cloneRange();
      else savedRangeRef.current = null;
      imageUploadRef.current?.click();
  };

  const handleImageUploadToContent = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editorRef.current) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64Image = reader.result as string;
            
            const container = document.createElement('div');
            container.className = 'img-container align-center size-full';
            container.contentEditable = 'false';
            const img = document.createElement('img');
            img.src = base64Image;
            img.alt = 'User uploaded content';
            container.appendChild(img);

            const newPara = document.createElement('p');
            newPara.innerHTML = '<br>';

            const editorNode = editorRef.current!;
            editorNode.focus();
            
            const selection = window.getSelection();
            if (selection && savedRangeRef.current) {
                selection.removeAllRanges();
                selection.addRange(savedRangeRef.current);
            }
            
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                const fragment = document.createDocumentFragment();
                fragment.appendChild(container);
                fragment.appendChild(newPara);
                range.insertNode(fragment);
                
                range.setStart(newPara, 0);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
            }

            setContent(editorNode.innerHTML);
            if (e.target) e.target.value = '';
        };
        reader.readAsDataURL(file);
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target instanceof HTMLImageElement) {
          const imgElement = e.target;
          const container = imgElement.parentElement;
          if (container && container.classList.contains('img-container')) {
              e.preventDefault();
              const rect = container.getBoundingClientRect();
              setImageToolbarState({
                  visible: true,
                  target: imgElement,
                  position: {
                      top: rect.top + window.scrollY - 50,
                      left: rect.left + window.scrollX + rect.width / 2,
                  }
              });
              setShowSelectionToolbar(false);
          }
      }
  };

  const handleImageResize = (size: 'sm' | 'md' | 'full') => {
      if (!imageToolbarState.target) return;
      const container = imageToolbarState.target.parentElement;
      if (container) {
          container.classList.remove('size-sm', 'size-md', 'size-full');
          container.classList.add(`size-${size}`);
          setContent(editorRef.current?.innerHTML || '');
      }
  };

  const handleImageAlign = (alignment: 'left' | 'center' | 'right') => {
      if (!imageToolbarState.target) return;
      const container = imageToolbarState.target.parentElement;
      if (container) {
          container.classList.remove('align-left', 'align-center', 'align-right');
          container.classList.add(`align-${alignment}`);
          setContent(editorRef.current?.innerHTML || '');
      }
  };

  const handleImageDelete = () => {
      if (!imageToolbarState.target) return;
      const container = imageToolbarState.target.parentElement;
      if (container) {
          container.remove();
          setContent(editorRef.current?.innerHTML || '');
          setImageToolbarState({ visible: false, target: null, position: {top:0, left:0} });
      }
  };


  const handleApplyOutlineToContent = (outlineHtml: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      const separator = editorRef.current.innerHTML && editorRef.current.innerHTML !== '<p><br></p>' ? '<br>' : ''; 
      document.execCommand('insertHTML', false, separator + outlineHtml);
      setContent(editorRef.current.innerHTML);
      setShowOutlineGenerator(false);
    }
  };

  const toggleTagSelection = (tagToToggle: string) => {
    setSelectedTags(prev => prev.includes(tagToToggle) ? prev.filter(t => t !== tagToToggle) : [...prev, tagToToggle]);
  };

  const handleAddCustomTag = () => {
    const newTagName = customTagInput.trim();
    if (newTagName && !selectedTags.some(t => t.toLowerCase() === newTagName.toLowerCase())) {
      setSelectedTags(prev => [...prev, newTagName]);
    }
    setCustomTagInput('');
  };

  const handleSubmit = async (e: React.FormEvent, newStatus: 'draft' | 'published' | 'scheduled') => {
    e.preventDefault();
    if (!user) { addToast({ message: 'You must be logged in.', type: 'error' }); return; }
    
    const currentContent = editorRef.current?.innerHTML || content;
    if (!title.trim() || (!currentContent.trim() || currentContent === '<p><br></p>')) {
      addToast({ message: 'Title and content are required.', type: 'warning' }); return;
    }
    if (selectedTags.length === 0) {
        addToast({ message: 'Please select or add at least one category/tag.', type: 'warning'}); return;
    }
    if (newStatus === 'scheduled' && !scheduledPublishTime) {
        addToast({ message: 'Please set a publish time for scheduled posts.', type: 'warning'}); return;
    }
    
    setLoading(true);
    const postData = {
      title,
      content: currentContent,
      categories: selectedTags,
      featuredImage: featuredImage || DEFAULT_FEATURED_IMAGE,
      metaDescription,
      postType,
      audioUrl,
      published: newStatus !== 'draft',
    } as any;

    try {
      
      const savedPost = blogId ? await blogService.updateBlog(blogId, postData) : await blogService.createBlog(postData);
      localStorage.removeItem(autoSaveKey);
      addToast({ message: `Post ${blogId ? 'updated' : 'created'} as ${newStatus}!`, type: 'success' });
      navigate(`/blog/${savedPost.id}`);
    } catch (error: any) {
      let errorMsg = `Failed to ${blogId ? 'update' : 'create'} post.`;
      if (error?.response?.data?.message) {
        errorMsg += ` ${error.response.data.message}`;
      } else if (error?.message) {
        errorMsg += ` ${error.message}`;
      }
      addToast({ message: errorMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };


if (isFetchingBlog) return <LoadingSpinner message="Loading blog data..." />;
if (!user) return <p>Please log in to create or edit posts.</p>;

const ToolbarButton: React.FC<React.PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>> = ({ children, ...props }) => (
  <button type="button" {...props} className="p-2 text-brand-text-muted dark:text-brand-text-muted-dark hover:bg-gray-500/10 dark:hover:bg-white/5 rounded-md focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-accent dark:focus-visible:ring-brand-accent-dark transition-colors">
    {children}
  </button>
);

const EditorToolbar = () => (
  <div className="flex flex-wrap items-center gap-1 mb-2 p-1.5 border border-brand-border dark:border-brand-border-dark rounded-t-lg bg-brand-bg dark:bg-brand-surface-dark sticky top-20 z-10">
      <ToolbarButton onClick={() => applyEditorFormat('formatBlock', '<h1>')} title="Heading 1"><strong className="text-sm">H1</strong></ToolbarButton>
      <ToolbarButton onClick={() => applyEditorFormat('formatBlock', '<h2>')} title="Heading 2"><strong className="text-sm">H2</strong></ToolbarButton>
      <ToolbarButton onClick={() => applyEditorFormat('formatBlock', '<h3>')} title="Heading 3"><strong className="text-sm">H3</strong></ToolbarButton>
      <ToolbarButton onClick={() => applyEditorFormat('formatBlock', '<h4>')} title="Heading 4"><strong className="text-sm">H4</strong></ToolbarButton>
      <ToolbarButton onClick={() => applyEditorFormat('formatBlock', '<blockquote>')} title="Blockquote"><ChatBubbleBottomCenterTextIcon className="h-5 w-5" /></ToolbarButton>
      <ToolbarButton onClick={() => applyEditorFormat('formatBlock', '<pre>')} title="Code Block"><CodeBracketIcon className="h-5 w-5" /></ToolbarButton>
      <div className="w-px h-6 bg-brand-border dark:bg-brand-border-dark mx-1"></div>
      <ToolbarButton onClick={() => applyEditorFormat('bold')} title="Bold (Ctrl+B)" className="font-bold">B</ToolbarButton>
      <ToolbarButton onClick={() => applyEditorFormat('italic')} title="Italic (Ctrl+I)" className="italic">I</ToolbarButton>
      <ToolbarButton onClick={() => applyEditorFormat('underline')} title="Underline (Ctrl+U)" className="underline">U</ToolbarButton>
      <ToolbarButton onClick={() => applyEditorFormat('strikeThrough')} title="Strikethrough"><span className="line-through">S</span></ToolbarButton>
      <ToolbarButton onClick={() => applyEditorFormat('backColor', '#fef08a')} title="Highlight Text"><SparklesIcon className="h-5 w-5 text-yellow-500" /></ToolbarButton>
      <div className="w-px h-6 bg-brand-border dark:bg-brand-border-dark mx-1"></div>
      <ToolbarButton onClick={() => applyEditorFormat('insertUnorderedList')} title="Bulleted List"><ListBulletIcon className="h-5 w-5" /></ToolbarButton>
      <ToolbarButton onClick={() => applyEditorFormat('insertOrderedList')} title="Numbered List"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12M8.25 17.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg></ToolbarButton>
      <div className="w-px h-6 bg-brand-border dark:bg-brand-border-dark mx-1"></div>
      <ToolbarButton onClick={handleInsertLink} title="Insert Link (Ctrl+K)"><LinkIcon className="h-5 w-5" /></ToolbarButton>
      <ToolbarButton onClick={triggerImageUploadToContent} title="Insert Image"><PhotoIcon className="h-5 w-5" /></ToolbarButton>
      <ToolbarButton onClick={() => applyEditorFormat('insertHorizontalRule')} title="Horizontal Rule"><MinusIcon className="h-5 w-5" /></ToolbarButton>
      <div className="w-px h-6 bg-brand-border dark:bg-brand-border-dark mx-1"></div>
      <ToolbarButton onClick={() => applyEditorFormat('removeFormat')} title="Clear Formatting"><NoSymbolIcon className="h-5 w-5" /></ToolbarButton>
  </div>
);



  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <input 
        type="file" 
        ref={imageUploadRef} 
        onChange={handleImageUploadToContent} 
        className="hidden" 
        accept="image/*"
      />
      {/* Main Content Column */}
      <div className="lg:col-span-8 space-y-6">
          <div className="p-4 bg-brand-surface dark:bg-brand-surface-dark border border-brand-border dark:border-brand-border-dark rounded-lg shadow-sm">
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post Title"
              className="w-full text-2xl lg:text-3xl font-bold bg-transparent text-brand-text dark:text-brand-text-dark placeholder-brand-text-muted dark:placeholder-brand-text-muted-dark focus:outline-none"
              required
            />
          </div>

          <div className="relative bg-brand-surface dark:bg-brand-surface-dark border border-brand-border dark:border-brand-border-dark rounded-lg shadow-sm">
            <label htmlFor="content-editor" className="sr-only">Content</label>
            {showSelectionToolbar && (
                <SelectionToolbar
                    ref={selectionToolbarRef}
                    position={selectionToolbarPosition}
                    onAction={replaceSelectedText}
                    selectedTextRange={selectedTextRange}
                    onFormat={applyEditorFormat}
                    onLink={handleInsertLink}
                />
            )}
            {imageToolbarState.visible && (
              <ImageToolbar
                position={imageToolbarState.position}
                onDelete={handleImageDelete}
                onAlign={handleImageAlign}
                onResize={handleImageResize}
              />
            )}
            <EditorToolbar />
            <div
              ref={editorRef}
              id="content-editor"
              contentEditable={true}
              onInput={handleContentEditableInput}
              onMouseUp={handleTextSelection}
              onTouchEnd={handleTextSelection}
              onClick={handleImageClick}
              data-placeholder="Start writing your story here..."
              className="prose prose-lg dark:prose-invert max-w-none w-full min-h-[400px] p-4 text-brand-text dark:text-brand-text-dark focus:outline-none overflow-y-auto"
              aria-label="Blog content editor"
              role="textbox"
              aria-multiline="true"
            />
          </div>
          
          <div className="p-4 border border-brand-accent/20 dark:border-brand-accent-dark/20 rounded-lg bg-brand-accent/5 dark:bg-brand-accent-dark/5">
            <Button type="button" onClick={handleGetAiSuggestions} isLoading={loadingSuggestions} variant="ghost" leftIcon={<LightBulbIcon className="h-5 w-5"/>} className="!text-brand-accent dark:!text-brand-accent-dark hover:!bg-brand-accent/10 dark:hover:!bg-brand-accent-dark/10">
              Get AI Content Suggestions
            </Button>
            {loadingSuggestions && <p className="text-sm text-brand-accent dark:text-brand-accent-dark mt-2">Fetching suggestions...</p>}
            {aiSuggestions.length > 0 && (
              <div className="mt-3 space-y-2">
                <h4 className="text-sm font-medium text-brand-text-muted dark:text-brand-text-muted-dark">Suggestions:</h4>
                {aiSuggestions.map((s, index) => (
                  <div key={index} className="p-2 bg-brand-surface dark:bg-brand-surface-dark rounded-lg shadow-sm text-sm text-brand-text-muted dark:text-brand-text-muted-dark flex justify-between items-center border border-brand-border dark:border-brand-border-dark">
                    <span>{s.suggestion}</span>
                    <Button size="sm" variant="secondary" onClick={() => applySuggestion(s.suggestion)}>Apply</Button>
                  </div>
                ))}
              </div>
            )}
          </div>
      </div>

      {/* Sidebar Column */}
      <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 self-start max-h-[calc(100vh-7rem)] overflow-y-auto fancy-scrollbar pr-2">
          <div className="p-4 bg-brand-surface dark:bg-brand-surface-dark border border-brand-border dark:border-brand-border-dark rounded-lg shadow-sm space-y-4">
            <h3 className="text-lg font-semibold text-brand-text dark:text-brand-text-dark border-b pb-3 border-brand-border dark:border-brand-border-dark">Publish Actions</h3>
            <div>
                <label htmlFor="status" className="block text-sm font-medium text-brand-text-muted dark:text-brand-text-muted-dark">Status</label>
                <select id="status" value={status} onChange={(e) => setStatus(e.target.value as any)} className="mt-1 block w-full pl-3 pr-10 py-2 border-brand-border dark:border-brand-border-dark bg-brand-surface dark:bg-brand-surface-dark text-brand-text dark:text-brand-text-dark focus:outline-none focus:ring-1 focus:ring-offset-1 dark:focus:ring-offset-brand-surface-dark focus:ring-brand-accent dark:focus:ring-brand-accent-dark sm:text-sm rounded-lg">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
                {status === 'scheduled' && (
                  <div className="mt-2">
                    <label htmlFor="scheduledPublishTime" className="block text-sm font-medium text-brand-text-muted dark:text-brand-text-muted-dark">Publish Time</label>
                    <input type="datetime-local" id="scheduledPublishTime" value={scheduledPublishTime} onChange={(e) => setScheduledPublishTime(e.target.value)} className="mt-1 block w-full py-2 border-brand-border dark:border-brand-border-dark bg-brand-surface dark:bg-brand-surface-dark text-brand-text dark:text-brand-text-dark focus:outline-none focus:ring-1 focus:ring-offset-1 dark:focus:ring-offset-brand-surface-dark focus:ring-brand-accent dark:focus:ring-brand-accent-dark sm:text-sm rounded-lg" />
                  </div>
                )}
            </div>
            <div className="flex flex-col gap-3 pt-4 border-t border-brand-border dark:border-brand-border-dark">
                <Button type="button" onClick={(e) => handleSubmit(e, 'draft')} isLoading={loading} variant="secondary">Save Draft</Button>
                <Button type="button" onClick={(e) => handleSubmit(e, status === 'draft' ? 'published' : status)} isLoading={loading} variant="primary">
                  {status === 'published' ? 'Update Post' : 'Publish'}
                </Button>
            </div>
          </div>
          
          <div className="p-4 bg-brand-surface dark:bg-brand-surface-dark border border-brand-border dark:border-brand-border-dark rounded-lg shadow-sm space-y-4">
              <h3 className="text-lg font-semibold text-brand-text dark:text-brand-text-dark">Post Settings</h3>
              <div>
                  <label className="block text-sm font-medium text-brand-text-muted dark:text-brand-text-muted-dark">Post Type</label>
                  <select value={postType} onChange={(e) => setPostType(e.target.value as PostType)} className="mt-1 block w-full pl-3 pr-10 py-2 border-brand-border dark:border-brand-border-dark bg-brand-surface dark:bg-brand-surface-dark text-brand-text dark:text-brand-text-dark focus:outline-none focus:ring-1 focus:ring-offset-1 dark:focus:ring-offset-brand-surface-dark focus:ring-brand-accent dark:focus:ring-brand-accent-dark sm:text-sm rounded-lg">
                    <option value="blog">Blog</option> <option value="article">Article</option> <option value="podcast">Podcast</option>
                  </select>
              </div>
               {postType === 'podcast' && (
                  <div>
                      <label htmlFor="audioUrl" className="block text-sm font-medium text-brand-text-muted dark:text-brand-text-muted-dark">Podcast URL</label>
                      <input type="url" id="audioUrl" value={audioUrl} onChange={(e) => setAudioUrl(e.target.value)} className="mt-1 block w-full py-2 border-brand-border dark:border-brand-border-dark bg-brand-surface dark:bg-brand-surface-dark text-brand-text dark:text-brand-text-dark focus:outline-none focus:ring-1 focus:ring-offset-1 dark:focus:ring-offset-brand-surface-dark focus:ring-brand-accent dark:focus:ring-brand-accent-dark sm:text-sm rounded-lg"/>
                  </div>
                )}
          </div>
          
          <div className="p-4 bg-brand-surface dark:bg-brand-surface-dark border border-brand-border dark:border-brand-border-dark rounded-lg shadow-sm space-y-3">
              <h3 className="text-lg font-semibold text-brand-text dark:text-brand-text-dark">Featured Image</h3>
              {loadingImage ? (<div className="flex justify-center items-center h-48 bg-brand-bg dark:bg-brand-bg-dark rounded-lg"><LoadingSpinner message="Loading..." /></div>) : (featuredImage && <img src={featuredImage} alt="Featured" className="w-full max-h-48 object-cover rounded-lg shadow-sm" onError={(e) => { e.currentTarget.src=DEFAULT_FEATURED_IMAGE }}/>)}
              <div className="flex flex-col sm:flex-row gap-3">
                  <Button type="button" onClick={handleGenerateFeaturedImage} isLoading={loadingImage} variant="ghost" size="sm" leftIcon={<SparklesIcon className="h-4 w-4"/>} className="!text-brand-accent dark:!text-brand-accent-dark hover:!bg-brand-accent/10 dark:hover:!bg-brand-accent-dark/10 flex-1 justify-center">AI Generate</Button>
                  <label htmlFor="image-upload" className="w-full flex-1"><span className="flex items-center justify-center w-full h-full px-3 py-1.5 text-sm font-semibold text-brand-accent bg-brand-accent/10 hover:bg-brand-accent/20 border border-brand-accent/20 dark:border-brand-accent-dark/20 dark:bg-brand-accent-dark/10 dark:text-brand-accent-dark dark:hover:bg-brand-accent-dark/20 active:scale-95 rounded-lg shadow-sm cursor-pointer"><PhotoIcon className="h-4 w-4 mr-2"/>Upload</span><input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" /></label>
              </div>
          </div>
          
          <div className="p-4 bg-brand-surface dark:bg-brand-surface-dark border border-brand-border dark:border-brand-border-dark rounded-lg shadow-sm space-y-3">
              <h3 className="text-lg font-semibold text-brand-text dark:text-brand-text-dark">Categories / Tags</h3>
              {selectedTags.length > 0 && (<div className="flex flex-wrap gap-2 mb-2">{selectedTags.map(tag => (<span key={tag} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-brand-accent/10 text-brand-accent dark:bg-brand-accent-dark/10 dark:text-brand-accent-dark">{tag}<button type="button" onClick={() => setSelectedTags(p => p.filter(t => t !== tag))} className="ml-1.5 flex-shrink-0 text-brand-accent/70 hover:text-brand-accent focus:outline-none"><XMarkIcon className="h-3.5 w-3.5" /></button></span>))}</div>)}
              {adminManagedCategories.length > 0 && (<div className="mb-3"><p className="text-xs text-brand-text-muted dark:text-brand-text-muted-dark mb-1.5">Select a category:</p><div className="flex flex-wrap gap-2">{adminManagedCategories.map(cat => (<button type="button" key={cat} onClick={() => toggleTagSelection(cat)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors shadow-sm border ${selectedTags.includes(cat) ? 'bg-brand-accent text-white border-brand-accent' : 'bg-brand-bg dark:bg-brand-surface-dark text-brand-text dark:text-brand-text-dark hover:bg-gray-100/50 dark:hover:bg-gray-700/50 border-brand-border dark:border-brand-border-dark'}`}>{cat}</button>))}</div></div>)}
              <div className="flex items-end gap-3"><div className="flex-grow"><label htmlFor="customTagInput" className="text-xs text-brand-text-muted dark:text-brand-text-muted-dark">Add a tag:</label><input type="text" id="customTagInput" value={customTagInput} onChange={e => setCustomTagInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomTag(); } }} className="mt-1 block w-full py-2 border-brand-border dark:border-brand-border-dark bg-brand-surface dark:bg-brand-surface-dark text-brand-text dark:text-brand-text-dark rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-accent sm:text-sm"/></div><Button type="button" onClick={handleAddCustomTag} variant="secondary" className="!px-4">Add</Button></div>
          </div>
          
          <div className="p-4 bg-brand-surface dark:bg-brand-surface-dark border border-brand-border dark:border-brand-border-dark rounded-lg shadow-sm space-y-2">
              <h3 className="text-lg font-semibold text-brand-text dark:text-brand-text-dark">SEO Settings</h3>
              <label htmlFor="metaDescription" className="block text-sm font-medium text-brand-text-muted dark:text-brand-text-muted-dark">Meta Description</label>
              <textarea id="metaDescription" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} maxLength={160} rows={3} className="mt-1 block w-full p-2 border-brand-border dark:border-brand-border-dark bg-brand-surface dark:bg-brand-surface-dark text-brand-text dark:text-brand-text-dark rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-accent sm:text-sm"/>
              <div className="flex justify-between items-center"><Button type="button" onClick={handleGenerateMetaDescription} isLoading={loadingMeta} variant="ghost" size="sm" leftIcon={<SparklesIcon className="h-4 w-4"/>} className="!text-brand-accent dark:!text-brand-accent-dark">Generate</Button><p className="text-xs text-brand-text-muted dark:text-brand-text-muted-dark">{metaDescription.length} / 160</p></div>
          </div>
          
          <div className="p-4 bg-brand-surface dark:bg-brand-surface-dark border border-brand-border dark:border-brand-border-dark rounded-lg shadow-sm space-y-2">
            <Button type="button" onClick={() => setShowOutlineGenerator(!showOutlineGenerator)} variant="ghost" leftIcon={<QueueListIcon className="h-5 w-5"/>} className="w-full justify-start !text-purple-600 dark:!text-purple-400" aria-expanded={showOutlineGenerator}>{showOutlineGenerator ? 'Hide' : 'Show'} AI Post Outline Generator</Button>
            {showOutlineGenerator && (<AiPostOutlineGenerator onApplyOutline={handleApplyOutlineToContent} initialTitle={title}/>)}
          </div>
      </aside>
    </div>
  );
};



import React, { useState, useRef } from 'react';
import { BlogEditor } from '../components/Blog/BlogEditor';
import { AiFirstDraft } from '../types';
import Button from '../components/Common/Button';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { useNotification } from '../contexts/NotificationContext';
import { geminiService } from '../services/geminiService';
import { SparklesIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

const CreateBlogPage: React.FC = () => {
  const [generatedDraft, setGeneratedDraft] = useState<AiFirstDraft | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [topic, setTopic] = useState('');
  const [editorKey, setEditorKey] = useState(Date.now());
  const { addToast } = useNotification();
  const editorSectionRef = useRef<HTMLDivElement>(null);

  const handleGenerateDraft = async () => {
    if (!topic.trim()) {
      addToast({ message: 'Please enter a topic to generate a draft.', type: 'warning' });
      return;
    }
    setIsGenerating(true);
    setGeneratedDraft(null);
    try {
      const draft = await geminiService.generateFirstDraft(topic);
      setGeneratedDraft(draft);
      addToast({ message: 'AI draft generated! You can now edit it below.', type: 'success' });
      // Change key of editor to force re-mount with new initial data
      setEditorKey(Date.now());
      setTimeout(() => {
        editorSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200); // Small delay to allow re-render before scrolling
    } catch (error) {
      addToast({ message: 'Failed to generate AI draft. Please try again.', type: 'error' });
    }
    setIsGenerating(false);
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-brand-accent to-blue-400 dark:from-brand-accent-dark dark:to-cyan-600 text-white p-6 sm:p-8 rounded-xl shadow-lg">
        <div className="flex items-center gap-4 mb-3">
            <SparklesIcon className="h-8 w-8" />
            <h1 className="text-3xl sm:text-4xl font-bold">AI Kickstart</h1>
        </div>
        <p className="text-blue-100 dark:text-cyan-100 mb-4 max-w-2xl">
          Staring at a blank page? Enter a topic and let our AI create a complete first draft for you, including a title, introduction, structured sections, and a conclusion.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
            <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., 'The Future of Remote Work' or 'Beginner's Guide to Sourdough'"
            className="flex-grow block w-full px-4 py-3 border border-transparent bg-white/20 placeholder-blue-100/80 dark:placeholder-cyan-100/80 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-white/80 focus:border-transparent sm:text-md text-white"
            />
            <Button 
                onClick={handleGenerateDraft} 
                isLoading={isGenerating} 
                disabled={isGenerating} 
                variant="secondary" 
                className="!bg-white hover:!bg-blue-100 !text-brand-accent !font-bold !py-3 !px-5"
                size="lg"
            >
            {isGenerating ? 'Generating...' : 'Generate First Draft'}
            </Button>
        </div>
        {isGenerating && <p className="text-sm mt-3 text-blue-100 dark:text-cyan-100 animate-pulse">Brewing up a creative first draft...</p>}
      </div>
      
      <div ref={editorSectionRef} className="pt-4">
        <header className="flex items-start gap-3 sm:gap-4 mb-6">
          <PencilSquareIcon className="h-7 w-7 sm:h-8 sm:w-8 text-brand-text dark:text-brand-text-dark flex-shrink-0 mt-1" />
          <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-brand-text dark:text-brand-text-dark">Blog Editor</h2>
              <p className="text-brand-text-muted dark:text-brand-text-muted-dark mt-1">
                  {generatedDraft ? "Review and edit the AI-generated draft below, or start from scratch." : "Craft your masterpiece here."}
              </p>
          </div>
        </header>
        
        <BlogEditor 
          key={editorKey} 
          initialData={generatedDraft}
        />
      </div>
    </div>
  );
};

export default CreateBlogPage;

import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from '../../services/geminiService';
import { SparklesIcon, ChevronDownIcon, LinkIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from '../Common/LoadingSpinner';

interface SelectionToolbarProps {
  position: { top: number; left: number };
  onAction: (newText: string) => void;
  onFormat: (command: string, value?: string) => void;
  onLink: () => void;
  selectedTextRange: Range | null;
}

type Tone = 'professional' | 'casual' | 'witty' | 'confident';

const SelectionToolbar = React.forwardRef<HTMLDivElement, SelectionToolbarProps>(
  ({ position, onAction, onFormat, onLink, selectedTextRange }, ref) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showAiMenu, setShowAiMenu] = useState<boolean>(false);
    const aiMenuRef = useRef<HTMLDivElement>(null);

    const getSelectedText = (): string => {
        return selectedTextRange ? selectedTextRange.toString() : '';
    }

    const handleAiAction = async (action: 'improve' | { type: 'tone', tone: Tone } | 'summarize') => {
      const selectedText = getSelectedText();
      if (!selectedText) return;

      setIsLoading(true);
      setShowAiMenu(false); // Close menu after selection
      try {
        let result = '';
        if (action === 'improve') {
          result = await geminiService.improveWriting(selectedText);
        } else if (typeof action === 'object' && action.type === 'tone') {
          result = await geminiService.changeTone(selectedText, action.tone);
        } else if (action === 'summarize') {
          result = await geminiService.summarizeSelection(selectedText);
        }
        onAction(result);
      } catch (error) {
        console.error('AI Toolbar action failed', error);
      } finally {
        setIsLoading(false);
      }
    };
    
     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (aiMenuRef.current && !aiMenuRef.current.contains(event.target as Node)) {
                setShowAiMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const ToolbarButton = ({ children, ...props }: React.PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>) => (
        <button {...props} className="px-2.5 py-1.5 text-sm hover:bg-slate-700 text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed">
            {children}
        </button>
    );

    if (isLoading) {
      return (
        <div ref={ref} style={{ top: `${position.top}px`, left: `${position.left}px`, transform: 'translateX(-50%)' }} className="absolute z-[95] bg-slate-800 text-white px-3 py-2 rounded-md shadow-lg flex items-center">
            <LoadingSpinner size="sm" />
            <span className="ml-2 text-sm">AI is working...</span>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        style={{ top: `${position.top}px`, left: `${position.left}px`, transform: 'translateX(-50%)' }}
        className="absolute z-[95] bg-slate-800 text-slate-100 rounded-md shadow-lg flex items-center"
      >
        {/* Formatting Buttons */}
        <ToolbarButton onClick={() => onFormat('bold')} title="Bold"><strong>B</strong></ToolbarButton>
        <ToolbarButton onClick={() => onFormat('italic')} title="Italic"><em>I</em></ToolbarButton>
        <div className="w-px h-5 bg-slate-600 mx-1"></div>
        <ToolbarButton onClick={() => onFormat('formatBlock', '<h2>')} title="Heading 2">H2</ToolbarButton>
        <ToolbarButton onClick={() => onFormat('formatBlock', '<h3>')} title="Heading 3">H3</ToolbarButton>
        <ToolbarButton onClick={onLink} title="Insert Link"><LinkIcon className="h-4 w-4" /></ToolbarButton>
        
        {/* AI Buttons - only show if selection is long enough */}
        {getSelectedText().length > 10 && (
            <>
                <div className="w-px h-5 bg-slate-600 mx-1"></div>
                <div className="relative" ref={aiMenuRef}>
                    <button className="px-3 py-1.5 hover:bg-slate-700 text-sm flex items-center" onClick={() => setShowAiMenu(!showAiMenu)}>
                        <SparklesIcon className="h-4 w-4 mr-1.5 text-purple-400" />
                        Ask AI
                        <ChevronDownIcon className="h-4 w-4 ml-1" />
                    </button>
                    {showAiMenu && (
                        <div className="absolute bottom-full mb-1 right-0 bg-slate-700 rounded-md shadow-lg text-left overflow-hidden w-32">
                            <button className="block w-full text-left px-3 py-1.5 text-sm hover:bg-slate-600" onClick={() => handleAiAction('improve')}>Improve</button>
                            <button className="block w-full text-left px-3 py-1.5 text-sm hover:bg-slate-600" onClick={() => handleAiAction('summarize')}>Summarize</button>
                            <div className="border-t border-slate-600 my-1"></div>
                            {(['professional', 'casual', 'witty', 'confident'] as Tone[]).map(tone => (
                                <button key={tone} className="block w-full text-left px-3 py-1.5 text-sm hover:bg-slate-600" onClick={() => handleAiAction({ type: 'tone', tone })}>
                                    Make {tone}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </>
        )}
      </div>
    );
  }
);

export default SelectionToolbar;
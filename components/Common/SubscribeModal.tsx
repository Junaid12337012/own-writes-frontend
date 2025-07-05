import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Button from './Button';
import { useNotification } from '../../contexts/NotificationContext';

interface SubscribeModalProps {
  onClose: () => void;
}

const SubscribeModal: React.FC<SubscribeModalProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      addToast({ message: 'Please enter a valid email address.', type: 'warning' });
      return;
    }
    setLoading(true);
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    addToast({ message: `Successfully subscribed ${email}! (Mock)`, type: 'success' });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-brand-bg-dark bg-opacity-75 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-brand-surface dark:bg-brand-surface-dark p-6 sm:p-8 rounded-xl shadow-xl w-full max-w-md relative transform transition-all duration-300 ease-out scale-100 border border-brand-border dark:border-brand-border-dark">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-brand-text-muted dark:text-brand-text-muted-dark hover:text-brand-text dark:hover:text-brand-text-dark transition-colors"
          aria-label="Close subscribe modal"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-bold text-brand-text dark:text-brand-text-dark mb-2 text-center">Subscribe to Our Newsletter!</h2>
        <p className="text-brand-text-muted dark:text-brand-text-muted-dark mb-6 text-center text-sm">Get the latest posts and updates delivered straight to your inbox.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="subscribe-email" className="sr-only">Email address</label>
            <input
              ref={inputRef}
              id="subscribe-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="appearance-none block w-full px-3.5 py-2.5 border border-brand-border dark:border-brand-border-dark bg-brand-surface dark:bg-brand-surface-dark placeholder-brand-text-muted dark:placeholder-brand-text-muted-dark text-brand-text dark:text-brand-text-dark rounded-lg focus:outline-none focus:ring-1 focus:ring-offset-1 dark:focus:ring-offset-brand-surface-dark focus:ring-brand-accent dark:focus:ring-brand-accent-dark focus:border-brand-accent dark:focus:border-brand-accent-dark sm:text-sm"
            />
          </div>
          <Button type="submit" className="w-full" isLoading={loading} disabled={loading} size="md">
            {loading ? 'Subscribing...' : 'Subscribe Now'}
          </Button>
        </form>
        <p className="text-xs text-brand-text-muted dark:text-brand-text-muted-dark text-center mt-4">We respect your privacy. Unsubscribe at any time (mock).</p>
      </div>
    </div>
  );
};

export default SubscribeModal;
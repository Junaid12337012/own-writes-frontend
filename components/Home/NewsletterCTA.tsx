
import React, { useState } from 'react';
import Button from '../Common/Button';
import { useNotification } from '../../contexts/NotificationContext';
import { EnvelopeIcon } from '@heroicons/react/24/outline';

const NewsletterCTA: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useNotification();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      addToast({ message: 'Please enter a valid email address.', type: 'warning' });
      return;
    }
    setLoading(true);
    // Mock API call
    setTimeout(() => {
      setLoading(false);
      addToast({ message: `Thank you for subscribing, ${email}! (Mock)`, type: 'success' });
      setEmail('');
    }, 1200);
  };

  return (
    <section className="my-16 py-12 bg-gradient-to-r from-brand-accent to-blue-500 dark:from-brand-accent-dark dark:to-cyan-600 rounded-xl shadow-lg text-white">
      <div className="container mx-auto px-6 text-center">
        <EnvelopeIcon className="h-12 w-12 mx-auto mb-4" />
        <h2 className="text-3xl font-extrabold mb-2">Stay Ahead of the Curve</h2>
        <p className="text-blue-100 dark:text-cyan-200 mb-6 max-w-xl mx-auto">
          Subscribe to our newsletter to get the latest articles, podcasts, and insights delivered straight to your inbox. No spam, ever.
        </p>
        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            className="flex-grow w-full px-4 py-3 border border-transparent bg-white/20 placeholder-blue-100/80 dark:placeholder-cyan-100/80 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-white/80 focus:border-transparent sm:text-md text-white"
            required
            aria-label="Email for newsletter"
          />
          <Button
            type="submit"
            isLoading={loading}
            disabled={loading}
            size="lg"
            className="!bg-white hover:!bg-blue-100 !text-brand-accent !font-bold"
          >
            Subscribe
          </Button>
        </form>
      </div>
    </section>
  );
};

export default NewsletterCTA;

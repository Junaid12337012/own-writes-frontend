

import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { APP_NAME } from '../../constants';
import LogoImg from '../../Logo/LOGO.png';
import Button from '../Common/Button';
import { useNotification } from '../../contexts/NotificationContext';
// Using a generic ShareIcon as specific brand icons are not in heroicons/outline.
import { ShareIcon } from '@heroicons/react/24/outline'; 

const Footer: React.FC = () => {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const { addToast } = useNotification();

  const socialLinks = [
    { name: 'Twitter', href: '#', icon: ShareIcon }, 
    { name: 'Facebook', href: '#', icon: ShareIcon },
    { name: 'Instagram', href: '#', icon: ShareIcon },
  ];
  
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      addToast({ message: 'Please enter a valid email.', type: 'warning' });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      addToast({ message: 'Thanks for subscribing! (Mock)', type: 'success' });
      setEmail('');
    }, 1000);
  };

  return (
    <footer className="bg-brand-surface dark:bg-brand-surface-dark text-brand-text-muted dark:text-brand-text-muted-dark border-t border-brand-border dark:border-brand-border-dark mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-10">
          
          <div className="md:col-span-4">
            <div className="mb-4">
              {/* Light mode logo */}
              <img src={LogoImg} alt={APP_NAME + ' logo'} className="h-12 md:h-14 w-auto block dark:hidden" />
              {/* Dark mode logo (inverted) */}
              <img src={LogoImg} alt={APP_NAME + ' logo dark'} className="h-12 md:h-14 w-auto hidden dark:block filter invert" />
            </div>
            <p className="text-sm mb-6 pr-4">
              Explore the world through stories. AI-powered tools for modern creators and adventurers.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  aria-label={item.name}
                  className="hover:text-brand-accent dark:hover:text-brand-accent-dark transition-colors"
                >
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
          
          <div className="md:col-span-2">
            <h4 className="text-sm font-display font-semibold text-brand-text dark:text-brand-text-dark uppercase tracking-wider mb-4">Explore</h4>
            <ul className="space-y-3">
              <li><ReactRouterDOM.Link to="/podcasts" className="text-sm hover:text-brand-accent dark:hover:text-brand-accent-dark transition-colors">Podcasts</ReactRouterDOM.Link></li>
              <li><ReactRouterDOM.Link to="/blogs" className="text-sm hover:text-brand-accent dark:hover:text-brand-accent-dark transition-colors">Blogs</ReactRouterDOM.Link></li>
              <li><ReactRouterDOM.Link to="/categories" className="text-sm hover:text-brand-accent dark:hover:text-brand-accent-dark transition-colors">Categories</ReactRouterDOM.Link></li> 
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-sm font-display font-semibold text-brand-text dark:text-brand-text-dark uppercase tracking-wider mb-4">About</h4>
            <ul className="space-y-3">
              <li><ReactRouterDOM.Link to="/about" className="text-sm hover:text-brand-accent dark:hover:text-brand-accent-dark transition-colors">About Us</ReactRouterDOM.Link></li>
              <li><ReactRouterDOM.Link to="/contact" className="text-sm hover:text-brand-accent dark:hover:text-brand-accent-dark transition-colors">Contact</ReactRouterDOM.Link></li>
              <li><ReactRouterDOM.Link to="/faq" className="text-sm hover:text-brand-accent dark:hover:text-brand-accent-dark transition-colors">FAQ</ReactRouterDOM.Link></li>
            </ul>
          </div>
          
          <div className="md:col-span-4">
            <h4 className="text-sm font-display font-semibold text-brand-text dark:text-brand-text-dark uppercase tracking-wider mb-4">Stay Connected</h4>
            <p className="text-sm mb-4">
              Get the latest stories, podcasts, and updates from us.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address" 
                className="flex-grow w-full px-3 py-2 border border-brand-border dark:border-brand-border-dark bg-brand-bg dark:bg-brand-bg-dark text-brand-text dark:text-brand-text-dark rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent dark:focus:ring-brand-accent-dark focus:border-transparent text-sm"
                required
              />
              <Button type="submit" isLoading={loading} size="md" className="sm:w-auto w-full justify-center">Subscribe</Button>
            </form>
          </div>

        </div>

        <div className="border-t border-brand-border dark:border-brand-border-dark pt-8 mt-8 text-center">
          <p className="text-xs">
            &copy; {new Date().getFullYear()} {APP_NAME}. All Rights Reserved. This is a mock application for demonstration.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
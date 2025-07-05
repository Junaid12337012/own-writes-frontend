
import React, { useState } from 'react';
import { APP_NAME } from '../constants';
import { QuestionMarkCircleIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface FAQItemProps {
  question: string;
  children: React.ReactNode; // Answer
  isOpenInitially?: boolean;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, children, isOpenInitially = false }) => {
  const [isOpen, setIsOpen] = useState(isOpenInitially);

  return (
    <div className="border-b border-brand-border dark:border-brand-border-dark">
      <dt>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between text-left text-brand-text-muted dark:text-brand-text-muted-dark group p-6"
          aria-expanded={isOpen}
        >
          <span className="text-lg font-medium text-brand-text dark:text-brand-text-dark">{question}</span>
          <span className="ml-6 flex h-7 items-center">
            <ChevronDownIcon 
              className={`h-6 w-6 text-brand-text-muted dark:text-brand-text-muted-dark group-hover:text-brand-accent dark:group-hover:text-brand-accent-dark transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
              aria-hidden="true" 
            />
          </span>
        </button>
      </dt>
      <dd className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-screen' : 'max-h-0'}`}>
        <div className="px-6 pb-6">
          <div className="prose prose-base dark:prose-invert max-w-none text-brand-text-muted dark:text-brand-text-muted-dark leading-relaxed">
            {children}
          </div>
        </div>
      </dd>
    </div>
  );
};

const FaqPage: React.FC = () => {
  return (
    <div className="bg-brand-bg dark:bg-brand-bg-dark -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto py-10">
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-brand-accent/10 dark:bg-brand-surface-dark rounded-full mb-4">
            <QuestionMarkCircleIcon className="h-12 w-12 text-brand-accent dark:text-brand-accent-dark" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-brand-text dark:text-brand-text-dark">
            Frequently Asked Questions
          </h1>
          <p className="mt-3 text-lg text-brand-text-muted dark:text-brand-text-muted-dark max-w-2xl mx-auto">
            Find answers to common questions about {APP_NAME}. If you can't find what you're looking for, feel free to contact us.
          </p>
        </header>

        <div className="bg-brand-surface dark:bg-brand-surface-dark rounded-xl shadow-xl overflow-hidden border border-brand-border dark:border-brand-border-dark">
          <dl className="divide-y-0">
            <FAQItem question={`What is ${APP_NAME}?`} isOpenInitially={true}>
              <p>{APP_NAME} is a modern blogging platform designed to help you create, share, and discover amazing content. We leverage AI tools to enhance your writing experience.</p>
            </FAQItem>

            <FAQItem question="How do I create an account?">
              <p>You can create an account by clicking the "Sign Up" button in the navigation bar. You'll need to provide a username, email address, and password. Alternatively, you can use mock Google Sign-In for a quicker setup.</p>
            </FAQItem>

            <FAQItem question="Can I use AI to help write my blog posts?">
              <p>Yes! {APP_NAME} integrates with Google's Gemini models to offer several AI-powered features, including:</p>
              <ul>
                <li>Content suggestions to help you overcome writer's block.</li>
                <li>Generating featured images based on your post title or content.</li>
                <li>Creating blog post outlines based on a topic.</li>
                <li>Generating blog post ideas if you're looking for inspiration.</li>
              </ul>
              <p>Look for the AI-related buttons and features within the blog editor and dashboard.</p>
            </FAQItem>

            <FAQItem question="Is this platform free to use?">
              <p>Yes! {APP_NAME} is a completely free platform for writers and readers. Our goal is to provide a space for creativity and knowledge-sharing without barriers. All features, including our AI-powered tools, are available to all users at no cost.</p>
            </FAQItem>

            <FAQItem question="How is my data handled?">
              <p>Please refer to our <a href="#/privacy" className="text-brand-accent dark:text-brand-accent-dark hover:underline">Privacy Policy</a> for detailed information on how we collect, use, and protect your data. Since this is a mock application, data is primarily stored in your browser's local storage for persistence during your session and for demo purposes.</p>
            </FAQItem>
            
            <FAQItem question="What kind of content can I post?">
              <p>You can post a wide variety of content, from personal stories and technical articles to tutorials and opinion pieces. Please ensure your content adheres to our <a href="#/terms" className="text-brand-accent dark:text-brand-accent-dark hover:underline">Terms of Service</a> and community guidelines (which would be more detailed in a real application).</p>
            </FAQItem>
          </dl>
        </div>
        
        <div className="mt-12 text-center p-8 bg-brand-surface dark:bg-brand-surface-dark rounded-xl shadow-lg border border-brand-border dark:border-brand-border-dark">
          <h3 className="text-xl font-semibold text-brand-text dark:text-brand-text-dark">Still have questions?</h3>
          <p className="mt-2 text-brand-text-muted dark:text-brand-text-muted-dark">
            If you can't find the answer you're looking for, please don't hesitate to reach out to our support team.
          </p>
          <a
            href="#/contact"
            className="mt-4 inline-block text-brand-accent dark:text-brand-accent-dark font-semibold hover:underline"
          >
            Contact Support &rarr;
          </a>
        </div>
      </div>
    </div>
  );
};

export default FaqPage;
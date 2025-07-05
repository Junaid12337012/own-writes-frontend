
import React from 'react';
import { APP_NAME } from '../constants';
import { Link } from 'react-router-dom';
import Button from '../components/Common/Button';
import { BuildingStorefrontIcon, UsersIcon, SparklesIcon, HeartIcon, LightBulbIcon } from '@heroicons/react/24/outline';

// Feature card component for "Our Values"
const FeatureCard: React.FC<{ icon: React.ElementType; title: string; children: React.ReactNode }> = ({ icon: Icon, title, children }) => (
  <div className="bg-brand-bg dark:bg-brand-surface-dark/50 p-6 rounded-lg text-center transform transition-transform duration-300 hover:scale-105">
    <div className="flex justify-center items-center mb-4">
      <div className="bg-brand-accent/10 dark:bg-brand-surface-dark p-3 rounded-full">
        <Icon className="h-8 w-8 text-brand-accent dark:text-brand-accent-dark" />
      </div>
    </div>
    <h3 className="text-xl font-semibold text-brand-text dark:text-brand-text-dark mb-2">{title}</h3>
    <p className="text-brand-text-muted dark:text-brand-text-muted-dark text-sm">{children}</p>
  </div>
);

// Team Member card component (placeholder)
const TeamMemberCard: React.FC<{ name: string; role: string; imageUrl: string }> = ({ name, role, imageUrl }) => (
  <div className="text-center">
    <img className="mx-auto h-24 w-24 rounded-full object-cover mb-4" src={imageUrl} alt={name} />
    <h3 className="text-lg font-medium text-brand-text dark:text-brand-text-dark">{name}</h3>
    <p className="text-brand-accent dark:text-brand-accent-dark text-sm">{role}</p>
  </div>
);


const AboutPage: React.FC = () => {
  return (
    <div className="bg-brand-bg dark:bg-brand-bg-dark -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto py-10">
        <header className="text-center mb-16">
          <p className="text-base font-semibold text-brand-accent dark:text-brand-accent-dark uppercase tracking-wider">Our Story</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-brand-text dark:text-brand-text-dark mt-2">
            Crafting the Future of Digital Publishing
          </h1>
          <p className="mt-4 text-lg text-brand-text-muted dark:text-brand-text-muted-dark max-w-2xl mx-auto">
            {APP_NAME} is more than just a platform; it's a community dedicated to empowering creators through innovative technology and beautiful design.
          </p>
        </header>

        <div className="bg-brand-surface dark:bg-brand-surface-dark p-8 sm:p-10 rounded-2xl shadow-xl mb-16 border border-brand-border dark:border-brand-border-dark">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl font-bold text-brand-text dark:text-brand-text-dark mb-4 flex items-center">
                <SparklesIcon className="h-8 w-8 text-brand-accent dark:text-brand-accent-dark mr-3" />
                Our Mission
              </h2>
              <div className="prose prose-lg dark:prose-invert max-w-none text-brand-text-muted dark:text-brand-text-muted-dark">
                <p>
                  Our mission is to empower creators by providing a seamless, intuitive, and AI-enhanced blogging experience. We believe that everyone has a story to tell, and technology should make that process easier, not harder.
                </p>
                <p>
                  We're passionate about leveraging cutting-edge AI to assist with content creation, spark new ideas, and make your posts shine. {APP_NAME} is designed to be your trusted partner in the digital world.
                </p>
              </div>
            </div>
            <div className="hidden md:block">
              <img src="https://picsum.photos/seed/about-mission/500/500" alt="Team working collaboratively" className="rounded-lg shadow-md" />
            </div>
          </div>
        </div>

        <section className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-brand-text dark:text-brand-text-dark">Our Core Values</h2>
            <p className="mt-2 text-md text-brand-text-muted dark:text-brand-text-muted-dark">The principles that guide our work and our community.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard icon={LightBulbIcon} title="Innovation">We constantly explore new technologies to provide the best tools for our creators.</FeatureCard>
            <FeatureCard icon={UsersIcon} title="Community">We foster a supportive and collaborative environment for all our users.</FeatureCard>
            <FeatureCard icon={HeartIcon} title="User-Centric Design">Our platform is built with you in mind, prioritizing ease of use and a beautiful experience.</FeatureCard>
          </div>
        </section>

        <section className="bg-brand-surface dark:bg-brand-surface-dark p-8 sm:p-10 rounded-2xl shadow-xl mb-16 border border-brand-border dark:border-brand-border-dark">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-brand-text dark:text-brand-text-dark">Meet Our Team (Placeholder)</h2>
            <p className="mt-2 text-md text-brand-text-muted dark:text-brand-text-muted-dark">The passionate individuals building {APP_NAME}.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <TeamMemberCard name="AdminUser" role="Founder & CEO" imageUrl="https://picsum.photos/seed/admin/200" />
            <TeamMemberCard name="EditorAlice" role="Head of Content" imageUrl="https://picsum.photos/seed/alice/200" />
            <TeamMemberCard name="UserBob" role="Lead Developer" imageUrl="https://picsum.photos/seed/bob/200" />
            <TeamMemberCard name="Charlie" role="UX/UI Designer" imageUrl="https://picsum.photos/seed/charlie/200" />
          </div>
        </section>


        <section className="text-center bg-gradient-to-r from-brand-accent to-blue-500 dark:from-brand-accent-dark dark:to-cyan-600 p-10 rounded-2xl">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Share Your Story?
          </h2>
          <p className="text-lg text-blue-100 dark:text-cyan-100 mb-8 max-w-xl mx-auto">
            Join our growing community of bloggers and start creating engaging content today. Explore our features and see how {APP_NAME} can elevate your blogging journey.
          </p>
          <div className="space-x-4">
            <Link to="/blogs">
              <Button variant="secondary" size="lg" className="!bg-white hover:!bg-blue-100 !text-brand-accent !font-bold">Explore Content</Button>
            </Link>
            <Link to="/signup">
              <Button variant="ghost" size="lg" className="!bg-transparent hover:!bg-white/20 !text-white !border-white !border">Get Started</Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
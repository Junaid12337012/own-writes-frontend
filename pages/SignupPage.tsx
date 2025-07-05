
import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Common/Button';
import { APP_NAME } from '../constants';
import { useNotification } from '../contexts/NotificationContext';
import { UserPlusIcon } from '@heroicons/react/24/outline';


const SignupPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = ReactRouterDOM.useNavigate();
  const { addToast } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      addToast({ message: "Passwords do not match!", type: 'error' });
      return;
    }
    setLoading(true);
    const success = await signup(username, email, password);
    setLoading(false);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-[calc(100vh-15rem)] flex items-center justify-center bg-transparent py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-brand-surface dark:bg-brand-surface-dark p-8 sm:p-10 rounded-xl shadow-xl border border-brand-border dark:border-brand-border-dark">
        <div className="text-center">
          <UserPlusIcon className="mx-auto h-10 w-10 text-brand-accent dark:text-brand-accent-dark" />
          <h2 className="mt-5 text-center text-3xl font-display font-bold text-brand-text dark:text-brand-text-dark">
            Create your account for {APP_NAME}
          </h2>
          <p className="mt-2 text-center text-sm text-brand-text-muted dark:text-brand-text-muted-dark">
            Already have an account?{' '}
            <ReactRouterDOM.Link to="/login" className="font-medium text-brand-accent dark:text-brand-accent-dark hover:text-brand-accent/80 dark:hover:text-brand-accent-dark/80 hover:underline">
              Sign in
            </ReactRouterDOM.Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-lg shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="appearance-none rounded-none relative block w-full px-3.5 py-2.5 border border-brand-border dark:border-brand-border-dark bg-brand-surface dark:bg-brand-surface-dark placeholder-brand-text-muted dark:placeholder-brand-text-muted-dark text-brand-text dark:text-brand-text-dark rounded-t-lg focus:outline-none focus:ring-1 focus:ring-brand-accent dark:focus:ring-brand-accent-dark focus:border-brand-accent dark:focus:border-brand-accent-dark focus:z-10 sm:text-sm"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3.5 py-2.5 border border-brand-border dark:border-brand-border-dark bg-brand-surface dark:bg-brand-surface-dark placeholder-brand-text-muted dark:placeholder-brand-text-muted-dark text-brand-text dark:text-brand-text-dark focus:outline-none focus:ring-1 focus:ring-brand-accent dark:focus:ring-brand-accent-dark focus:border-brand-accent dark:focus:border-brand-accent-dark focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password_DO_NOT_USE" className="sr-only">Password</label>
              <input
                id="password_DO_NOT_USE"
                name="password_DO_NOT_USE"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3.5 py-2.5 border border-brand-border dark:border-brand-border-dark bg-brand-surface dark:bg-brand-surface-dark placeholder-brand-text-muted dark:placeholder-brand-text-muted-dark text-brand-text dark:text-brand-text-dark focus:outline-none focus:ring-1 focus:ring-brand-accent dark:focus:ring-brand-accent-dark focus:border-brand-accent dark:focus:border-brand-accent-dark focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3.5 py-2.5 border border-brand-border dark:border-brand-border-dark bg-brand-surface dark:bg-brand-surface-dark placeholder-brand-text-muted dark:placeholder-brand-text-muted-dark text-brand-text dark:text-brand-text-dark rounded-b-lg focus:outline-none focus:ring-1 focus:ring-brand-accent dark:focus:ring-brand-accent-dark focus:border-brand-accent dark:focus:border-brand-accent-dark focus:z-10 sm:text-sm"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full" isLoading={loading} disabled={loading} size="md">
              Create Account
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
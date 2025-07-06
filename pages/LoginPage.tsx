import React, { useState } from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import * as authService from '../services/authService';
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Common/Button';
import { APP_NAME } from '../constants';
import { LockClosedIcon } from '@heroicons/react/24/outline';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, setAuth } = useAuth();
  const navigate = ReactRouterDOM.useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await login(email, password);
    setLoading(false);
    navigate('/dashboard');
  };

  const handleGoogleSuccess = async (cred: CredentialResponse) => {
    if (!cred.credential) return;
    setGoogleLoading(true);
    try {
      const { user, token } = await authService.googleLogin(cred.credential);
      setAuth({ ...user, id: user._id }, token);
      navigate('/dashboard');
    } catch (err) {
      console.error('Google login failed', err);
    }
    setGoogleLoading(false);
  };

  const handleGoogleError = () => {
    console.error('Google login error');
  };

  return (
    <div className="min-h-[calc(100vh-15rem)] flex items-center justify-center bg-transparent py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-brand-surface dark:bg-brand-surface-dark p-8 sm:p-10 rounded-xl shadow-xl border border-brand-border dark:border-brand-border-dark">
        <div className="text-center">
          <LockClosedIcon className="mx-auto h-10 w-10 text-brand-accent dark:text-brand-accent-dark" />
          <h2 className="mt-5 text-center text-3xl font-display font-bold text-brand-text dark:text-brand-text-dark">
            Sign in to {APP_NAME}
          </h2>
          <p className="mt-2 text-center text-sm text-brand-text-muted dark:text-brand-text-muted-dark">
            Or{' '}
            <ReactRouterDOM.Link to="/signup" className="font-medium text-brand-accent dark:text-brand-accent-dark hover:text-brand-accent/80 dark:hover:text-brand-accent-dark/80 hover:underline">
              create a new account
            </ReactRouterDOM.Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-lg shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3.5 py-2.5 border border-brand-border dark:border-brand-border-dark bg-brand-surface dark:bg-brand-surface-dark placeholder-brand-text-muted dark:placeholder-brand-text-muted-dark text-brand-text dark:text-brand-text-dark rounded-t-lg focus:outline-none focus:ring-1 focus:ring-brand-accent dark:focus:ring-brand-accent-dark focus:border-brand-accent dark:focus:border-brand-accent-dark focus:z-10 sm:text-sm"
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
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3.5 py-2.5 border border-brand-border dark:border-brand-border-dark bg-brand-surface dark:bg-brand-surface-dark placeholder-brand-text-muted dark:placeholder-brand-text-muted-dark text-brand-text dark:text-brand-text-dark rounded-b-lg focus:outline-none focus:ring-1 focus:ring-brand-accent dark:focus:ring-brand-accent-dark focus:border-brand-accent dark:focus:border-brand-accent-dark focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-brand-accent dark:text-brand-accent-dark focus:ring-brand-accent border-brand-border dark:border-brand-border-dark rounded bg-brand-bg dark:bg-brand-surface"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-brand-text dark:text-brand-text-dark">
                Remember me
              </label>
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full" isLoading={loading} disabled={loading || googleLoading} size="md">
              Sign in
            </Button>
          </div>
        </form>
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-brand-border dark:border-brand-border-dark" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-brand-surface dark:bg-brand-surface-dark text-brand-text-muted dark:text-brand-text-muted-dark">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <div className="w-full flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                width="100%"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as authService from '../services/authService';

// -------------------- Types --------------------

interface User {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  profilePictureUrl?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setAuth: (user: User, token: string) => void;
  followAuthor: (authorId: string) => Promise<void>;
  unfollowAuthor: (authorId: string) => Promise<void>;
  updateUserContext: (newUser: User) => void;
  loading: boolean;
}

// -------------------- Context --------------------

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// -------------------- Provider --------------------

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Load saved auth on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // -------------------- Core Actions --------------------

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { user, token } = await authService.login(email, password);
      // Ensure user object includes role and is always up to date
      if (!user || !user.role) {
        throw new Error('User object missing role.');
      }
      setToken(token);
    // Always use _id as id for consistency
    const safeUser = { ...user, id: user._id, profilePictureUrl: user.profilePictureUrl };
    setUser(safeUser);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(safeUser));
    console.log('Logged in successfully as', user.role);
    } catch (err) {
      console.log('Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    setLoading(true);
    try {
      await authService.signup(username, email, password);
      await login(email, password);
    } catch (err) {
      console.log('Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('Logged out.');
  };




  const updateUserContext = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  // -------------------- Follow/Unfollow --------------------

  const followAuthor = async (authorId: string) => {
    if (!user) {
      console.log('You must be logged in to follow authors.');
      return;
    }
    if (user._id === authorId) {
      console.log('You cannot follow yourself.');
      return;
    }
    try {
      // Placeholder: Simulate following author
      console.log(`Pretend to follow author with id: ${authorId}`);
      updateUserContext(user);
      console.log('You are now following this author!');
    } catch (error) {
      console.log('Failed to follow author.');
    }
  };

  const unfollowAuthor = async (authorId: string) => {
    if (!user) return;
    try {
      // Placeholder: Simulate unfollowing author
      console.log(`Pretend to unfollow author with id: ${authorId}`);
      updateUserContext(user);
      console.log('You have unfollowed this author.');
    } catch (error) {
      console.log('Failed to unfollow author.');
    }
  };

  // -------------------- Provide Context --------------------

  const setAuth = (user: User, token: string) => {
    if (user && !('profilePictureUrl' in user)) {
      // fallback to default if backend omitted
      (user as any).profilePictureUrl = '';
    }
    setUser(user);
    setToken(token);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        signup,
        logout,
        setAuth,
        followAuthor,
        unfollowAuthor,
        updateUserContext,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// -------------------- useAuth Hook --------------------

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

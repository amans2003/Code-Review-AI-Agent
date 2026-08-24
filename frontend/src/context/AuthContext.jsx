import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from stored token on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.auth.getMe();
        if (res.success) {
          // Merge stored extended profile if available
          const stored = JSON.parse(localStorage.getItem('userProfile') || '{}');
          setUser({ ...res.user, ...stored });
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('userProfile');
        }
      } catch (err) {
        console.error('Session restoration failed:', err.message);
        localStorage.removeItem('token');
        localStorage.removeItem('userProfile');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Login by providing a GitHub profile URL.
   * No OAuth required — uses the GitHub public API.
   */
  const loginWithGithubUrl = async (profileUrl) => {
    setLoading(true);
    try {
      const res = await api.auth.loginWithGithubUrl(profileUrl);
      if (res.success) {
        localStorage.setItem('token', res.token);
        // Store extended profile data (bio, stats, etc.)
        const profile = {
          githubName: res.user.githubName,
          bio: res.user.bio,
          publicRepos: res.user.publicRepos,
          followers: res.user.followers,
          following: res.user.following,
          githubUrl: res.user.githubUrl
        };
        localStorage.setItem('userProfile', JSON.stringify(profile));
        setUser(res.user);
        return { success: true };
      }
      return { success: false, error: res.message || 'Authentication failed' };
    } catch (err) {
      console.error('Login With GitHub URL failed:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Demo login — instant access without a real GitHub profile
   */
  const loginWithDemo = async () => {
    setLoading(true);
    try {
      const res = await api.auth.demoLogin();
      if (res.success) {
        localStorage.setItem('token', res.token);
        const profile = {
          githubName: res.user.githubName,
          bio: res.user.bio,
          publicRepos: res.user.publicRepos,
          followers: res.user.followers,
          following: res.user.following,
          githubUrl: res.user.githubUrl
        };
        localStorage.setItem('userProfile', JSON.stringify(profile));
        setUser(res.user);
        return { success: true };
      }
      return { success: false, error: 'Authentication failed' };
    } catch (err) {
      console.error('Demo Login failed:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userProfile');
    setUser(null);
  };

  const value = {
    user,
    loading,
    loginWithGithubUrl,
    loginWithDemo,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

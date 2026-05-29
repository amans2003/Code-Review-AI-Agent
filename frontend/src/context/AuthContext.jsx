import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
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
          setUser(res.user);
        } else {
          localStorage.removeItem('token');
        }
      } catch (err) {
        console.error('Session restoration failed:', err.message);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const loginWithDemo = async () => {
    setLoading(true);
    try {
      const res = await api.auth.demoLogin();
      if (res.success) {
        localStorage.setItem('token', res.token);
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

  const loginWithToken = async (token) => {
    setLoading(true);
    try {
      localStorage.setItem('token', token);
      const res = await api.auth.getMe();
      if (res.success) {
        setUser(res.user);
        return { success: true };
      }
      localStorage.removeItem('token');
      return { success: false, error: 'Token validation failed' };
    } catch (err) {
      localStorage.removeItem('token');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    loginWithDemo,
    loginWithToken,
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

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Github, Play, Terminal, AlertCircle } from 'lucide-react';

const Login = () => {
  const { loginWithToken, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle OAuth callback token parsing
  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const err = searchParams.get('error');
      
      if (err) {
        setErrorMsg('GitHub authentication failed. Please try again.');
        return;
      }

      if (token) {
        setLoading(true);
        const res = await loginWithToken(token);
        if (res.success) {
          navigate('/dashboard');
        } else {
          setErrorMsg(res.error || 'Failed to authenticate token.');
        }
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams]);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated && !searchParams.get('token')) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  const handleGithubLogin = () => {
    setLoading(true);
    let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    if (API_URL.endsWith('/')) {
      API_URL = API_URL.slice(0, -1);
    }
    window.location.href = `${API_URL}/api/auth/github`;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel p-8 border border-borderDark/40 relative">
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600/10 border border-indigo-500/30 mb-2">
            <Terminal className="h-6 w-6 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Access Review Portal</h2>
          <p className="text-xs text-slate-500">Sign in with GitHub to scan codebases and discuss optimization suggestions.</p>
        </div>

        {errorMsg && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-4 py-3 rounded-lg flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* GitHub Auth Button */}
          <button
            onClick={handleGithubLogin}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 bg-white text-slate-900 hover:bg-slate-100 disabled:opacity-50 font-semibold text-sm py-3 rounded-lg transition-all"
          >
            <Github className="h-4 w-4 fill-current" />
            <span>{loading ? 'Authenticating...' : 'Sign in with GitHub'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;

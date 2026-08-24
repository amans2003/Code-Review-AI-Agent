import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Github, Terminal, AlertCircle, ArrowRight, Loader2, Play, User, Star, GitFork } from 'lucide-react';

const Login = () => {
  const { loginWithGithubUrl, loginWithDemo, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [profileUrl, setProfileUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // If already authenticated, go to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profileUrl.trim()) {
      setErrorMsg('Please enter your GitHub profile URL.');
      return;
    }

    // Basic URL validation
    if (!profileUrl.toLowerCase().includes('github.com/')) {
      setErrorMsg('Please enter a valid GitHub profile URL (e.g. https://github.com/username)');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const res = await loginWithGithubUrl(profileUrl.trim());
    if (res.success) {
      navigate('/dashboard');
    } else {
      setErrorMsg(res.error || 'Failed to fetch GitHub profile. Please check the URL and try again.');
    }
    setLoading(false);
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    setErrorMsg('');
    const res = await loginWithDemo();
    if (res.success) {
      navigate('/dashboard');
    } else {
      setErrorMsg(res.error || 'Demo login failed.');
    }
    setDemoLoading(false);
  };

  const exampleUsers = [
    { login: 'torvalds', label: 'torvalds', desc: 'Linux Kernel' },
    { login: 'gaearon', label: 'gaearon', desc: 'React Core' },
    { login: 'yyx990803', label: 'yyx990803', desc: 'Vue.js' }
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="w-full max-w-lg space-y-6">
        {/* Card */}
        <div className="glass-panel p-8 border border-borderDark/40 relative overflow-hidden">
          {/* Card glow accent */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />

          {/* Header */}
          <div className="text-center space-y-3 mb-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/10 border border-indigo-500/30 mb-1">
              <Github className="h-6 w-6 text-indigo-400" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              Access Review Portal
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
              Enter your GitHub profile URL to load your public repositories and start reviewing your codebase — no OAuth required.
            </p>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-4 py-3 rounded-lg flex items-start space-x-2 animate-fadeIn">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="github-url" className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                GitHub Profile URL
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                  <Github className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  id="github-url"
                  type="text"
                  value={profileUrl}
                  onChange={(e) => { setProfileUrl(e.target.value); setErrorMsg(''); }}
                  placeholder="https://github.com/your-username"
                  disabled={loading}
                  className="w-full bg-[#0a0d14] border border-borderDark/60 focus:border-indigo-500 rounded-lg pl-10 pr-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none transition-colors disabled:opacity-50 font-mono"
                />
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading || demoLoading}
              className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm py-3 rounded-lg transition-all shadow-neon group"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Fetching GitHub Profile...</span>
                </>
              ) : (
                <>
                  <span>Load My Repositories</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center space-x-3 my-6">
            <div className="flex-1 h-px bg-borderDark/40" />
            <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest">or try without an account</span>
            <div className="flex-1 h-px bg-borderDark/40" />
          </div>

          {/* Demo Login */}
          <button
            id="demo-login-btn"
            onClick={handleDemoLogin}
            disabled={loading || demoLoading}
            className="w-full flex items-center justify-center space-x-2 border border-borderDark/60 hover:border-slate-600 bg-slate-900/40 hover:bg-slate-900/70 text-slate-300 hover:text-white font-semibold text-sm py-3 rounded-lg transition-all disabled:opacity-50"
          >
            {demoLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Launching Demo...</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 text-emerald-400" />
                <span>Try Demo Dashboard</span>
              </>
            )}
          </button>
        </div>

        {/* Quick fill examples */}
        <div className="glass-panel border border-borderDark/30 p-4 space-y-3">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Quick Examples — click to fill</p>
          <div className="grid grid-cols-3 gap-2">
            {exampleUsers.map((u) => (
              <button
                key={u.login}
                onClick={() => { setProfileUrl(`https://github.com/${u.login}`); setErrorMsg(''); }}
                className="text-left p-2.5 rounded-lg bg-[#0a0d14] border border-borderDark/40 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all group"
              >
                <div className="flex items-center space-x-1.5 mb-1">
                  <Github className="h-3 w-3 text-indigo-400" />
                  <span className="text-[10px] font-bold text-slate-300 group-hover:text-indigo-300 transition-colors font-mono">{u.label}</span>
                </div>
                <p className="text-[9px] text-slate-600">{u.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Info note */}
        <p className="text-center text-[10px] text-slate-600 leading-relaxed px-2">
          Only your <span className="text-slate-500">public repositories</span> are fetched. No GitHub account permissions are requested. Your session is stored locally.
        </p>
      </div>
    </div>
  );
};

export default Login;

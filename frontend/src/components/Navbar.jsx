import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Terminal, LogOut, Code, User, Menu, X, HelpCircle } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-borderDark/40 bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Branding Logo */}
        <Link to="/" className="flex items-center space-x-3 group" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600/10 border border-indigo-500/30 group-hover:border-indigo-400 group-hover:bg-indigo-600/20 transition-all duration-300">
            <Terminal className="h-5 w-5 text-indigo-400" />
          </div>
          <span className="text-sm font-mono font-bold tracking-tight text-indigo-400">
            code_review_agent<span className="text-slate-200">:$~</span><span className="text-emerald-400 animate-pulse">_</span>
          </span>
        </Link>

        {/* User profile & Actions */}
        <div className="flex items-center space-x-3">
          {/* Support button with pop-down dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsSupportOpen(!isSupportOpen)}
              className="hidden sm:flex items-center space-x-1.5 text-xs font-semibold border border-borderDark/80 hover:border-slate-700 bg-[#0c0f16] hover:bg-slate-900 text-slate-300 px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <HelpCircle className="h-3.5 w-3.5 text-indigo-400" />
              <span>Support & Dev</span>
            </button>

            {/* Support Pop-down Dropdown (Desktop) */}
            {isSupportOpen && (
              <div className="absolute right-0 mt-2 w-80 glass-panel border border-borderDark/80 p-5 bg-[#090b0f] shadow-glass z-50 animate-fadeIn">
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-borderDark/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Developer & Support</span>
                  <button 
                    onClick={() => setIsSupportOpen(false)}
                    className="text-[10px] text-slate-550 hover:text-slate-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
                
                <div className="space-y-4">
                  {/* Dev Profile card */}
                  <div className="bg-[#0f131a] border border-borderDark p-3 rounded-lg space-y-1.5">
                    <div className="flex items-center space-x-2.5">
                      <div className="h-8 w-8 rounded bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">Aman Singh</h4>
                        <p className="text-[9px] text-slate-500 font-mono">Developer</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal font-light">
                      Developer & architect of the Code Review Agent engine. Specialized in automated diagnostics, static AST-like auditing pipelines, and AI systems.
                    </p>
                  </div>

                  {/* Support Info */}
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center bg-[#07090d] p-2.5 rounded border border-borderDark/40">
                      <span className="text-slate-500 text-[9px] uppercase font-mono">Email Support</span>
                      <a href="mailto:amaninternsingh2003@gmail.com" className="text-indigo-400 hover:underline font-semibold font-mono text-[10px]">amaninternsingh2003@gmail.com</a>
                    </div>
                    <div className="flex justify-between items-center bg-[#07090d] p-2.5 rounded border border-borderDark/40">
                      <span className="text-slate-500 text-[9px] uppercase font-mono">Project Stage</span>
                      <span className="text-emerald-400 font-semibold font-mono text-[10px]">Active Stable v1.0</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link
            to="/review"
            className="hidden sm:flex items-center space-x-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-lg transition-all shadow-neon"
          >
            <Code className="h-3.5 w-3.5" />
            <span>New Review</span>
          </Link>

          {user && (
            <div className="hidden sm:flex items-center space-x-3 pl-3 border-l border-borderDark/60">
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80'}
                alt={user.username}
                className="h-8 w-8 rounded-full border border-borderDark/80"
              />
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-slate-200">{user.username}</p>
                <p className="text-[10px] text-slate-500">Developer Profile</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg border border-borderDark/40 hover:bg-slate-900 text-slate-400 hover:text-red-400 transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Hamburger Menu Toggle for Mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg border border-borderDark/40 hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-borderDark/40 bg-background/95 backdrop-blur-md px-6 py-4 space-y-4 animate-fadeIn">
          <nav className="flex flex-col space-y-2">
            <Link
              to="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-300 hover:text-white py-2 border-b border-borderDark/20"
            >
              Dashboard
            </Link>
            <Link
              to="/review"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-300 hover:text-white py-2 border-b border-borderDark/20"
            >
              Start Review
            </Link>
            <Link
              to="/playground"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-300 hover:text-white py-2 border-b border-borderDark/20"
            >
              Code Playground
            </Link>
            
            {/* Mobile Support Drawer Accordion */}
            <div className="border-b border-borderDark/20 py-2">
              <button
                onClick={() => setIsSupportOpen(!isSupportOpen)}
                className="text-sm font-medium text-left text-slate-300 hover:text-white w-full flex items-center justify-between"
              >
                <span>Support & Dev</span>
                <span className="text-xs text-slate-500">{isSupportOpen ? '▲' : '▼'}</span>
              </button>
              {isSupportOpen && (
                <div className="mt-2 pl-3 py-2.5 space-y-2.5 bg-[#0f131a]/60 border border-borderDark/40 rounded-lg animate-fadeIn text-xs">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-indigo-400" />
                    <div>
                      <p className="text-xs font-bold text-slate-200">Aman Singh</p>
                      <p className="text-[9px] text-slate-500">Developer</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 pr-2 leading-relaxed">
                    Developer & architect of the Code Review Agent engine. Specialized in automated diagnostics and AI orchestration.
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Email: <a href="mailto:amaninternsingh2003@gmail.com" className="text-indigo-400 font-mono">amaninternsingh2003@gmail.com</a>
                  </p>
                </div>
              )}
            </div>

            {user ? (
              <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80'}
                    alt={user.username}
                    className="h-8 w-8 rounded-full border border-borderDark/80"
                  />
                  <div>
                    <p className="text-xs font-semibold text-slate-200">{user.username}</p>
                    <p className="text-[10px] text-slate-500">Developer Profile</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center space-x-1.5 text-xs font-semibold text-red-400 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm font-semibold text-center bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-500 transition-colors block"
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;



import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal, ShieldAlert, Zap, Cpu, ArrowRight, GitBranch } from 'lucide-react';
import Playground from './Playground';

const Landing = () => {
  return (
    <div className="relative bg-background text-slate-100 min-h-screen overflow-x-hidden">
      {/* Background Mesh Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none"></div>

      {/* Main Hero Header Section */}
      <div className="max-w-4xl mx-auto text-center pt-20 pb-12 px-6 space-y-8 z-10 relative">
        {/* Release Pill */}
        <div className="inline-flex items-center space-x-2 bg-slate-900 border border-borderDark px-3 py-1 rounded-full text-[11px] font-mono text-indigo-400 font-semibold tracking-wider hover:border-indigo-500/40 transition-all duration-300">
          <GitBranch className="h-3.5 w-3.5" />
          <span>Multi-Agent AI Code Auditor v1.0.0</span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-none bg-gradient-to-b from-white via-slate-200 to-slate-500 bg-clip-text text-transparent">
          Secure, Audit, and Optimize <br />
          Your Codebase in Real-Time
        </h1>

        <p className="max-w-xl mx-auto text-sm sm:text-base text-slate-400 font-light leading-relaxed">
          Connect your GitHub repositories, paste raw code blocks, or drag-and-drop folders. Get real-time security, performance, and clean code review audits powered by specialized AI agents.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link
            to="/login"
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-6 py-3 rounded-lg transition-all duration-300 shadow-neon group"
          >
            <span>Launch Developer Dashboard</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#sandbox-playground"
            className="text-xs font-semibold border border-borderDark hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900 text-slate-300 px-6 py-3 rounded-lg transition-all"
          >
            Try Free Sandbox &darr;
          </a>
        </div>
      </div>

      {/* Embedded Code Playground Section */}
      <div id="sandbox-playground" className="max-w-7xl mx-auto px-3 sm:px-6 py-8 sm:py-12 relative z-10 border-t border-borderDark/20 bg-slate-950/20 backdrop-blur-sm rounded-2xl my-6">
        <div className="text-center mb-8 space-y-2">
          <h2 className="text-xl font-bold text-white tracking-tight">Interactive Sandbox Auditing</h2>
          <p className="text-xs text-slate-500">Test the multi-agent code analysis features instantly in the editor below.</p>
        </div>
        <Playground />
      </div>

      {/* Features Grid Section */}
      <div className="max-w-4xl mx-auto px-6 py-16 text-left relative z-10">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-8 text-center">Multi-Agent Auditor Profiles</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="glass-card p-6 border border-borderDark/40 flex flex-col justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20 mb-4">
              <ShieldAlert className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Security Agent</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed font-light">
                Autonomously audits injection vulnerabilities, evaluates danger zones, scans for hardcoded API keys, secrets, and auth issues.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-card p-6 border border-borderDark/40 flex flex-col justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 mb-4">
              <Zap className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Performance Agent</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed font-light">
                Audits memory leaks, evaluates expensive nested loops, verifies React dependency arrays, and optimizes database queries.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-card p-6 border border-borderDark/40 flex flex-col justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 mb-4">
              <Cpu className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Clean Code & Architecture</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed font-light">
                Verifies compliance with styling standards, reviews naming conventions, separation of concerns, and component reuse guidelines.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;

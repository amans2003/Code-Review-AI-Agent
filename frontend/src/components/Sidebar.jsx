import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileCode, History, Settings, ExternalLink, Terminal } from 'lucide-react';

const Sidebar = () => {
  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/review', label: 'Start Review', icon: FileCode },
    { to: '/playground', label: 'Code Playground', icon: Terminal },
  ];

  return (
    <aside className="w-64 border-r border-borderDark/40 bg-background/50 h-[calc(100vh-4rem)] flex flex-col justify-between p-4 hidden md:flex">
      <div className="space-y-6">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase px-3 mb-3">
            Navigation
          </p>
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="rounded-xl border border-borderDark/50 bg-[#0f131a]/80 p-4">
        <h4 className="text-xs font-semibold text-slate-350 flex items-center">
          <span>Support & Developer</span>
        </h4>
        <p className="text-[10px] text-slate-450 mt-1.5 leading-normal">
          Lead Dev: <strong className="text-indigo-400">Aman Singh</strong>
        </p>
        <p className="text-[9px] text-slate-500 mt-1 leading-normal font-light">
          Diagnostics and AI reviews are powered by the Antigravity auditor engine.
        </p>
        <a
          href="mailto:amaninternsingh2003@gmail.com"
          className="inline-block mt-3 text-[10px] text-indigo-400 hover:underline font-semibold font-mono"
        >
          amaninternsingh2003@gmail.com
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;

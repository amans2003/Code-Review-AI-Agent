import React, { useState } from 'react';
import { Shield, Cpu, Code2, Layout, AlertTriangle, AlertCircle, Info, ChevronRight } from 'lucide-react';

const SuggestionsPanel = ({ issues = [], onSelectIssue = () => {} }) => {
  const [activeTab, setActiveTab] = useState('all');

  const categories = [
    { id: 'all', name: 'All Issues', count: issues.length },
    { id: 'security', name: 'Security', count: issues.filter(i => i.category === 'security').length, icon: Shield, color: 'text-red-400' },
    { id: 'performance', name: 'Performance', count: issues.filter(i => i.category === 'performance').length, icon: Cpu, color: 'text-amber-400' },
    { id: 'cleanCode', name: 'Clean Code', count: issues.filter(i => i.category === 'cleanCode').length, icon: Code2, color: 'text-indigo-400' },
    { id: 'architecture', name: 'Architecture', count: issues.filter(i => i.category === 'architecture').length, icon: Layout, color: 'text-emerald-400' }
  ];

  const filteredIssues = activeTab === 'all' 
    ? issues 
    : issues.filter(i => i.category === activeTab);

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'High':
        return (
          <span className="flex items-center text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
            <AlertCircle className="h-3 w-3 mr-1" />
            HIGH
          </span>
        );
      case 'Medium':
        return (
          <span className="flex items-center text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            <AlertTriangle className="h-3 w-3 mr-1" />
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="flex items-center text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            <Info className="h-3 w-3 mr-1" />
            LOW
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0d14]/90 border border-borderDark/40 rounded-xl overflow-hidden shadow-glass">
      {/* Category Selection Tabs */}
      <div className="bg-[#0f131a] border-b border-borderDark/40 p-2 flex flex-wrap gap-1">
        {categories.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isActive 
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20' 
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              {Icon && <Icon className={`h-3.5 w-3.5 ${isActive ? tab.color : 'text-slate-500'}`} />}
              <span>{tab.name}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-500'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Issues List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredIssues.length === 0 ? (
          <div className="text-center py-12">
            <Info className="h-8 w-8 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-400">No issues found</p>
            <p className="text-xs text-slate-500 mt-1">Select a different tab or congratulations on clean code!</p>
          </div>
        ) : (
          filteredIssues.map((issue, idx) => (
            <div
              key={issue._id || idx}
              onClick={() => onSelectIssue(issue)}
              className="group border border-borderDark/50 hover:border-indigo-500/30 bg-[#0f131a]/60 hover:bg-[#121824]/90 p-4 rounded-xl cursor-pointer transition-all duration-300 flex justify-between items-start"
            >
              <div className="space-y-2 flex-1 pr-3">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  {getSeverityBadge(issue.severity)}
                  <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10 uppercase font-semibold">
                    {issue.category}
                  </span>
                </div>
                
                <div>
                  <h4 className="text-xs font-semibold text-slate-200 leading-normal group-hover:text-white">
                    {issue.message}
                  </h4>
                  <p className="text-[10px] font-mono text-slate-500 mt-1 group-hover:text-slate-400">
                    {issue.file} (Line {issue.line})
                  </p>
                </div>

                {issue.suggestion && (
                  <p className="text-[10.5px] text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-borderDark/30 leading-relaxed font-light">
                    <span className="text-indigo-400 font-semibold block mb-0.5">Recommendation:</span>
                    {issue.suggestion}
                  </p>
                )}

                {issue.proposedFix && (
                  <div className="text-[10.5px] bg-[#06080c] border border-borderDark/40 p-2.5 rounded-lg font-mono text-emerald-400 overflow-x-auto max-w-full leading-normal">
                    <span className="text-[9px] font-semibold text-slate-500 block mb-1.5 uppercase tracking-wider select-none border-b border-borderDark/30 pb-0.5">Proposed Code Fix:</span>
                    <pre className="whitespace-pre-wrap">{issue.proposedFix}</pre>
                  </div>
                )}
              </div>
              <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-indigo-400 self-center transition-colors flex-shrink-0" />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SuggestionsPanel;

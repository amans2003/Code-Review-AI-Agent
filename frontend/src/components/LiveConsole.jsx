import React, { useEffect, useRef } from 'react';
import { Terminal, Shield, Cpu, Code2, Save, FileCheck } from 'lucide-react';

const LiveConsole = ({ logs = [] }) => {
  const consoleEndRef = useRef(null);

  useEffect(() => {
    // Auto scroll to bottom
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getLogIcon = (logText) => {
    if (typeof logText !== 'string') {
      return <FileCheck className="h-3.5 w-3.5 text-emerald-400 mr-2" />;
    }
    if (logText.includes('security') || logText.includes('Security')) return <Shield className="h-3.5 w-3.5 text-red-400 mr-2" />;
    if (logText.includes('performance') || logText.includes('Performance')) return <Cpu className="h-3.5 w-3.5 text-amber-400 mr-2" />;
    if (logText.includes('cleanCode') || logText.includes('Clean Code') || logText.includes('style')) return <Code2 className="h-3.5 w-3.5 text-indigo-400 mr-2" />;
    if (logText.includes('saving') || logText.includes('database')) return <Save className="h-3.5 w-3.5 text-emerald-400 mr-2" />;
    if (logText.includes('completed') || logText.includes('complete') || logText.includes('finished')) return <FileCheck className="h-3.5 w-3.5 text-emerald-400 mr-2" />;
    return <Terminal className="h-3.5 w-3.5 text-slate-400 mr-2" />;
  };

  const formatLogMessage = (log) => {
    if (typeof log.message === 'object') {
      if (log.status === 'completed') {
        return 'Code audit analysis completed successfully! Redirecting to report...';
      }
      return JSON.stringify(log.message);
    }
    return log.message;
  };

  return (
    <div className="glass-panel overflow-hidden border border-borderDark/40 flex flex-col h-80">
      {/* Console Header */}
      <div className="bg-[#0b0e14] px-4 py-2 border-b border-borderDark/50 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
          </div>
          <span className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest pl-2">
            AI Multi-Agent Live Terminal
          </span>
        </div>
        <span className="text-[9px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
          STREAMING
        </span>
      </div>

      {/* Logs Window */}
      <div className="flex-1 bg-[#06080c] p-4 font-mono text-xs overflow-y-auto space-y-2">
        {logs.length === 0 ? (
          <div className="flex items-center text-slate-600 animate-pulse">
            <span className="inline-block w-1.5 h-3 bg-slate-600 mr-2 cursor-blink"></span>
            <span>Awaiting review task initialization...</span>
          </div>
        ) : (
          logs.map((log, idx) => (
            <div key={idx} className="flex items-start text-slate-300 leading-relaxed py-0.5 border-b border-slate-900/30">
              <span className="text-slate-600 select-none mr-2 font-light">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
              <span className="flex items-center">
                {getLogIcon(log.message)}
                <span className={log.status === 'failed' ? 'text-red-400' : log.status === 'completed' ? 'text-emerald-400 font-bold' : ''}>
                  {formatLogMessage(log)}
                </span>
              </span>
            </div>
          ))
        )}
        
        {/* Blinking cursor at trailing log */}
        {logs.length > 0 && logs[logs.length - 1].status !== 'completed' && logs[logs.length - 1].status !== 'failed' && (
          <div className="flex items-center text-indigo-400/80 mt-1 pl-2">
            <span className="inline-block w-1.5 h-3 bg-indigo-400 cursor-blink"></span>
            <span className="text-[10px] ml-2 animate-pulse text-indigo-500/60 font-semibold uppercase">Processing task payload...</span>
          </div>
        )}
        
        <div ref={consoleEndRef} />
      </div>
    </div>
  );
};

export default LiveConsole;

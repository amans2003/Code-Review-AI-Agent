import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import Editor from '@monaco-editor/react';
import ScoreCard from '../components/ScoreCard';
import SuggestionsPanel from '../components/SuggestionsPanel';
import { Terminal, Play, Sparkles, Code, AlertCircle, RefreshCw, FileCode, CheckCircle, Info, FileText } from 'lucide-react';

const PRESETS = {
  js_basic: `// Simple Javascript presets\nconsole.log("Hello, developer! Modify this code and click 'Run Code'.");\n\nconst items = [10, 20, 30];\nconst sum = items.reduce((acc, c) => acc + c, 0);\nconsole.log("Total sum is: " + sum);`,
  
  security_vuln: `// Security Vulnerability Example\nconst API_SECRET_TOKEN = "jwt-super-secret-key-12345"; // Hardcoded credential\nconsole.log("Initializing database connection...");\n\nfunction executeTask(userInput) {\n  // Unsafe eval executing raw strings\n  var results = eval(userInput);\n  return results;\n}\n\nconsole.log("Application running.");`,

  performance_bottleneck: `// Performance Loop Bottleneck Example\nconst dataset = Array.from({ length: 100 }, (_, i) => ({ id: i, value: i * 2 }));\n\nfunction verifyValues(items) {\n  console.log("Auditing items...");\n  // Dangerous nested loop: O(N^2) complexity lookup smell\n  items.forEach(a => {\n    items.forEach(b => {\n      if (a.id === b.id && a.value !== b.value) {\n        console.log("Conflict discovered: " + a.id);\n      }\n    });\n  });\n}\n\nverifyValues(dataset);`,

  react_hook_smell: `// React Hook Smell Example\nimport React, { useEffect, useState } from 'react';\n\nexport const MyWidget = ({ userId }) => {\n  const [data, setData] = useState(null);\n\n  // Missing dependency array: triggers query on EVERY re-render!\n  useEffect(() => {\n    console.log("Fetching user profile...");\n    fetch(\`/api/user/\${userId}\`)\n      .then(res => res.json())\n      .then(d => setData(d));\n  }); \n\n  return <div style={{ color: 'red', padding: '10px' }}>User: {data?.name}</div>;\n}`
};

const Playground = () => {
  const [code, setCode] = useState(PRESETS.js_basic);
  const [selectedPreset, setSelectedPreset] = useState('js_basic');
  
  // Console logs output logs array
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [running, setRunning] = useState(false);
  const [runStatus, setRunStatus] = useState('idle'); // 'idle' | 'running' | 'success' | 'error'

  // Quick Audit results state
  const [auditData, setAuditData] = useState(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Right sidebar tab state: 'issues' | 'recommendations'
  const [activeTab, setActiveTab] = useState('issues');

  // Selected issue highlights
  const [selectedLine, setSelectedLine] = useState(null);

  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    editor.updateOptions({
      fontSize: 13,
      lineHeight: 20,
      fontFamily: "'Fira Code', Consolas, monospace",
      minimap: { enabled: false },
      scrollbar: {
        verticalScrollbarSize: 8,
        horizontalScrollbarSize: 8
      },
      glyphMargin: true
    });
  };

  const applyDecorations = (issuesList) => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    const newDecorations = issuesList.map(issue => {
      let className = 'bg-yellow-500/10 border-l-2 border-yellow-500';
      if (issue.severity === 'High') {
        className = 'bg-red-500/10 border-l-2 border-red-500';
      } else if (issue.severity === 'Low') {
        className = 'bg-indigo-500/10 border-l-2 border-indigo-500';
      }

      return {
        range: new monaco.Range(issue.line, 1, issue.line, 1),
        options: {
          isWholeLine: true,
          className: className,
          glyphMarginClassName: issue.severity === 'High' ? 'text-red-500' : 'text-yellow-500',
          glyphMarginHoverMessage: { value: `[${issue.severity}] ${issue.message}` }
        }
      };
    });

    if (editor.createDecorationsCollection) {
      if (editor.decorationsCollection) {
        editor.decorationsCollection.set(newDecorations);
      } else {
        editor.decorationsCollection = editor.createDecorationsCollection(newDecorations);
      }
    } else {
      editor.deltaDecorations([], newDecorations);
    }
  };

  const handlePresetChange = (key) => {
    setSelectedPreset(key);
    setCode(PRESETS[key]);
    setAuditData(null); // Clear old audits
    setSelectedLine(null);
    setConsoleLogs([]);
    setRunStatus('idle');

    // Clear editor decorations
    const editor = editorRef.current;
    if (editor && editor.decorationsCollection) {
      editor.decorationsCollection.set([]);
    }
  };

  // Safe client-side JS runner
  const handleRunCode = () => {
    setRunning(true);
    setRunStatus('running');
    setConsoleLogs(['[System] Booting Sandbox Runner...', '[System] Executing Program...']);

    setTimeout(() => {
      const logs = [];
      const originalLog = console.log;
      console.log = (...args) => {
        logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' '));
      };

      try {
        // Strip out imports/exports to prevent evaluation syntax crashes in clean client context
        const runnableCode = code
          .replace(/import\s+.*?;?/g, '')
          .replace(/export\s+const/g, 'const')
          .replace(/export\s+default/g, '');

        // Evaluate using a safe Function wrapper
        new Function(runnableCode)();
        
        console.log = originalLog;
        setConsoleLogs([
          ...logs,
          '\n✓ Program completed execution successfully.'
        ]);
        setRunStatus('success');
      } catch (err) {
        console.log = originalLog;
        setConsoleLogs([
          ...logs,
          `\n❌ Runtime Error: ${err.message}`
        ]);
        setRunStatus('error');
      } finally {
        setRunning(false);
      }
    }, 400);
  };

  // Call quickAudit backend sandbox API
  const handleAuditCode = async () => {
    setAuditLoading(true);
    setErrorMsg('');
    setAuditData(null);
    setSelectedLine(null);

    try {
      const res = await api.repos.quickAudit({
        content: code,
        fileName: selectedPreset === 'react_hook_smell' ? 'MyWidget.jsx' : 'sandbox.js'
      });

      if (res.success) {
        setAuditData(res.data);
        
        // Highlight decorations inside editor
        if (res.data.issues && res.data.issues.length > 0) {
          applyDecorations(res.data.issues);
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Audit analysis failed.');
    } finally {
      setAuditLoading(false);
    }
  };

  const handleSelectIssue = (issue) => {
    setSelectedLine(issue.line);
    if (editorRef.current) {
      editorRef.current.revealLineInCenter(issue.line);
      editorRef.current.setPosition({ lineNumber: issue.line, column: 1 });
      editorRef.current.focus();
    }
  };

  // Get status pill styling
  const getStatusPill = () => {
    switch (runStatus) {
      case 'running':
        return <span className="text-[9px] font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20 animate-pulse font-semibold">RUNNING...</span>;
      case 'success':
        return <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20 font-bold">✓ SUCCESS (0)</span>;
      case 'error':
        return <span className="text-[9px] font-mono text-red-400 bg-red-500/10 px-2.5 py-0.5 rounded border border-red-500/20 font-bold">❌ RUNTIME ERROR</span>;
      default:
        return <span className="text-[9px] font-mono text-slate-500 bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700">IDLE</span>;
    }
  };

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-borderDark/40 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center">
            <Code className="h-6 w-6 text-indigo-400 mr-2" />
            <span>Interactive Code Playground</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Write code in the editor, run it locally, and scan it instantly for security/performance flaws.</p>
        </div>

        {/* Preset Selector */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="text-xs text-slate-500 font-semibold uppercase">Template Preset:</span>
          <select
            value={selectedPreset}
            onChange={(e) => handlePresetChange(e.target.value)}
            className="bg-[#0f131a] border border-borderDark/60 rounded-lg px-3 py-1.5 text-xs text-indigo-400 focus:outline-none"
          >
            <option value="js_basic">JavaScript Basic</option>
            <option value="security_vuln">Security Vulnerabilities</option>
            <option value="performance_bottleneck">Performance Loop Bottleneck</option>
            <option value="react_hook_smell">React Hooks Code Smell</option>
          </select>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-4 py-3 rounded-lg flex items-center space-x-2">
          <AlertCircle className="h-4.5 w-4.5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Scoreboard Metrics Row (Shows only when audited) */}
      {auditData && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 animate-fadeIn">
          <ScoreCard title="Overall Grade" score={auditData.overallScore} subtitle="Unified index score" />
          <ScoreCard title="Security" score={auditData.securityScore} subtitle={`${auditData.issues.filter(i => i.category === 'security').length} issues found`} />
          <ScoreCard title="Performance" score={auditData.performanceScore} subtitle={`${auditData.issues.filter(i => i.category === 'performance').length} bottlenecks`} />
          <ScoreCard title="Clean Code" score={auditData.cleanCodeScore} subtitle={`${auditData.issues.filter(i => i.category === 'cleanCode').length} style flags`} />
          <ScoreCard title="Architecture" score={auditData.architectureScore} subtitle={`${auditData.issues.filter(i => i.category === 'architecture').length} structural marks`} />
        </div>
      )}

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Editor & Execution Output (cols 7) */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          {/* Editor Container */}
          <div className="border border-borderDark/40 rounded-xl overflow-hidden shadow-glass flex flex-col h-[400px] bg-[#1e1e1e]">
            {/* Header controls */}
            <div className="bg-[#181818] border-b border-[#282828] px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2.5">
                <FileCode className="h-4 w-4 text-indigo-400" />
                <span className="text-xs font-mono text-slate-300 font-semibold">sandbox.js</span>
              </div>
              <div className="flex items-center space-x-2.5">
                {/* Run code */}
                <button
                  onClick={handleRunCode}
                  disabled={running}
                  className="flex items-center space-x-1.5 text-[11px] font-semibold bg-slate-900 border border-borderDark/80 hover:bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg disabled:opacity-50 transition-all shadow-glass"
                >
                  <Play className="h-3 w-3 fill-current text-emerald-400" />
                  <span>{running ? 'Running...' : 'Run Code'}</span>
                </button>
                {/* Audit code */}
                <button
                  onClick={handleAuditCode}
                  disabled={auditLoading}
                  className="flex items-center space-x-1.5 text-[11px] font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg disabled:opacity-50 transition-all shadow-neon"
                >
                  {auditLoading ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3" />
                  )}
                  <span>{auditLoading ? 'Auditing...' : 'Audit Code'}</span>
                </button>
              </div>
            </div>
            
            <div className="flex-1">
              <Editor
                height="100%"
                language="javascript"
                theme="vs-dark"
                value={code}
                onChange={(val) => setCode(val || '')}
                onMount={handleEditorDidMount}
              />
            </div>
          </div>

          {/* Terminal Console Output */}
          <div className="glass-panel overflow-hidden flex flex-col h-48 border border-borderDark/40">
            <div className="bg-[#0b0e14] px-4 py-2.5 border-b border-borderDark/50 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Terminal className="h-3.5 w-3.5 text-indigo-400" />
                <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest">
                  Output Console Logs
                </span>
              </div>
              {getStatusPill()}
            </div>
            <div className="flex-1 bg-[#06080c] p-4 font-mono text-xs overflow-y-auto space-y-1.5 text-slate-300">
              {consoleLogs.length === 0 ? (
                <div className="text-slate-600 italic">Console output is empty. Edit sandbox.js and click "Run Code" above.</div>
              ) : (
                consoleLogs.map((log, idx) => (
                  <pre key={idx} className="whitespace-pre-wrap leading-relaxed">{log}</pre>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Tab Panel Sidebar (cols 5) */}
        <div className="lg:col-span-5 flex flex-col h-[450px] lg:h-[610px] bg-[#0a0d14]/90 border border-borderDark/40 rounded-xl overflow-hidden shadow-glass">
          {/* Tabs selectors */}
          <div className="bg-[#0f131a] border-b border-borderDark/40 flex text-center">
            <button
              onClick={() => setActiveTab('issues')}
              className={`flex-1 py-3 text-xs font-semibold border-b-2 flex items-center justify-center space-x-1.5 transition-all ${
                activeTab === 'issues'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">
                <span className="inline sm:hidden">Suggestions ({auditData ? auditData.issues.length : 0})</span>
                <span className="hidden sm:inline">Line Suggestions ({auditData ? auditData.issues.length : 0})</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              disabled={!auditData}
              className={`flex-1 py-3 text-xs font-semibold border-b-2 flex items-center justify-center space-x-1.5 transition-all disabled:opacity-30 ${
                activeTab === 'recommendations'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">
                <span className="inline sm:hidden">Audits & Tips</span>
                <span className="hidden sm:inline">General Audits & Tips</span>
              </span>
            </button>
          </div>

          {/* Tab Content Window */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'issues' && (
              auditData ? (
                <SuggestionsPanel
                  issues={auditData.issues}
                  onSelectIssue={handleSelectIssue}
                />
              ) : (
                <div className="flex-1 h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 space-y-4">
                  <div className="h-12 w-12 rounded-full bg-slate-900 border border-borderDark flex items-center justify-center text-indigo-400 animate-pulse">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div className="space-y-1.5 max-w-xs">
                    <h4 className="text-sm font-semibold text-slate-300 font-sans">Awaiting Sandbox Audit</h4>
                    <p className="text-xs text-slate-500 leading-normal">
                      Click the **Audit Code** button on the editor toolbar to run real-time checks on your custom Javascript code.
                    </p>
                  </div>
                </div>
              )
            )}

            {activeTab === 'recommendations' && auditData && (
              <div className="h-full overflow-y-auto p-5 text-slate-300 text-xs leading-relaxed space-y-5 bg-[#06080c]">
                {/* General Audit Recommendations */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest border-b border-borderDark pb-1 flex items-center">
                    <CheckCircle className="h-4 w-4 text-emerald-400 mr-2" />
                    <span>Audit Action Recommendations</span>
                  </h3>
                  <ul className="space-y-2">
                    {auditData.suggestions.map((suggestion, idx) => (
                      <li key={idx} className="flex items-start space-x-2 bg-[#0f131a] p-3 rounded-lg border border-borderDark/40">
                        <Info className="h-4 w-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                        <span className="font-light">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Markdown Review Summary */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest border-b border-borderDark pb-1 flex items-center">
                    <FileText className="h-4 w-4 text-indigo-400 mr-2" />
                    <span>Executive Summary</span>
                  </h3>
                  <div className="markdown-body space-y-3 pl-1 font-sans">
                    {auditData.summary.split('\n').map((line, idx) => {
                      if (line.startsWith('# ')) return null; // Skip main title
                      if (line.startsWith('### ')) {
                        return <h4 key={idx} className="text-xs font-bold text-white mt-4 border-l-2 border-indigo-500 pl-2 py-0.5">{line.replace('### ', '')}</h4>;
                      }
                      if (line.startsWith('* ')) {
                        return (
                          <li key={idx} className="list-disc pl-4 py-0.5 font-light">
                            {line.replace('* ', '')}
                          </li>
                        );
                      }
                      if (line.trim() === '') return <div key={idx} className="h-1"></div>;
                      return <p key={idx} className="font-light">{line}</p>;
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Playground;

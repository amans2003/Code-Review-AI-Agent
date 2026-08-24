import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import LiveConsole from '../components/LiveConsole';
import { GitBranch, ClipboardList, Send, AlertCircle, Sparkles } from 'lucide-react';

const ReviewPage = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('git'); // 'git' or 'raw'
  const [repoUrl, setRepoUrl] = useState(location.state?.repoUrl || '');
  const [repoName, setRepoName] = useState(location.state?.repoName || '');
  
  // Raw code paste state
  const [fileName, setFileName] = useState('app.js');
  const [codeContent, setCodeContent] = useState('');

  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [logs, setLogs] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  const eventSourceRef = useRef(null);
  const navigate = useNavigate();

  // Cleanup EventSource on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const startStreaming = (id) => {
    setLogs([]);
    setErrorMsg('');
    setJobId(id);

    let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    if (API_URL.endsWith('/')) {
      API_URL = API_URL.slice(0, -1);
    }
    const streamUrl = `${API_URL}/api/stream/${id}`;
    const source = new EventSource(streamUrl);
    eventSourceRef.current = source;

    source.addEventListener('progress', (event) => {
      try {
        const payload = JSON.parse(event.data);
        setLogs((prev) => [...prev, payload]);

        // Redirect to results page when complete
        if (payload.status === 'completed') {
          source.close();
          const reviewId = payload.message.reviewId;
          setTimeout(() => {
            navigate(`/results/${reviewId}`);
          }, 1500);
        } else if (payload.status === 'failed') {
          source.close();
          setErrorMsg(payload.message || 'Static scan failed.');
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to parse SSE payload:', err);
      }
    });

    source.addEventListener('close', () => {
      source.close();
      setLoading(false);
    });

    source.onerror = (err) => {
      console.error('EventSource connection lost:', err);
      // Don't crash immediately, wait for the socket retry or end if completed
      // After some attempts, let's close if it was a failure
      if (logs.length > 0 && logs[logs.length - 1].status !== 'completed') {
        setErrorMsg('Lost connection to analysis streaming service.');
        source.close();
        setLoading(false);
      }
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setErrorMsg('');
    setJobId(null);

    let payload = {};

    if (activeTab === 'git') {
      if (!repoUrl) {
        setErrorMsg('Please specify a GitHub repository URL.');
        setLoading(false);
        return;
      }
      payload = { repoUrl, repoName };
    } else {
      if (!codeContent) {
        setErrorMsg('Please paste code contents to analyze.');
        setLoading(false);
        return;
      }
      payload = {
        repoName: 'Raw Paste Review',
        files: [{
          path: fileName || 'raw_block.js',
          content: codeContent
        }]
      };
    }

    try {
      const res = await api.repos.submit(payload);
      if (res.success) {
        startStreaming(res.jobId);
      } else {
        setErrorMsg(res.message || 'Failed to initialize analysis request.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Submit review error:', err);
      setErrorMsg(err.message || 'Server connection failed.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Title */}
      <div className="border-b border-borderDark/40 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center">
          <Sparkles className="h-6 w-6 text-indigo-400 mr-2 animate-pulse" />
          <span>Launch Codebase Review</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">Audit code files using LLM agents or patterns. Watch progress live below.</p>
      </div>

      {location.state?.repoUrl && !jobId && (
        <div className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs px-4 py-3 rounded-lg flex items-center space-x-2 animate-fadeIn">
          <Sparkles className="h-4 w-4 flex-shrink-0 text-indigo-400" />
          <span>Repository pre-filled from your GitHub profile. Review the URL below and click <strong>Queue Audit Analysis</strong> to start.</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-4 py-3 rounded-lg flex items-start space-x-2">
          <AlertCircle className="h-4.5 w-4.5 flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {!jobId ? (
        /* Input Panel */
        <div className="glass-panel overflow-hidden border border-borderDark/40">
          {/* Tabs header */}
          <div className="bg-[#0f131a] border-b border-borderDark/40 flex">
            <button
              onClick={() => { setActiveTab('git'); setErrorMsg(''); }}
              className={`flex items-center space-x-2 px-5 py-3 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'git'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <GitBranch className="h-4 w-4" />
              <span>Clone GitHub URL</span>
            </button>
            <button
              onClick={() => { setActiveTab('raw'); setErrorMsg(''); }}
              className={`flex items-center space-x-2 px-5 py-3 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'raw'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <ClipboardList className="h-4 w-4" />
              <span>Paste Raw Code Block</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {activeTab === 'git' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">GitHub Repository URL</label>
                  <input
                    type="url"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/username/project"
                    className="w-full bg-[#0a0d14] border border-borderDark/60 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-xs text-slate-200 focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Display Name (Optional)</label>
                  <input
                    type="text"
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                    placeholder="e.g. My Express Api"
                    className="w-full bg-[#0a0d14] border border-borderDark/60 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-xs text-slate-200 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mock Filename & Path</label>
                  <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="src/components/MyWidget.jsx"
                    className="w-full bg-[#0a0d14] border border-borderDark/60 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-xs text-slate-200 focus:outline-none transition-colors font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Code Content</label>
                  <textarea
                    rows={12}
                    value={codeContent}
                    onChange={(e) => setCodeContent(e.target.value)}
                    placeholder={`// Paste your JS, TS, React or Node code here...\n\nfunction processData(val) {\n  var result = eval(val);\n  return result;\n}`}
                    className="w-full bg-[#0a0d14] border border-borderDark/60 focus:border-indigo-500 rounded-lg p-4 text-xs text-slate-200 focus:outline-none font-mono transition-colors"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center space-x-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg disabled:opacity-50 transition-all shadow-neon"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{loading ? 'Submitting...' : 'Queue Audit Analysis'}</span>
            </button>
          </form>
        </div>
      ) : (
        /* Real-Time Processing Console */
        <div className="space-y-6">
          <div className="glass-panel p-5 border border-borderDark/40 flex justify-between items-center bg-[#0f131a]/60">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Scan Job ID</span>
              <p className="text-xs font-mono font-semibold text-indigo-400 mt-1">{jobId}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
              <span className="text-xs font-bold text-slate-400">Auditing codebase...</span>
            </div>
          </div>

          <LiveConsole logs={logs} />
        </div>
      )}
    </div>
  );
};

export default ReviewPage;

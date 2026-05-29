import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import ScoreCard from '../components/ScoreCard';
import SuggestionsPanel from '../components/SuggestionsPanel';
import MonacoViewer from '../components/MonacoViewer';
import { FileText, Download, ShieldAlert, Cpu, Sparkles, FolderOpen, Send, HelpCircle, ArrowLeft, RefreshCw } from 'lucide-react';

const ResultsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active workspace state
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedLine, setSelectedLine] = useState(null);
  
  // Right sidebar state: 'suggestions' | 'summary' | 'chat'
  const [activeTab, setActiveTab] = useState('suggestions');

  // AI assistant chat state
  const [question, setQuestion] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    const fetchReviewDetails = async () => {
      try {
        const res = await api.reviews.getDetails(id);
        if (res.success) {
          const data = res.data;
          
          // Reconstruct files list from issues list if missing (for legacy records)
          if (!data.files || data.files.length === 0) {
            const uniqueFiles = [...new Set(data.issues.map(i => i.file))];
            data.files = uniqueFiles.map(filePath => ({
              path: filePath,
              content: `// Source code content for ${filePath} is unavailable for legacy reports.\n// Please run a new audit scan to enable inline editor highlights and AI chat.`
            }));
          }

          setReview(data);
          
          if (data.files && data.files.length > 0) {
            setSelectedFile(data.files[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching review details:', err);
        setError(err.message || 'Failed to retrieve analysis report.');
      } finally {
        setLoading(false);
      }
    };

    fetchReviewDetails();
  }, [id]);

  const handleSelectIssue = (issue) => {
    // Find file matching issue file path
    const file = review.files.find(f => {
      const issueFile = issue.file.replace(/\\/g, '/');
      const fPath = f.path.replace(/\\/g, '/');
      return fPath.endsWith(issueFile) || issueFile.endsWith(fPath);
    });

    if (file) {
      setSelectedFile(file);
      setSelectedLine(issue.line);
    }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!question.trim() || !selectedFile || chatLoading) return;

    const currentQuestion = question;
    setQuestion('');
    setChatMessages((prev) => [...prev, { role: 'user', content: currentQuestion }]);
    setChatLoading(true);

    try {
      const payload = {
        fileName: selectedFile.path,
        snippet: selectedFile.content,
        question: currentQuestion
      };

      const res = await api.reviews.explain(payload);
      if (res.success) {
        setChatMessages((prev) => [...prev, { role: 'assistant', content: res.explanation }]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setChatMessages((prev) => [...prev, { role: 'assistant', content: `Assistant Error: ${err.message}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto"></div>
          <p className="text-xs text-slate-500 font-mono animate-pulse">Loading static analysis details...</p>
        </div>
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="max-w-md mx-auto p-6 space-y-4 text-center mt-12">
        <ShieldAlert className="h-10 w-10 text-red-500 mx-auto animate-bounce" />
        <h2 className="text-md font-semibold text-slate-200">Analysis Fetch Failed</h2>
        <p className="text-xs text-slate-500 leading-normal">{error || 'Review report not found'}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center space-x-2 text-xs font-semibold bg-slate-900 border border-borderDark px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Dashboard</span>
        </button>
      </div>
    );
  }

  // Filter issues for the currently active file to display annotations count
  const activeFileIssues = review.issues.filter(issue => {
    if (!selectedFile) return false;
    const issueFile = issue.file.replace(/\\/g, '/');
    const selectedPath = selectedFile.path.replace(/\\/g, '/');
    return selectedPath.endsWith(issueFile) || issueFile.endsWith(selectedPath);
  });

  return (
    <div className="space-y-6 p-4 max-w-[1600px] mx-auto">
      {/* Upper Navigation Back & Downloads Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-borderDark/40 pb-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-1.5 rounded-lg border border-borderDark/60 bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight flex items-center">
              <span>{review.repositoryId?.repoName || 'Manual Upload'}</span>
              <span className="text-[10px] uppercase font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 ml-3">
                REVIEW COMPLETE
              </span>
            </h1>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">Report ID: {review._id}</p>
          </div>
        </div>

        {/* Download Buttons */}
        <div className="flex items-center space-x-3">
          <a
            href={api.reviews.getDownloadUrl(review._id, 'markdown')}
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1.5 text-[11px] font-semibold border border-borderDark/80 bg-slate-900 hover:bg-slate-800 text-slate-300 px-3 py-2 rounded-lg transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Markdown Export</span>
          </a>
          <a
            href={api.reviews.getDownloadUrl(review._id, 'pdf')}
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1.5 text-[11px] font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-lg transition-all shadow-neon"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download PDF</span>
          </a>
        </div>
      </div>

      {/* Scoreboard Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <ScoreCard title="Overall Quality" score={review.overallScore} subtitle="Unified index score" />
        <ScoreCard title="Security" score={review.securityScore} subtitle={`${review.issues.filter(i => i.category === 'security').length} issues found`} />
        <ScoreCard title="Performance" score={review.performanceScore} subtitle={`${review.issues.filter(i => i.category === 'performance').length} bottlenecks`} />
        <ScoreCard title="Clean Code" score={review.cleanCodeScore} subtitle={`${review.issues.filter(i => i.category === 'cleanCode').length} style flags`} />
        <ScoreCard title="Architecture" score={review.architectureScore} subtitle={`${review.issues.filter(i => i.category === 'architecture').length} structural marks`} />
      </div>

      {/* Main IDE Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[700px]">
        {/* Left Pane: Directory Tree (cols 3) */}
        <div className="lg:col-span-3 glass-panel border border-borderDark/40 flex flex-col overflow-hidden h-60 lg:h-full">
          <div className="bg-[#0f131a] px-4 py-3 border-b border-borderDark/40 flex items-center space-x-2">
            <FolderOpen className="h-4 w-4 text-indigo-400" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Workspace Files</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 bg-[#06080c]">
            {review.files && review.files.length > 0 ? (
              review.files.map((file) => {
                const fileIssuesCount = review.issues.filter(i => {
                  const issueFile = i.file.replace(/\\/g, '/');
                  const fPath = file.path.replace(/\\/g, '/');
                  return fPath.endsWith(issueFile) || issueFile.endsWith(fPath);
                }).length;

                const isSelected = selectedFile?.path === file.path;

                return (
                  <button
                    key={file.path}
                    onClick={() => {
                      setSelectedFile(file);
                      setSelectedLine(null);
                    }}
                    className={`w-full flex items-center justify-between text-left p-2 rounded-lg text-xs font-mono transition-all border ${
                      isSelected
                        ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20'
                        : 'text-slate-400 hover:text-slate-200 bg-slate-950/20 hover:bg-slate-900 border-transparent'
                    }`}
                  >
                    <span className="truncate pr-2">{file.path}</span>
                    {fileIssuesCount > 0 && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {fileIssuesCount}
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <p className="text-xs text-slate-600 p-4 text-center">No source files present</p>
            )}
          </div>
        </div>

        {/* Center Pane: Monaco Editor (cols 5) */}
        <div className="lg:col-span-5 h-[450px] lg:h-full">
          <MonacoViewer
            fileContent={selectedFile?.content || ''}
            fileName={selectedFile?.path || ''}
            issues={review.issues}
            selectedLine={selectedLine}
          />
        </div>

        {/* Right Pane: Panels Sidebar (cols 4) */}
        <div className="lg:col-span-4 glass-panel border border-borderDark/40 flex flex-col h-[500px] lg:h-full overflow-hidden">
          {/* Tab selectors */}
          <div className="bg-[#0f131a] border-b border-borderDark/40 flex text-center">
            <button
              onClick={() => setActiveTab('suggestions')}
              className={`flex-1 py-3 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'suggestions'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Suggestions ({review.issues.length})
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`flex-1 py-3 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'summary'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Executive Summary
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-3 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'chat'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              AI Assistant
            </button>
          </div>

          {/* Tab Content window */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'suggestions' && (
              <SuggestionsPanel
                issues={review.issues}
                onSelectIssue={handleSelectIssue}
              />
            )}

            {activeTab === 'summary' && (
              <div className="h-full overflow-y-auto p-5 text-slate-300 text-xs leading-relaxed space-y-4 prose prose-invert bg-[#06080c]">
                {/* Visual rendering of Markdown summary */}
                <div className="markdown-body space-y-3">
                  {review.summary.split('\n').map((line, idx) => {
                    if (line.startsWith('# ')) {
                      return <h2 key={idx} className="text-sm font-bold text-white border-b border-borderDark/60 pb-1 mt-4">{line.replace('# ', '')}</h2>;
                    }
                    if (line.startsWith('### ')) {
                      return <h3 key={idx} className="text-xs font-bold text-indigo-400 mt-3">{line.replace('### ', '')}</h3>;
                    }
                    if (line.startsWith('* ')) {
                      return (
                        <li key={idx} className="list-disc pl-4 py-0.5 font-light">
                          {line.replace('* ', '')}
                        </li>
                      );
                    }
                    if (line.trim() === '') return <div key={idx} className="h-2"></div>;
                    return <p key={idx} className="font-light">{line}</p>;
                  })}
                </div>
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="flex flex-col h-full bg-[#06080c]">
                {/* Selected file info */}
                <div className="bg-slate-950 p-2.5 border-b border-borderDark/30 text-[10px] text-slate-500 flex items-center space-x-2">
                  <HelpCircle className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Discussing: <strong>{selectedFile?.path || 'none'}</strong></span>
                </div>

                {/* Messages Log */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth">
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-12 text-slate-600 space-y-2">
                      <HelpCircle className="h-8 w-8 mx-auto text-slate-700 animate-bounce" />
                      <p className="text-xs font-semibold text-slate-500">Ask a question about this file</p>
                      <p className="text-[10px] text-slate-600 max-w-xs mx-auto leading-normal">
                        "Explain what this function does", "How can I rewrite this to be faster?", or "Find security concerns here."
                      </p>
                    </div>
                  ) : (
                    chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col p-3 rounded-lg max-w-[90%] text-xs leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-indigo-600/10 border border-indigo-500/20 text-indigo-300 self-end ml-auto'
                            : 'bg-[#121824] border border-borderDark/40 text-slate-300 self-start mr-auto'
                        }`}
                      >
                        <span className="text-[9px] font-bold text-slate-500 mb-1 uppercase">
                          {msg.role === 'user' ? 'You' : 'AI Assistant'}
                        </span>
                        
                        {/* Render simple markdown lines */}
                        <div className="space-y-1.5 font-light">
                          {msg.content.split('\n').map((line, lIdx) => {
                            if (line.startsWith('### ')) {
                              return <h4 key={lIdx} className="font-bold text-white pt-1">{line.replace('### ', '')}</h4>;
                            }
                            if (line.startsWith('* ')) {
                              return <li key={lIdx} className="list-disc pl-3">{line.replace('* ', '')}</li>;
                            }
                            if (line.startsWith('**') && line.endsWith('**')) {
                              return <p key={lIdx} className="font-semibold text-indigo-400">{line.replace(/\*\*/g, '')}</p>;
                            }
                            return <p key={lIdx}>{line}</p>;
                          })}
                        </div>
                      </div>
                    ))
                  )}
                  {chatLoading && (
                    <div className="bg-[#121824] border border-borderDark/40 text-slate-500 p-3 rounded-lg max-w-[90%] text-xs self-start flex items-center space-x-2 animate-pulse">
                      <RefreshCw className="h-3 w-3 animate-spin text-indigo-400" />
                      <span>Thinking...</span>
                    </div>
                  )}
                </div>

                {/* Input form */}
                <form onSubmit={handleSendChat} className="p-3 border-t border-borderDark/40 bg-[#0f131a] flex gap-2">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    disabled={!selectedFile || chatLoading}
                    placeholder={selectedFile ? "Type your question..." : "Select a file first"}
                    className="flex-1 bg-[#0a0d14] border border-borderDark/60 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none transition-colors disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!selectedFile || !question.trim() || chatLoading}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white p-2 rounded-lg transition-colors flex-shrink-0"
                  >
                    <Send className="h-4.5 w-4.5" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Terminal, ShieldAlert, Zap, Layers, Calendar, ChevronRight, FileText, BarChart3, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.reviews.getAll();
        if (res.success) {
          setReviews(res.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard statistics:', err);
        setError('Unable to reach backend services. Please confirm your database and API server are online.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Compute stats
  const totalScans = reviews.length;
  const avgScore = totalScans > 0 
    ? Math.round(reviews.reduce((acc, curr) => acc + curr.overallScore, 0) / totalScans) 
    : 0;

  const totalIssues = reviews.reduce((acc, curr) => acc + (curr.issues?.length || 0), 0);
  const securityIssuesCount = reviews.reduce((acc, curr) => acc + (curr.issues?.filter(i => i.category === 'security').length || 0), 0);
  const perfIssuesCount = reviews.reduce((acc, curr) => acc + (curr.issues?.filter(i => i.category === 'performance').length || 0), 0);

  // Format Recharts data (reverse to sort chronologically for charts)
  const chartData = [...reviews].reverse().map(review => ({
    date: new Date(review.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    score: review.overallScore,
    security: review.securityScore,
    performance: review.performanceScore,
    cleanCode: review.cleanCodeScore,
    architecture: review.architectureScore
  }));

  const issueDistributionData = [
    { name: 'Security', count: securityIssuesCount, fill: '#ef4444' },
    { name: 'Performance', count: perfIssuesCount, fill: '#f59e0b' },
    { name: 'Clean Code', count: reviews.reduce((acc, curr) => acc + (curr.issues?.filter(i => i.category === 'cleanCode').length || 0), 0), fill: '#6366f1' },
    { name: 'Architecture', count: reviews.reduce((acc, curr) => acc + (curr.issues?.filter(i => i.category === 'architecture').length || 0), 0), fill: '#10b981' }
  ];

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-borderDark/40 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Developer Console</h1>
          <p className="text-xs text-slate-500 mt-1">Monitor historical codebase scans, score tracking metrics, and pending recommendations.</p>
        </div>
        <Link
          to="/review"
          className="flex items-center space-x-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg transition-all"
        >
          <Terminal className="h-4 w-4" />
          <span>Launch Code Review</span>
        </Link>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-4 py-3 rounded-lg flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
        </div>
      ) : totalScans === 0 ? (
        /* Empty State */
        <div className="glass-panel p-16 text-center max-w-xl mx-auto space-y-5">
          <div className="h-14 w-14 rounded-full bg-slate-900 border border-borderDark flex items-center justify-center mx-auto text-indigo-400 animate-pulse">
            <BarChart3 className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-md font-semibold text-slate-200">No codebase review reports found</h3>
            <p className="text-xs text-slate-500 leading-normal max-w-xs mx-auto">
              Run your first static or AI-driven code review on a GitHub repository link or code block to view metrics.
            </p>
          </div>
          <Link
            to="/review"
            className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-5 py-2.5 rounded-lg transition-all"
          >
            <span>Scan repository now</span>
          </Link>
        </div>
      ) : (
        /* Full Dashboard Content */
        <div className="space-y-8">
          {/* Key Metrics cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card p-5 border border-borderDark/40 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Average Quality Score</span>
                <p className="text-3xl font-extrabold text-white mt-1.5">{avgScore}<span className="text-xs text-slate-500 font-normal">/100</span></p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <BarChart3 className="h-5 w-5" />
              </div>
            </div>

            <div className="glass-card p-5 border border-borderDark/40 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Repos Analyzed</span>
                <p className="text-3xl font-extrabold text-white mt-1.5">{totalScans}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Layers className="h-5 w-5" />
              </div>
            </div>

            <div className="glass-card p-5 border border-borderDark/40 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Security Issues Audited</span>
                <p className="text-3xl font-extrabold text-red-400 mt-1.5">{securityIssuesCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <ShieldAlert className="h-5 w-5" />
              </div>
            </div>

            <div className="glass-card p-5 border border-borderDark/40 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Performance Violations</span>
                <p className="text-3xl font-extrabold text-amber-400 mt-1.5">{perfIssuesCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Zap className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Score Trend LineChart */}
            <div className="glass-panel p-5 border border-borderDark/40 lg:col-span-2 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Quality Score Trends</h3>
                <p className="text-[10px] text-slate-500">Track progress changes across sequential commits or file uploads.</p>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ left: -25, right: 10, top: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#161b22" />
                    <XAxis dataKey="date" stroke="#4b5563" fontSize={9} />
                    <YAxis stroke="#4b5563" fontSize={9} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f131a', border: '1px solid #1e2633', borderRadius: 8, fontSize: 11 }} />
                    <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3 }} name="Overall" />
                    <Line type="monotone" dataKey="security" stroke="#ef4444" strokeWidth={1} dot={false} name="Security" />
                    <Line type="monotone" dataKey="performance" stroke="#f59e0b" strokeWidth={1} dot={false} name="Performance" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Issues Distribution BarChart */}
            <div className="glass-panel p-5 border border-borderDark/40 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Audit Issues Distribution</h3>
                <p className="text-[10px] text-slate-500">Aggregated quantities of findings categorized by severity.</p>
              </div>
              <div className="h-64 w-full flex items-center justify-center">
                {totalIssues === 0 ? (
                  <p className="text-xs text-slate-600">No issues discovered across analyzed records.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={issueDistributionData} margin={{ left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#161b22" />
                      <XAxis dataKey="name" stroke="#4b5563" fontSize={9} />
                      <YAxis stroke="#4b5563" fontSize={9} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f131a', border: '1px solid #1e2633', borderRadius: 8, fontSize: 11 }} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {issueDistributionData.map((entry, index) => (
                          <Bar key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Historical Scans List */}
          <div className="glass-panel border border-borderDark/40 overflow-hidden">
            <div className="px-6 py-4 border-b border-borderDark/40 flex justify-between items-center bg-[#0f131a]/60">
              <h3 className="text-sm font-semibold text-slate-200">Historical Code Review Audits</h3>
              <span className="text-[10px] font-mono text-slate-500">{totalScans} Reports found</span>
            </div>
            
            <div className="divide-y divide-borderDark/30">
              {reviews.map((review) => (
                <Link
                  key={review._id}
                  to={`/results/${review._id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-[#121824]/40 transition-colors group"
                >
                  <div className="flex items-center space-x-4">
                    {/* Score badge */}
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-900 border border-borderDark">
                      <span className={`text-sm font-extrabold ${
                        review.overallScore >= 90 ? 'text-accent-success' :
                        review.overallScore >= 80 ? 'text-accent-primary' :
                        review.overallScore >= 60 ? 'text-accent-warning' : 'text-accent-danger'
                      }`}>
                        {review.overallScore}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-xs font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors">
                        {review.repositoryId?.repoName || 'Manual Code Upload'}
                      </h4>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-500">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                        {review.repositoryId?.repoUrl && (
                          <>
                            <span>&bull;</span>
                            <span className="truncate max-w-[200px]">{review.repositoryId.repoUrl}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Issues tags */}
                    <div className="hidden sm:flex items-center space-x-2">
                      <span className="text-[9px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded">
                        {review.issues?.filter(i => i.category === 'security').length || 0} Security
                      </span>
                      <span className="text-[9px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded">
                        {review.issues?.filter(i => i.category === 'performance').length || 0} Performance
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

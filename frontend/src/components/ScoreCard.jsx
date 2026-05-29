import React from 'react';

const ScoreCard = ({ score, title, subtitle }) => {
  // Determine rating colors and assessment
  let color = 'stroke-accent-success';
  let glowClass = 'glow-emerald border-emerald-500/20';
  let textColor = 'text-accent-success';
  let assessment = 'Excellent';

  if (score < 60) {
    color = 'stroke-accent-danger';
    glowClass = 'glow-danger border-red-500/20';
    textColor = 'text-accent-danger';
    assessment = 'Critical';
  } else if (score < 80) {
    color = 'stroke-accent-warning';
    glowClass = 'glow-warning border-amber-500/20';
    textColor = 'text-accent-warning';
    assessment = 'Review Needed';
  } else if (score < 90) {
    color = 'stroke-accent-primary';
    glowClass = 'glow-indigo border-indigo-500/20';
    textColor = 'text-accent-primary';
    assessment = 'Good';
  }

  // SVG parameters
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={`glass-card p-5 border flex flex-col items-center justify-between transition-all duration-300 ${glowClass}`}>
      <span className="text-xs font-bold text-slate-400 self-start uppercase tracking-wider">{title}</span>
      
      {/* Radial Score Gauge */}
      <div className="relative flex items-center justify-center my-4 h-24 w-24">
        <svg className="h-full w-full -rotate-90">
          {/* Background circle */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            className="stroke-[#1a2333]"
            strokeWidth="6"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            className={`${color} transition-all duration-1000 ease-out`}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>
        {/* Core Center Text */}
        <div className="absolute text-center">
          <span className="text-2xl font-extrabold text-white tracking-tight">{score}</span>
          <span className="text-[10px] text-slate-500 block -mt-1">/100</span>
        </div>
      </div>

      <div className="text-center w-full">
        <span className={`text-xs font-bold ${textColor}`}>{assessment}</span>
        <p className="text-[10px] text-slate-500 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
};

export default ScoreCard;

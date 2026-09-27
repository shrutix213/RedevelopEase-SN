import React from 'react';

export const ProgressBar = ({
  progress = 0,
  label = '',
  size = 'md',
  showPercentage = true,
  color = 'emerald',
  className = '',
}) => {
  const clamped = Math.min(100, Math.max(0, Math.round(progress)));

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const colorGradients = {
    emerald: 'bg-gradient-to-r from-emerald-500 to-teal-600',
    blue: 'bg-gradient-to-r from-blue-500 to-indigo-600',
    amber: 'bg-gradient-to-r from-amber-400 to-amber-600',
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1.5">
          {label && <span>{label}</span>}
          {showPercentage && <span className="font-semibold text-slate-900">{clamped}%</span>}
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${heightClasses[size] || heightClasses.md} ring-1 ring-inset ring-slate-200/50`}>
        <div
          className={`${colorGradients[color] || colorGradients.emerald} h-full rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};

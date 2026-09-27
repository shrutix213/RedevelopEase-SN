import React from 'react';

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl border border-dashed border-slate-200">
      {Icon && (
        <div className="w-12 h-12 mb-3 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h4 className="text-base font-medium text-slate-800 mb-1">{title}</h4>
      <p className="text-sm text-slate-500 max-w-sm mb-4">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

import React from 'react';

const variantStyles = {
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
  blue: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/20',
  amber: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20',
  rose: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20',
  purple: 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-500/20',
  slate: 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/20',
};

export const Badge = ({ children, variant = 'slate', size = 'sm', className = '' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';
  const colorClass = variantStyles[variant] || variantStyles.slate;

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ring-1 ring-inset ${colorClass} ${sizeClasses} ${className}`}
    >
      {children}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  let variant = 'slate';

  switch (status?.toLowerCase()) {
    case 'approved':
    case 'resolved':
    case 'completed':
    case 'disbursed':
    case 'active':
      variant = 'emerald';
      break;
    case 'in progress':
    case 'under review':
    case 'inspection scheduled':
    case 'keys handed over':
    case 'builder appointed':
    case 'da signed':
    case 'demolition':
    case 'excavation & plinth':
    case 'rcc construction':
      variant = 'blue';
      break;
    case 'pending':
    case 'pending_approval':
    case 'submitted':
    case 'open':
    case 'planning':
    case 'tendering':
    case 'scheduled':
      variant = 'amber';
      break;
    case 'rejected':
    case 'deactivated':
    case 'cancelled':
    case 'urgent':
      variant = 'rose';
      break;
    default:
      variant = 'slate';
  }

  return <Badge variant={variant}>{status?.replace('_', ' ')}</Badge>;
};

export const RoleBadge = ({ role }) => {
  switch (role) {
    case 'super_admin':
      return <Badge variant="purple">👑 Super Admin</Badge>;
    case 'secretary':
      return <Badge variant="emerald">🏛️ Secretary</Badge>;
    case 'committee_member':
      return <Badge variant="blue">🤝 Committee</Badge>;
    case 'resident':
      return <Badge variant="slate">🏡 Resident</Badge>;
    case 'builder':
      return <Badge variant="amber">🏗️ Builder</Badge>;
    default:
      return <Badge variant="slate">{role}</Badge>;
  }
};

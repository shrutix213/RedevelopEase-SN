import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  Users,
  HardHat,
  FileText,
  Calendar,
  AlertCircle,
  TrendingUp,
  FolderOpen,
  DollarSign,
  History,
  Settings,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { RoleBadge } from './Badge';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const role = user?.role || 'resident';

  // Define navigation items per role
  const getNavItems = () => {
    switch (role) {
      case 'super_admin':
        return [
          { path: '/dashboard', label: 'Platform Analytics', icon: LayoutDashboard },
          { path: '/societies', label: 'Societies Directory', icon: Building2 },
          { path: '/builders', label: 'Builders Directory', icon: HardHat },
          { path: '/audit-logs', label: 'Platform Audit Logs', icon: History },
          { path: '/settings', label: 'Platform Settings', icon: Settings },
        ];

      case 'secretary':
        return [
          { path: '/dashboard', label: 'Society Dashboard', icon: LayoutDashboard },
          { path: '/society-profile', label: 'Society & Redevelopment', icon: Building2 },
          { path: '/residents', label: 'Residents & Approvals', icon: Users },
          { path: '/redevelopment', label: 'Redevelopment Milestones', icon: TrendingUp },
          { path: '/complaints', label: 'Complaints', icon: AlertCircle },
          { path: '/notices', label: 'Notices Board', icon: FileText },
          { path: '/meetings', label: 'General Meetings', icon: Calendar },
          { path: '/documents', label: 'Document Repository', icon: FolderOpen },
          { path: '/rent-vacating', label: 'Rent & Vacating', icon: DollarSign },
          { path: '/audit-logs', label: 'Activity Logs', icon: History },
        ];

      case 'committee_member':
        return [
          { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { path: '/society-profile', label: 'Society Details', icon: Building2 },
          { path: '/residents', label: 'Resident Directory', icon: Users },
          { path: '/redevelopment', label: 'Redevelopment Progress', icon: TrendingUp },
          { path: '/complaints', label: 'Complaints Review', icon: AlertCircle },
          { path: '/notices', label: 'Notices Board', icon: FileText },
          { path: '/meetings', label: 'Society Meetings', icon: Calendar },
          { path: '/documents', label: 'Documents', icon: FolderOpen },
          { path: '/rent-vacating', label: 'Rent & Vacating Status', icon: DollarSign },
        ];

      case 'builder':
        return [
          { path: '/dashboard', label: 'Builder Dashboard', icon: LayoutDashboard },
          { path: '/redevelopment', label: 'Progress & Milestones', icon: TrendingUp },
          { path: '/documents', label: 'Project Documents', icon: FolderOpen },
        ];

      case 'resident':
      default:
        return [
          { path: '/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
          { path: '/redevelopment', label: 'Redevelopment Status', icon: TrendingUp },
          { path: '/notices', label: 'Society Notices', icon: FileText },
          { path: '/complaints', label: 'Complaints', icon: AlertCircle },
          { path: '/meetings', label: 'Meetings & Minutes', icon: Calendar },
          { path: '/documents', label: 'Documents', icon: FolderOpen },
          { path: '/rent-vacating', label: 'Rent & Vacating Requests', icon: DollarSign },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand logo header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-600/20">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-slate-900">
                Redevelop<span className="text-emerald-600">Ease</span>
              </span>
              <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                Maharashtra CHS
              </span>
            </div>
          </div>
        </div>

        {/* Current Society or Organization badge */}
        {user?.societyId && (
          <div className="px-4 py-2.5 mx-3 mt-3 rounded-lg bg-emerald-50/50 border border-emerald-100/60">
            <div className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
              Active Society
            </div>
            <div className="text-xs font-semibold text-slate-800 truncate">
              {typeof user.societyId === 'object' ? user.societyId.name : 'Greenview Heights CHS'}
            </div>
          </div>
        )}

        {/* Navigation list */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-xs ring-1 ring-emerald-500/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
              </NavLink>
            );
          })}
        </div>

        {/* Bottom user quick info */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-white border border-slate-200/60 shadow-2xs">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">{user?.name}</p>
              <div className="mt-0.5">
                <RoleBadge role={user?.role} />
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

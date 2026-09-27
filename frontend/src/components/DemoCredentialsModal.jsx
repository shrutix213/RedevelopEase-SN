import React from 'react';
import { Modal } from './Modal';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Building2, Users, HardHat, Clock, ArrowRight } from 'lucide-react';

export const DemoCredentialsModal = ({ isOpen, onClose }) => {
  const { quickLogin } = useAuth();
  const navigate = useNavigate();

  const handleSwitch = async (roleKey) => {
    const result = await quickLogin(roleKey);
    onClose();
    if (result?.success) {
      navigate('/dashboard');
    }
  };

  const getRoleIcon = (key) => {
    switch (key) {
      case 'super_admin':
        return <ShieldCheck className="w-5 h-5 text-purple-600" />;
      case 'secretary':
        return <Building2 className="w-5 h-5 text-emerald-600" />;
      case 'committee_member':
        return <Users className="w-5 h-5 text-blue-600" />;
      case 'resident':
        return <Users className="w-5 h-5 text-slate-700" />;
      case 'pending_resident':
        return <Clock className="w-5 h-5 text-amber-600" />;
      case 'builder':
        return <HardHat className="w-5 h-5 text-amber-700" />;
      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Instant Role Switcher & Demo Credentials"
      subtitle="Click any role to immediately test the application from that perspective"
      maxWidth="max-w-2xl"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Object.entries(DEMO_USERS).map(([key, item]) => (
          <div
            key={key}
            onClick={() => handleSwitch(key)}
            className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-white transition-colors">
                    {getRoleIcon(key)}
                  </div>
                  <span className="font-semibold text-sm text-slate-900 group-hover:text-emerald-700">
                    {item.label}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-xs text-slate-500 mb-2">{item.desc}</p>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-400 font-mono flex flex-col gap-0.5">
              <div>Email: <span className="text-slate-700 font-medium">{item.email}</span></div>
              <div>Password: <span className="text-slate-700 font-medium">{item.password}</span></div>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};

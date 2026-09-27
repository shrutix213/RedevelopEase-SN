import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import { Building2, ArrowRight, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

export const LoginPage = () => {
  const { login, quickLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPendingNotice, setIsPendingNotice] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsPendingNotice(false);
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setErrorMessage(result.message);
      if (result.isPending) {
        setIsPendingNotice(true);
      }
    }
  };

  const handleDemoLogin = async (key) => {
    setErrorMessage('');
    setIsPendingNotice(false);
    setLoading(true);

    const creds = DEMO_USERS[key];
    setEmail(creds.email);
    setPassword(creds.password);

    const result = await quickLogin(key);
    setLoading(false);

    if (result?.success) {
      navigate('/dashboard');
    } else {
      setErrorMessage(result?.message || 'Login failed');
      if (result?.isPending) {
        setIsPendingNotice(true);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30">
          <Building2 className="w-6 h-6" />
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          Sign in to Redevelop<span className="text-emerald-600">Ease</span>
        </h2>
        <p className="mt-1.5 text-xs text-slate-500">
          Digital Governance & Redevelopment Platform for Indian Cooperative Housing Societies
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-2xl border border-slate-200/80">
          {/* Quick Demo Switcher Strip */}
          <div className="mb-6 p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-900 mb-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>One-Click Demo Account Login</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(DEMO_USERS).map(([key, item]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleDemoLogin(key)}
                  className="px-2.5 py-1.5 text-xs font-medium bg-white hover:bg-emerald-600 hover:text-white text-slate-700 rounded-lg border border-slate-200 hover:border-emerald-600 transition-all text-left shadow-2xs truncate"
                  title={`${item.label} - ${item.email}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pending Approval Notice */}
          {isPendingNotice && (
            <div className="mb-5 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              <div className="flex items-center gap-2 font-semibold text-amber-800 mb-1">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Account Pending Secretary Approval</span>
              </div>
              <p>
                Your registration is safely on file! The Society Secretary must verify your flat ownership before login access is granted.
              </p>
              <div className="mt-2 text-slate-600 font-mono text-[11px]">
                Tip: Click "Secretary" above to log in as Rajesh Mehta and approve this resident in 1 click!
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && !isPendingNotice && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@redevelopease.in"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? (
                'Authenticating...'
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Registration link */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Are you a society resident?{' '}
              <Link to="/register" className="font-semibold text-emerald-600 hover:text-emerald-700">
                Register for your society
              </Link>
            </p>
          </div>
        </div>

        {/* Feature badges footer */}
        <div className="mt-8 flex justify-center items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> MahaRERA Aligned
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Section 79A Compliant
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Role-Based Security
          </span>
        </div>
      </div>
    </div>
  );
};

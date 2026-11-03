import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  User,
  Stethoscope,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import EcgWave from '../../components/common/EcgWave.jsx';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // One-Click Demo Profiles as specified in requirements
  const handleSelectDemo = (demoRole) => {
    setError('');
    if (demoRole === 'PATIENT') {
      setEmail('patient@medivault.com');
      setPassword('Patient@123456');
    } else if (demoRole === 'DOCTOR') {
      setEmail('doctor@medivault.com');
      setPassword('Doctor@123456');
    } else if (demoRole === 'ADMIN') {
      setEmail('admin@medivault.com');
      setPassword('Admin@123456');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      // Route user to their corresponding role dashboard
      if (data.role === 'PATIENT') {
        navigate('/patient/dashboard');
      } else if (data.role === 'DOCTOR') {
        navigate('/doctor/dashboard');
      } else if (data.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(
        err?.response?.data?.message || 'Invalid email or password. Please verify credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors">
      {/* Subtle background clinical glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-72 bg-gradient-to-b from-teal-500/10 to-transparent blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-700 to-cyan-600 text-white shadow-xl shadow-teal-900/15 mb-3">
            <Activity className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h1 className="font-editorial text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Sign In to MEDIVAULT
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Access your centralized healthcare records & clinical dashboard
          </p>

          {/* Animated ECG Wave Motif */}
          <div className="max-w-[240px] mx-auto mt-2">
            <EcgWave className="h-6 w-full text-teal-600 dark:text-teal-400" />
          </div>
        </div>

        {/* Card Container */}
        <div className="mt-6 bg-white dark:bg-slate-900 py-8 px-6 sm:px-8 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl shadow-slate-900/5">
          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* One-Click Clinical Demo Profiles Box */}
          <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl">
            <span className="block text-[11px] font-mono uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-2.5 text-center">
              ONE-CLICK CLINICAL DEMO PROFILES
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSelectDemo('PATIENT')}
                className="flex flex-col items-center justify-center p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-400 rounded-xl transition-all hover:shadow-xs group cursor-pointer"
              >
                <User className="w-4 h-4 text-sky-600 group-hover:scale-110 transition-transform mb-1" />
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                  Patient
                </span>
                <span className="text-[9px] font-mono text-slate-400">Alex M.</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDemo('DOCTOR')}
                className="flex flex-col items-center justify-center p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-400 rounded-xl transition-all hover:shadow-xs group cursor-pointer"
              >
                <Stethoscope className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform mb-1" />
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                  Doctor
                </span>
                <span className="text-[9px] font-mono text-slate-400">Dr. Sarah</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDemo('ADMIN')}
                className="flex flex-col items-center justify-center p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-slate-500 dark:hover:border-slate-400 rounded-xl transition-all hover:shadow-xs group cursor-pointer"
              >
                <Shield className="w-4 h-4 text-slate-700 dark:text-slate-300 group-hover:scale-110 transition-transform mb-1" />
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                  Admin
                </span>
                <span className="text-[9px] font-mono text-slate-400">System</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Workstation Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="e.g. patient@medivault.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Clinical Authentication Key / Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm rounded-xl shadow-lg shadow-teal-900/15 disabled:opacity-50 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              {loading ? (
                <span>Authenticating Credentials...</span>
              ) : (
                <>
                  <span>Sign In to MEDIVAULT</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Registration Link */}
          <div className="mt-6 text-center pt-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Need a patient or practitioner profile?{' '}
              <Link
                to="/register"
                className="font-semibold text-teal-700 dark:text-teal-400 hover:underline"
              >
                Create an Account
              </Link>
            </p>
          </div>
        </div>

        {/* Security badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs font-mono text-slate-400 dark:text-slate-500">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>256-bit TLS Encrypted · Verified Medical Registry</span>
        </div>
      </div>
    </div>
  );
};

export default Login;

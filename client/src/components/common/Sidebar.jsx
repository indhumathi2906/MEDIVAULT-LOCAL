import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Clock,
  TrendingUp,
  User,
  Users,
  Star,
  Stethoscope,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export const Sidebar = () => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  const patientLinks = [
    { to: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/patient/appointments', label: 'Appointments', icon: Calendar },
    { to: '/patient/doctors', label: 'Physicians Directory', icon: Stethoscope },
    { to: '/patient/prescriptions', label: 'Prescriptions', icon: FileText },
    { to: '/patient/history', label: 'Medical History', icon: Clock },
    {
      to: '/patient/progress',
      label: 'Health Progress',
      icon: TrendingUp,
      badge: 'CORE',
    },
    { to: '/patient/reviews', label: 'Doctor Reviews', icon: Star },
    { to: '/patient/profile', label: 'Patient Profile', icon: User },
  ];

  const doctorLinks = [
    { to: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/doctor/appointments', label: 'Appointments', icon: Calendar },
    { to: '/doctor/patients', label: 'Patient Roster', icon: Users },
    { to: '/doctor/prescriptions', label: 'Prescriptions', icon: FileText },
    { to: '/doctor/reviews', label: 'Patient Reviews', icon: Star },
    { to: '/doctor/profile', label: 'Doctor Profile', icon: User },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'User Directory', icon: Users },
    { to: '/admin/patients', label: 'Patients Registry', icon: User },
    { to: '/admin/doctors', label: 'Physicians Roster', icon: Stethoscope },
    { to: '/admin/appointments', label: 'All Appointments', icon: Calendar },
  ];

  const links =
    role === 'PATIENT'
      ? patientLinks
      : role === 'DOCTOR'
      ? doctorLinks
      : adminLinks;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 min-h-[calc(100vh-4rem)] p-4">
        <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold px-3 mb-2">
          {role} Workspace
        </div>
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
                  }`
                }
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{link.label}</span>
                </div>
                {link.badge && (
                  <span className="px-1.5 py-0.5 text-[9px] font-mono tracking-widest bg-teal-600 text-white rounded font-bold">
                    {link.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Clinical Disclaimer Notice */}
        <div className="mt-auto pt-6 border-t border-slate-200/80 dark:border-slate-800/80">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-xs font-semibold">
              <ShieldAlert className="w-3.5 h-3.5 text-teal-600" />
              <span>HIPAA Compliant</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Encrypted digital clinical ledger with role-based audit trail.
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex items-center justify-around py-2 px-1">
        {links.slice(0, 5).map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center p-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                  isActive
                    ? 'text-teal-700 dark:text-teal-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="truncate max-w-[64px]">{link.label.split(' ')[0]}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};

export default Sidebar;

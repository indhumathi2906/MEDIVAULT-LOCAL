import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  Stethoscope,
  Calendar,
  CheckCircle,
  TrendingUp,
  FileText,
  Activity,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Clock,
  Layers,
} from 'lucide-react';
import api from '../../services/api.js';
import StatCard from '../../components/common/StatCard.jsx';
import Skeleton from '../../components/common/Skeleton.jsx';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Skeleton className="h-32 w-full rounded-3xl" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <Skeleton className="h-28 rounded-2xl" count={6} />
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  const counts = data?.counts || {
    patients: 0,
    doctors: 0,
    appointments: 0,
    completedConsultations: 0,
    prescriptions: 0,
    reviews: 0,
    healthReviews: 0,
    activeUsers: 0,
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Admin Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-full text-xs font-mono font-semibold mb-3">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>ROOT CLINICAL SYSTEM GOVERNANCE</span>
          </div>

          <h1 className="font-editorial text-2xl sm:text-4xl font-extrabold tracking-tight">
            MEDIVAULT Administrative Console
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            Centralized monitoring of hospital network activity, HIPAA-compliant patient registries,
            physician credentials, and security access controls.
          </p>
        </div>

        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-8 opacity-10 pointer-events-none">
          <ShieldAlert className="w-80 h-80 stroke-[1] text-amber-400" />
        </div>
      </div>

      {/* Six Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          title="Total Patients"
          value={counts.patients}
          subtitle="Registered profiles"
          icon={Users}
          colorScheme="sky"
        />
        <StatCard
          title="Verified Physicians"
          value={counts.doctors}
          subtitle="Accredited practitioners"
          icon={Stethoscope}
          colorScheme="teal"
        />
        <StatCard
          title="Appointments"
          value={counts.appointments}
          subtitle="Scheduled encounters"
          icon={Calendar}
          colorScheme="amber"
        />
        <StatCard
          title="Consultations"
          value={counts.completedConsultations}
          subtitle="Completed records"
          icon={CheckCircle}
          colorScheme="emerald"
        />
        <StatCard
          title="Health Reviews"
          value={counts.healthReviews}
          subtitle="Vitals & progress logs"
          icon={TrendingUp}
          colorScheme="teal"
        />
        <StatCard
          title="Active Accounts"
          value={counts.activeUsers}
          subtitle="Total system users"
          icon={UserCheck}
          colorScheme="slate"
        />
      </div>

      {/* Three Shortcut Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/admin/users"
          className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs hover:border-teal-600 transition-all group flex items-center justify-between"
        >
          <div>
            <h4 className="font-editorial font-bold text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
              Manage User Accounts
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Toggle access permissions and role credentials
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to="/admin/patients"
          className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs hover:border-teal-600 transition-all group flex items-center justify-between"
        >
          <div>
            <h4 className="font-editorial font-bold text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
              Patient Registry
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              View demographic records & medical conditions
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to="/admin/doctors"
          className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs hover:border-teal-600 transition-all group flex items-center justify-between"
        >
          <div>
            <h4 className="font-editorial font-bold text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
              Physicians Roster
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Inspect medical licenses and rating telemetry
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Two Column Tables: 8 Most Recent Appointments & 5 Newest Users */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Appointments (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
            <div>
              <h3 className="font-editorial text-lg font-bold text-slate-900 dark:text-white">
                Real-Time Clinical Activity Feed
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                8 most recent appointments across all departments
              </p>
            </div>
            <Link
              to="/admin/appointments"
              className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  <th className="py-2 pr-3">Patient</th>
                  <th className="py-2 pr-3">Physician</th>
                  <th className="py-2 pr-3">Date / Slot</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data?.recentAppointments?.map((appt) => (
                  <tr key={appt._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 pr-3 font-semibold text-slate-900 dark:text-white">
                      {appt.patientId?.userId?.name || 'Patient'}
                    </td>
                    <td className="py-2.5 pr-3 text-slate-600 dark:text-slate-300">
                      {appt.doctorId?.userId?.name || 'Doctor'}
                    </td>
                    <td className="py-2.5 pr-3 font-mono text-[11px] text-slate-500">
                      {appt.date} · {appt.timeSlot}
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`px-2 py-0.5 text-[9px] font-mono uppercase font-bold rounded ${
                          appt.status === 'Completed'
                            ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                            : appt.status === 'Confirmed'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {appt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5 Newest Users (1 col) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
            <h3 className="font-editorial text-lg font-bold text-slate-900 dark:text-white">
              Newest Registrations
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Latest user accounts provisioned
            </p>
          </div>

          <div className="space-y-3">
            {data?.newestUsers?.map((u) => (
              <div
                key={u._id}
                className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{u.name}</h4>
                  <p className="font-mono text-[11px] text-slate-500 truncate max-w-[150px]">
                    {u.email}
                  </p>
                </div>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded">
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

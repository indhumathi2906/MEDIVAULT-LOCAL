import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  FileText,
  Clock,
  TrendingUp,
  AlertCircle,
  Activity,
  Plus,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api.js';
import StatCard from '../../components/common/StatCard.jsx';
import Skeleton from '../../components/common/Skeleton.jsx';
import VitalsSummaryCard from '../../components/patient/VitalsSummaryCard.jsx';
import BookAppointmentModal from '../../components/patient/BookAppointmentModal.jsx';

export const PatientDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [progressSummary, setProgressSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [dashRes, profileRes] = await Promise.all([
        api.get('/patients/dashboard'),
        api.get('/patients/profile'),
      ]);

      setDashboardData(dashRes.data);

      if (profileRes.data?._id) {
        const sumRes = await api.get(`/progress/patient/${profileRes.data._id}/summary`);
        setProgressSummary(sumRes.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError('Unable to load clinical records. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCancelAppointment = async (apptId) => {
    if (!window.confirm('Are you sure you wish to cancel this scheduled consultation?')) return;
    try {
      await api.delete(`/appointments/${apptId}`);
      loadData();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Skeleton className="h-32 w-full rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-2xl" count={4} />
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  const stats = dashboardData?.stats || {
    upcomingVisits: 0,
    activePrescriptions: 0,
    clinicalHealthStatus: 'Stable',
    nextFollowUp: 'None scheduled',
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Welcome Hero Section with Bento Structure */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/10 border border-teal-500/30 text-teal-300 rounded-full text-xs font-mono font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>AUTHENTICATED CLINICAL HEALTH RECORD</span>
          </div>

          <h1 className="font-editorial text-2xl sm:text-4xl font-extrabold tracking-tight">
            Welcome, {user?.name}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            Centralized digital vault for your ambulatory visits, pharmacotherapy regimens,
            cardiovascular biomarkers, and verified physician evaluations.
          </p>

          {/* Hero Action Buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsBookModalOpen(true)}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-teal-950/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>

            <Link
              to="/patient/progress"
              className="px-5 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 text-white text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-2 transition-all"
            >
              <TrendingUp className="w-4 h-4 text-teal-400" />
              <span>View Health Trends</span>
            </Link>
          </div>
        </div>

        {/* Decorative background pulse graphic */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-8 opacity-10 pointer-events-none">
          <Activity className="w-80 h-80 stroke-[1] text-teal-400" />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-center gap-3 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Four Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Clinical Health Status"
          value={stats.clinicalHealthStatus}
          subtitle="Physician evaluated overall status"
          icon={Activity}
          colorScheme={
            stats.clinicalHealthStatus === 'Improving'
              ? 'emerald'
              : stats.clinicalHealthStatus === 'Needs Attention'
              ? 'amber'
              : 'teal'
          }
        />

        <StatCard
          title="Upcoming Visits"
          value={stats.upcomingVisits}
          subtitle="Scheduled specialist consultations"
          icon={Calendar}
          colorScheme="sky"
        />

        <StatCard
          title="Active Digital Rx"
          value={stats.activePrescriptions}
          subtitle="Certified dispensary regimens"
          icon={FileText}
          colorScheme="emerald"
        />

        <StatCard
          title="Next Follow-up"
          value={stats.nextFollowUp !== 'None scheduled' ? stats.nextFollowUp : 'Pending'}
          subtitle="Recommended clinical review"
          icon={Clock}
          colorScheme="slate"
        />
      </div>

      {/* Physician Health Progress Review Panel */}
      <VitalsSummaryCard summary={progressSummary} patientId={dashboardData?.profile?._id} />

      {/* Upcoming Scheduled Consultations */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="font-editorial text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Scheduled Clinical Consultations
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Upcoming appointments with attending hospital specialists
            </p>
          </div>
          <Link
            to="/patient/appointments"
            className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1"
          >
            <span>Manage All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
          {!dashboardData?.upcomingAppointments || dashboardData.upcomingAppointments.length === 0 ? (
            <div className="py-8 text-center">
              <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You have no upcoming consultations scheduled.
              </p>
              <button
                onClick={() => setIsBookModalOpen(true)}
                className="mt-3 text-xs text-teal-700 dark:text-teal-400 font-semibold hover:underline inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Book your next visit now</span>
              </button>
            </div>
          ) : (
            dashboardData.upcomingAppointments.map((appt) => (
              <div
                key={appt._id}
                className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 first:pt-2"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-100 dark:border-teal-900 text-teal-700 dark:text-teal-400 shrink-0">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {appt.doctorId?.userId?.name || 'Attending Physician'}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {appt.doctorId?.specialization} · {appt.doctorId?.hospitalName}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 italic">
                      "{appt.reason}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center font-mono">
                  <div className="text-right">
                    <span className="block text-xs font-bold text-slate-900 dark:text-white">
                      {appt.date}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {appt.timeSlot}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 text-[10px] uppercase font-semibold rounded-md border ${
                      appt.status === 'Confirmed'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}
                  >
                    {appt.status}
                  </span>

                  <button
                    onClick={() => handleCancelAppointment(appt._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Cancel Appointment"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Book Appointment Modal */}
      <BookAppointmentModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
};

export default PatientDashboard;

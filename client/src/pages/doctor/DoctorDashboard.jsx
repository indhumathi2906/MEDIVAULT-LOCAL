import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  FileText,
  Star,
  Stethoscope,
  Activity,
  Plus,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api.js';
import StatCard from '../../components/common/StatCard.jsx';
import Skeleton from '../../components/common/Skeleton.jsx';
import ConsultationModal from '../../components/doctor/ConsultationModal.jsx';
import IssuePrescriptionModal from '../../components/doctor/IssuePrescriptionModal.jsx';
import RecordProgressModal from '../../components/doctor/RecordProgressModal.jsx';

export const DoctorDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal active targets
  const [consultationAppt, setConsultationAppt] = useState(null);
  const [prescriptionAppt, setPrescriptionAppt] = useState(null);
  const [progressPatient, setProgressPatient] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/doctors/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load doctor dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleUpdateStatus = async (apptId, status) => {
    try {
      await api.put(`/appointments/${apptId}`, { status });
      fetchDashboard();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to update appointment status');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Skeleton className="h-32 w-full rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <Skeleton className="h-28 rounded-2xl" count={6} />
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  const stats = data?.stats || {
    todayVisits: 0,
    upcomingAppointments: 0,
    pendingAppointments: 0,
    completedConsultations: 0,
    totalPrescriptions: 0,
    uniquePatients: 0,
    averageRating: 0,
    totalReviews: 0,
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Doctor Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/10 border border-teal-500/30 text-teal-300 rounded-full text-xs font-mono font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ACCREDITED PHYSICIAN WORKSTATION</span>
          </div>

          <h1 className="font-editorial text-2xl sm:text-4xl font-extrabold tracking-tight">
            Welcome, {user?.name}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            {data?.profile?.specialization} · {data?.profile?.hospitalName}
            <br />
            License #{data?.profile?.licenseNumber} · Active clinical encounters and schedule management.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/doctor/appointments"
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-teal-950/20 flex items-center gap-2 transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>View Full Clinical Schedule</span>
            </Link>

            <Link
              to="/doctor/patients"
              className="px-5 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 text-white text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-2 transition-all"
            >
              <Users className="w-4 h-4 text-teal-400" />
              <span>Assigned Patient Roster</span>
            </Link>
          </div>
        </div>

        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-8 opacity-10 pointer-events-none">
          <Stethoscope className="w-80 h-80 stroke-[1] text-teal-400" />
        </div>
      </div>

      {/* Six Doctor Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          title="Today's Visits"
          value={stats.todayVisits}
          subtitle="Scheduled encounters"
          icon={Calendar}
          colorScheme="teal"
        />
        <StatCard
          title="Pending Requests"
          value={stats.pendingAppointments}
          subtitle="Awaiting physician triage"
          icon={Clock}
          colorScheme="amber"
        />
        <StatCard
          title="Completed"
          value={stats.completedConsultations}
          subtitle="Finalized clinical records"
          icon={CheckCircle2}
          colorScheme="emerald"
        />
        <StatCard
          title="Issued Rx"
          value={stats.totalPrescriptions}
          subtitle="Digital dispensary orders"
          icon={FileText}
          colorScheme="sky"
        />
        <StatCard
          title="Active Patients"
          value={stats.uniquePatients}
          subtitle="Individual cases"
          icon={Users}
          colorScheme="slate"
        />
        <StatCard
          title="Rating"
          value={stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '5.0'}
          subtitle={`${stats.totalReviews} verified reviews`}
          icon={Star}
          colorScheme="amber"
        />
      </div>

      {/* Today's Schedule and Encounter Actions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="font-editorial text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Today's Scheduled Encounters ({data?.todayAppointments?.length || 0})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Execute consultations, issue electronic prescriptions, and log progress evaluations
            </p>
          </div>

          <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-400">
            {new Date().toISOString().split('T')[0]}
          </span>
        </div>

        <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
          {!data?.todayAppointments || data.todayAppointments.length === 0 ? (
            <div className="py-12 text-center">
              <Clock className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No clinical consultations booked for today.
              </p>
            </div>
          ) : (
            data.todayAppointments.map((appt) => (
              <div
                key={appt._id}
                className="py-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 first:pt-2"
              >
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-400 px-2 py-0.5 bg-teal-50 dark:bg-teal-950/60 rounded">
                      {appt.timeSlot}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {appt.patientId?.userId?.name || 'Patient'}
                    </h4>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-mono uppercase font-bold rounded-md border ${
                        appt.status === 'Confirmed'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : appt.status === 'Completed'
                          ? 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300'
                          : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {appt.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 italic">
                    Reason: "{appt.reason}"
                  </p>
                </div>

                {/* Quick Clinical Encounter Actions */}
                <div className="flex flex-wrap items-center gap-2 self-end lg:self-center">
                  {appt.status === 'Pending' && (
                    <button
                      onClick={() => handleUpdateStatus(appt._id, 'Confirmed')}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm</span>
                    </button>
                  )}

                  {appt.status !== 'Completed' && appt.status !== 'Cancelled' && (
                    <button
                      onClick={() => setConsultationAppt(appt)}
                      className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>Record Consultation</span>
                    </button>
                  )}

                  <button
                    onClick={() => setPrescriptionAppt(appt)}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-teal-600" />
                    <span>Issue Rx</span>
                  </button>

                  <button
                    onClick={() =>
                      setProgressPatient({
                        id: appt.patientId?._id,
                        name: appt.patientId?.userId?.name,
                        apptId: appt._id,
                      })
                    }
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                    <span>Log Vitals</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Consultation Modal */}
      {consultationAppt && (
        <ConsultationModal
          isOpen={!!consultationAppt}
          appointment={consultationAppt}
          onClose={() => setConsultationAppt(null)}
          onSuccess={() => {
            fetchDashboard();
            setConsultationAppt(null);
          }}
        />
      )}

      {/* Prescription Modal */}
      {prescriptionAppt && (
        <IssuePrescriptionModal
          isOpen={!!prescriptionAppt}
          appointment={prescriptionAppt}
          onClose={() => setPrescriptionAppt(null)}
          onSuccess={() => {
            fetchDashboard();
            setPrescriptionAppt(null);
          }}
        />
      )}

      {/* Progress Modal */}
      {progressPatient && (
        <RecordProgressModal
          isOpen={!!progressPatient}
          patientId={progressPatient.id}
          patientName={progressPatient.name}
          appointmentId={progressPatient.apptId}
          onClose={() => setProgressPatient(null)}
          onSuccess={() => {
            fetchDashboard();
            setProgressPatient(null);
          }}
        />
      )}
    </div>
  );
};

export default DoctorDashboard;

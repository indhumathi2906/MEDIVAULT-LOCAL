import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  Check,
  X,
  Stethoscope,
  FileText,
  TrendingUp,
  Filter,
} from 'lucide-react';
import api from '../../services/api.js';
import Skeleton from '../../components/common/Skeleton.jsx';
import ConsultationModal from '../../components/doctor/ConsultationModal.jsx';
import IssuePrescriptionModal from '../../components/doctor/IssuePrescriptionModal.jsx';
import RecordProgressModal from '../../components/doctor/RecordProgressModal.jsx';

export const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const [consultationAppt, setConsultationAppt] = useState(null);
  const [prescriptionAppt, setPrescriptionAppt] = useState(null);
  const [progressPatient, setProgressPatient] = useState(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/appointments');
      setAppointments(data);
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/appointments/${id}`, { status });
      fetchAppointments();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to update status');
    }
  };

  const filtered = appointments.filter((a) => {
    if (filter === 'ALL') return true;
    return a.status.toUpperCase() === filter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300';
      case 'Completed':
        return 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300';
      case 'Pending':
      default:
        return 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="font-editorial text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Physician Consultation Encounters
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Review, triage, and execute patient appointments with integrated medical diagnostics
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
              filter === tab
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 rounded-2xl" count={3} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
          <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="font-editorial text-lg font-bold text-slate-900 dark:text-white">
            No Appointments Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            No appointments match the "{filter}" filter.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((appt) => (
            <div
              key={appt._id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 transition-all hover:border-slate-300 dark:hover:border-slate-700"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-100 dark:border-teal-900 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold text-sm shrink-0">
                  {appt.patientId?.userId?.name?.charAt(0) || 'P'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {appt.patientId?.userId?.name || 'Patient'}
                    </h3>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-mono uppercase font-bold rounded-md border ${getStatusBadge(
                        appt.status
                      )}`}
                    >
                      {appt.status}
                    </span>
                  </div>

                  <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                    Date: <strong className="text-slate-800 dark:text-slate-200">{appt.date}</strong> at{' '}
                    <strong className="text-slate-800 dark:text-slate-200">{appt.timeSlot}</strong> · Phone: {appt.patientId?.phone || 'N/A'}
                  </p>

                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-1.5 font-medium">
                    Chief Complaint: <span className="font-normal italic">"{appt.reason}"</span>
                  </p>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 self-end lg:self-center shrink-0">
                {appt.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(appt._id, 'Confirmed')}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm</span>
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(appt._id, 'Cancelled')}
                      className="px-3 py-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-xs font-semibold border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer"
                    >
                      <span>Decline</span>
                    </button>
                  </>
                )}

                {appt.status !== 'Completed' && appt.status !== 'Cancelled' && (
                  <button
                    onClick={() => setConsultationAppt(appt)}
                    className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>Examine & Complete</span>
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
          ))}
        </div>
      )}

      {consultationAppt && (
        <ConsultationModal
          isOpen={!!consultationAppt}
          appointment={consultationAppt}
          onClose={() => setConsultationAppt(null)}
          onSuccess={() => {
            fetchAppointments();
            setConsultationAppt(null);
          }}
        />
      )}

      {prescriptionAppt && (
        <IssuePrescriptionModal
          isOpen={!!prescriptionAppt}
          appointment={prescriptionAppt}
          onClose={() => setPrescriptionAppt(null)}
          onSuccess={() => {
            fetchAppointments();
            setPrescriptionAppt(null);
          }}
        />
      )}

      {progressPatient && (
        <RecordProgressModal
          isOpen={!!progressPatient}
          patientId={progressPatient.id}
          patientName={progressPatient.name}
          appointmentId={progressPatient.apptId}
          onClose={() => setProgressPatient(null)}
          onSuccess={() => {
            fetchAppointments();
            setProgressPatient(null);
          }}
        />
      )}
    </div>
  );
};

export default DoctorAppointments;

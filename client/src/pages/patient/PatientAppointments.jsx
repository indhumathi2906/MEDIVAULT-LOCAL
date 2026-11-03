import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Clock,
  Stethoscope,
  XCircle,
  Filter,
  CheckCircle,
} from 'lucide-react';
import api from '../../services/api.js';
import BookAppointmentModal from '../../components/patient/BookAppointmentModal.jsx';
import Skeleton from '../../components/common/Skeleton.jsx';

export const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

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

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await api.delete(`/appointments/${id}`);
      fetchAppointments();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  const filteredAppointments = appointments.filter((a) => {
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
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Clinical Appointments
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review scheduled consultations, historic clinic visits, and physician availability
          </p>
        </div>

        <button
          onClick={() => setIsBookModalOpen(true)}
          className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold shadow-md shadow-teal-900/10 flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Book Consultation</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-colors cursor-pointer ${
              filter === tab
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Appointment Cards List */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 rounded-2xl" count={3} />
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
          <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="font-editorial text-lg font-bold text-slate-900 dark:text-white">
            No Appointments Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            No consultations found under the "{filter}" category filter.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appt) => (
            <div
              key={appt._id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-slate-300 dark:hover:border-slate-700"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-3 bg-teal-50 dark:bg-teal-950/60 border border-teal-100 dark:border-teal-900 text-teal-700 dark:text-teal-400 rounded-xl shrink-0">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {appt.doctorId?.userId?.name || 'Physician Specialist'}
                    </h3>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-mono uppercase font-bold rounded-md border ${getStatusBadge(
                        appt.status
                      )}`}
                    >
                      {appt.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {appt.doctorId?.specialization} · {appt.doctorId?.hospitalName}
                  </p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 font-medium">
                    Complaint / Reason: <span className="font-normal italic">"{appt.reason}"</span>
                  </p>
                  {appt.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Notes: {appt.notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-center shrink-0 font-mono">
                <div className="text-right">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                    <Calendar className="w-3.5 h-3.5 text-teal-600" />
                    <span>{appt.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5 justify-end">
                    <Clock className="w-3 h-3" />
                    <span>{appt.timeSlot}</span>
                  </div>
                </div>

                {appt.status !== 'Cancelled' && appt.status !== 'Completed' && (
                  <button
                    onClick={() => handleCancel(appt._id)}
                    className="px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-900/60 font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      <BookAppointmentModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        onSuccess={fetchAppointments}
      />
    </div>
  );
};

export default PatientAppointments;

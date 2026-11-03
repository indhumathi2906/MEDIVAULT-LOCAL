import React, { useState, useEffect } from 'react';
import { Calendar, Search, Clock, Stethoscope, User, Filter } from 'lucide-react';
import api from '../../services/api.js';
import Skeleton from '../../components/common/Skeleton.jsx';

export const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const fetchAppts = async () => {
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
    fetchAppts();
  }, []);

  const filtered = appointments.filter((a) => {
    if (statusFilter !== 'ALL' && a.status.toUpperCase() !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const patientMatch = a.patientId?.userId?.name?.toLowerCase().includes(q);
      const docMatch = a.doctorId?.userId?.name?.toLowerCase().includes(q);
      const reasonMatch = a.reason?.toLowerCase().includes(q);
      return patientMatch || docMatch || reasonMatch;
    }
    return true;
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
      <div>
        <h1 className="font-editorial text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          System-Wide Scheduled Encounters & Visits
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Complete network audit of clinical appointments, booking statuses, and consultation notes
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by patient, physician, or chief complaint..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                statusFilter === tab
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-12 w-full rounded-xl" count={4} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-6">Patient</th>
                  <th className="py-3 px-6">Attending Physician</th>
                  <th className="py-3 px-6">Encounter Schedule</th>
                  <th className="py-3 px-6">Reason / Complaint</th>
                  <th className="py-3 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((a) => (
                  <tr
                    key={a._id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3.5 px-6 font-bold text-slate-900 dark:text-white">
                      {a.patientId?.userId?.name || 'Patient'}
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-teal-700 dark:text-teal-400">
                      {a.doctorId?.userId?.name || 'Doctor'}
                    </td>
                    <td className="py-3.5 px-6 font-mono text-slate-600 dark:text-slate-300">
                      {a.date} · {a.timeSlot}
                    </td>
                    <td className="py-3.5 px-6 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {a.reason}
                    </td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-mono uppercase font-bold rounded border ${getStatusBadge(
                          a.status
                        )}`}
                      >
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAppointments;

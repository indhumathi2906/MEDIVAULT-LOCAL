import React, { useState, useEffect } from 'react';
import { Clock, Filter, Search } from 'lucide-react';
import api from '../../services/api.js';
import MedicalTimeline from '../../components/patient/MedicalTimeline.jsx';
import PrescriptionCertificate from '../../components/prescription/PrescriptionCertificate.jsx';
import Skeleton from '../../components/common/Skeleton.jsx';

export const PatientHistory = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/patients/history');
      setEvents(data);
    } catch (err) {
      console.error('Failed to fetch patient timeline:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, []);

  const handleSelectPrescription = async (prescriptionId) => {
    try {
      const { data } = await api.get(`/prescriptions/${prescriptionId}`);
      setSelectedPrescription(data);
    } catch (err) {
      console.error('Failed to load prescription:', err);
    }
  };

  const filteredEvents = events.filter((ev) => {
    if (typeFilter !== 'ALL' && ev.type !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = ev.title?.toLowerCase().includes(q);
      const matchDoc = ev.doctor?.toLowerCase().includes(q);
      const matchDiag = ev.details?.diagnosis?.toLowerCase().includes(q);
      return matchTitle || matchDoc || matchDiag;
    }
    return true;
  });

  if (selectedPrescription) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <PrescriptionCertificate
          prescription={selectedPrescription}
          onBack={() => setSelectedPrescription(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="font-editorial text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Comprehensive Medical Milestone History
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Chronological audit trail of all clinic visits, physician examinations, e-prescriptions, and vital assessments
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl shadow-xs">
        {/* Type tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['ALL', 'APPOINTMENT', 'CONSULTATION', 'PRESCRIPTION', 'PROGRESS_RECORD'].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setTypeFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  typeFilter === tab
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab === 'PROGRESS_RECORD' ? 'PROGRESS' : tab}
              </button>
            )
          )}
        </div>

        {/* Search */}
        <div className="relative sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search timeline..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
        </div>
      </div>

      {/* Timeline View */}
      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-32 rounded-2xl" count={3} />
        </div>
      ) : (
        <MedicalTimeline
          events={filteredEvents}
          onSelectPrescription={handleSelectPrescription}
        />
      )}
    </div>
  );
};

export default PatientHistory;

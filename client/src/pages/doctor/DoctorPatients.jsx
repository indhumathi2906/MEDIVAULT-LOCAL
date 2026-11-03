import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Calendar,
  Clock,
  Heart,
  FileText,
  TrendingUp,
  AlertCircle,
  Eye,
  Activity,
} from 'lucide-react';
import api from '../../services/api.js';
import Skeleton from '../../components/common/Skeleton.jsx';
import MedicalTimeline from '../../components/patient/MedicalTimeline.jsx';
import RecordProgressModal from '../../components/doctor/RecordProgressModal.jsx';
import Modal from '../../components/common/Modal.jsx';

export const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Selected patient timeline modal
  const [selectedTimelinePatient, setSelectedTimelinePatient] = useState(null);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [timelineLoading, setTimelineLoading] = useState(false);

  // Selected patient for progress logging
  const [progressPatient, setProgressPatient] = useState(null);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/doctors/patients');
      setPatients(data);
    } catch (err) {
      console.error('Failed to load patient roster:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleOpenTimeline = async (patient) => {
    setSelectedTimelinePatient(patient);
    setTimelineLoading(true);
    try {
      const { data } = await api.get(`/patients/${patient._id}/history`);
      setTimelineEvents(data);
    } catch (err) {
      console.error('Failed to load patient timeline:', err);
    } finally {
      setTimelineLoading(false);
    }
  };

  const filteredPatients = patients.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const nameMatch = p.userId?.name?.toLowerCase().includes(q);
    const diagMatch = p.latestDiagnosis?.toLowerCase().includes(q);
    const bloodMatch = p.bloodGroup?.toLowerCase().includes(q);
    return nameMatch || diagMatch || bloodMatch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="font-editorial text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Assigned Patient Clinical Roster
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Roster of active patients evaluated, scheduled, or managed under your clinical care
        </p>
      </div>

      {/* Search Input */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Filter by patient name, latest clinical diagnosis, blood group..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none"
        />
      </div>

      {/* Patients Roster Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-56 rounded-2xl" count={3} />
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
          <Users className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="font-editorial text-lg font-bold text-slate-900 dark:text-white">
            No Patient Records Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Patients who schedule consultations or undergo examinations with you will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((p) => (
            <div
              key={p._id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between transition-all hover:border-slate-300 dark:hover:border-slate-700"
            >
              <div>
                <div className="flex items-start gap-3.5 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-900 text-sky-700 dark:text-sky-400 flex items-center justify-center font-bold text-base shrink-0">
                    {p.userId?.name?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {p.userId?.name}
                    </h3>
                    <p className="text-xs font-mono text-slate-500">
                      DOB: {p.dateOfBirth || 'N/A'} · Gender: {p.gender || 'N/A'}
                    </p>
                    <span className="inline-block mt-1 text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded">
                      Blood Group: {p.bloodGroup || 'O+'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Latest Diagnosis:
                    </span>
                    <p className="font-medium text-teal-800 dark:text-teal-300 mt-0.5">
                      {p.latestDiagnosis}
                    </p>
                  </div>

                  {p.latestAppointmentDate && (
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Last Encounter: {p.latestAppointmentDate}</span>
                    </div>
                  )}

                  {p.allergies && p.allergies.length > 0 && (
                    <div className="pt-1">
                      <span className="text-[10px] font-mono uppercase text-rose-600 dark:text-rose-400 font-bold block">
                        Drug Allergies:
                      </span>
                      <p className="text-[11px] text-rose-700 dark:text-rose-300 font-semibold">
                        {p.allergies.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => handleOpenTimeline(p)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Timeline</span>
                </button>

                <button
                  onClick={() =>
                    setProgressPatient({
                      id: p._id,
                      name: p.userId?.name,
                    })
                  }
                  className="flex-1 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Log Vitals</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Patient Medical Timeline Modal */}
      {selectedTimelinePatient && (
        <Modal
          isOpen={!!selectedTimelinePatient}
          onClose={() => setSelectedTimelinePatient(null)}
          title={`Clinical Timeline: ${selectedTimelinePatient.userId?.name}`}
          subtitle={`Patient Record #${selectedTimelinePatient._id.slice(-6).toUpperCase()} · Blood Group: ${selectedTimelinePatient.bloodGroup || 'N/A'}`}
          maxWidth="max-w-4xl"
        >
          {timelineLoading ? (
            <div className="space-y-4 py-8">
              <Skeleton className="h-32 rounded-2xl" count={2} />
            </div>
          ) : (
            <div className="py-2">
              <MedicalTimeline events={timelineEvents} />
            </div>
          )}
        </Modal>
      )}

      {/* Progress Logging Modal */}
      {progressPatient && (
        <RecordProgressModal
          isOpen={!!progressPatient}
          patientId={progressPatient.id}
          patientName={progressPatient.name}
          onClose={() => setProgressPatient(null)}
          onSuccess={() => {
            alert('Clinical vital review logged successfully!');
            setProgressPatient(null);
          }}
        />
      )}
    </div>
  );
};

export default DoctorPatients;

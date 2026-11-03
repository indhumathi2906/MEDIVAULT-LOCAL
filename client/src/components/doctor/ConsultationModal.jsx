import React, { useState } from 'react';
import { Stethoscope, AlertCircle, CheckCircle2 } from 'lucide-react';
import Modal from '../common/Modal.jsx';
import api from '../../services/api.js';

export const ConsultationModal = ({ isOpen, onClose, appointment, onSuccess }) => {
  const [symptoms, setSymptoms] = useState('');
  const [clinicalObservations, setClinicalObservations] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!appointment) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Business Rule 3: requires appointmentId and diagnosis
    if (!diagnosis.trim()) {
      setError('Diagnosis is mandatory to finalize a clinical consultation');
      return;
    }

    setLoading(true);
    try {
      await api.post('/consultations', {
        appointmentId: appointment._id,
        symptoms,
        clinicalObservations,
        diagnosis,
        doctorNotes,
        followUpDate,
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to submit clinical consultation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Complete Clinical Consultation"
      subtitle={`Patient: ${appointment.patientId?.userId?.name || 'Patient'} · Scheduled: ${appointment.date} at ${appointment.timeSlot}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
          <span className="font-semibold text-slate-800 dark:text-slate-200">Patient Chief Complaint:</span>{' '}
          {appointment.reason}
        </div>

        {/* Symptoms */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Reported Symptoms
          </label>
          <textarea
            rows={2}
            placeholder="Document patient reported symptoms, onset, and severity..."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600 resize-none"
          />
        </div>

        {/* Clinical Observations */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Clinical Examination & Objective Findings
          </label>
          <textarea
            rows={2}
            placeholder="Auscultation, heart sounds, neurological checks, ambulatory observations..."
            value={clinicalObservations}
            onChange={(e) => setClinicalObservations(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600 resize-none"
          />
        </div>

        {/* Diagnosis (Required) */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Definitive Diagnosis *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Essential Hypertension (Stage 1), Tension Cephalea, Acute Bronchitis"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600 font-medium"
          />
        </div>

        {/* Doctor Directives */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Physician Orders & Lifestyle Directives
          </label>
          <textarea
            rows={2}
            placeholder="Dietary adjustments, physical activity instructions, laboratory follow-up orders..."
            value={doctorNotes}
            onChange={(e) => setDoctorNotes(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600 resize-none"
          />
        </div>

        {/* Follow Up Date */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Recommended Follow-Up Date
          </label>
          <input
            type="date"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600 font-mono"
          />
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-md shadow-teal-900/10 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {loading ? (
              <span>Finalizing Record...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Finalize & Mark Completed</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ConsultationModal;

import React, { useState } from 'react';
import { Plus, Trash2, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import Modal from '../common/Modal.jsx';
import api from '../../services/api.js';

export const IssuePrescriptionModal = ({
  isOpen,
  onClose,
  appointment,
  consultationId = null,
  initialDiagnosis = '',
  onSuccess,
}) => {
  const [diagnosis, setDiagnosis] = useState(initialDiagnosis);
  const [medicines, setMedicines] = useState([
    {
      name: '',
      dosage: '',
      frequency: 'Once daily with water',
      duration: '30 days',
      instructions: 'Take after breakfast',
    },
  ]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!appointment) return null;

  const handleAddMedicine = () => {
    setMedicines((prev) => [
      ...prev,
      {
        name: '',
        dosage: '',
        frequency: 'Once daily',
        duration: '14 days',
        instructions: 'Take after meals',
      },
    ]);
  };

  const handleRemoveMedicine = (index) => {
    if (medicines.length === 1) return;
    setMedicines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    setMedicines((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Business Rule 4: requires an appointment and at least one medicine
    if (!medicines || medicines.length === 0) {
      setError('Prescription must contain at least one medication');
      return;
    }

    for (let i = 0; i < medicines.length; i++) {
      const m = medicines[i];
      if (!m.name.trim() || !m.dosage.trim()) {
        setError(`Medication #${i + 1} requires a valid pharmaceutical name and dosage`);
        return;
      }
    }

    setLoading(true);
    try {
      await api.post('/prescriptions', {
        appointmentId: appointment._id,
        consultationId: consultationId || undefined,
        diagnosis: diagnosis || appointment.reason,
        medicines,
        additionalNotes,
        followUpDate,
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to issue prescription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Issue Digital Pharmacotherapy Prescription"
      subtitle={`Patient: ${appointment.patientId?.userId?.name || 'Patient'} · Clinical Ref #${appointment._id.slice(-6).toUpperCase()}`}
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Clinical Diagnosis Context */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
            Clinical Indication / Diagnosis
          </label>
          <input
            type="text"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="e.g. Stage 1 Essential Hypertension, Dyslipidemia"
            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
        </div>

        {/* Medicines Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Prescribed Medications & Formulations *
            </label>
            <button
              type="button"
              onClick={handleAddMedicine}
              className="text-xs text-teal-700 dark:text-teal-400 hover:text-teal-800 font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Medication
            </button>
          </div>

          <div className="space-y-3">
            {medicines.map((med, index) => (
              <div
                key={index}
                className="p-3.5 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">
                    Item #{index + 1}
                  </span>
                  {medicines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMedicine(index)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                      title="Remove Medication"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Generic / Brand Name (e.g. Amlodipine Besylate)"
                    value={med.name}
                    onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600 font-medium"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Dosage (e.g. 5 mg, 500 mg, 1000 IU)"
                    value={med.dosage}
                    onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600 font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Frequency (e.g. Once daily, BID)"
                    value={med.frequency}
                    onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                  <input
                    type="text"
                    placeholder="Duration (e.g. 30 days, 60 days)"
                    value={med.duration}
                    onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                  <input
                    type="text"
                    placeholder="Dispensing Instructions"
                    value={med.instructions}
                    onChange={(e) => handleMedicineChange(index, 'instructions', e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Clinical Warnings / Instructions */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
            Pharmacy & Patient Instructions
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Discontinue if rash appears. Monitor blood pressure weekly. Refill authorized x2."
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600 resize-none"
          />
        </div>

        {/* Next Review / Follow Up Date */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
            Prescription Renewal / Next Review Date
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
              <span>Generating Digital Certificate...</span>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>Issue & Certify Prescription</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default IssuePrescriptionModal;

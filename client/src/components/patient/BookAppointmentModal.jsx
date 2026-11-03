import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Stethoscope, AlertCircle } from 'lucide-react';
import Modal from '../common/Modal.jsx';
import api from '../../services/api.js';

export const BookAppointmentModal = ({ isOpen, onClose, onSuccess, initialDoctorId = '' }) => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(initialDoctorId);
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Minimum date = today
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (isOpen) {
      setError('');
      if (initialDoctorId) {
        setSelectedDoctorId(initialDoctorId);
      }
      fetchDoctors();
    }
  }, [isOpen, initialDoctorId]);

  const fetchDoctors = async () => {
    try {
      const { data } = await api.get('/doctors');
      setDoctors(data);
      if (!selectedDoctorId && data.length > 0) {
        setSelectedDoctorId(data[0]._id);
      }
    } catch (err) {
      console.error('Failed to load doctors:', err);
    }
  };

  const selectedDoctor = doctors.find((d) => d._id === selectedDoctorId);

  // Available slots for selected doctor
  const availableSlotsList = [
    '09:00 AM',
    '10:30 AM',
    '11:30 AM',
    '02:00 PM',
    '03:30 PM',
    '04:30 PM',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedDoctorId) {
      setError('Please select a physician');
      return;
    }
    if (!date) {
      setError('Please select an appointment date');
      return;
    }
    if (!timeSlot) {
      setError('Please select a consultation time slot');
      return;
    }
    if (!reason.trim()) {
      setError('Please enter the reason for your visit');
      return;
    }

    setLoading(true);
    try {
      await api.post('/appointments', {
        doctorId: selectedDoctorId,
        date,
        timeSlot,
        reason,
        notes,
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to book appointment. Please try a different slot.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Book Clinical Consultation"
      subtitle="Select a board-certified physician, calendar date, and consultation time window."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Doctor Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Select Physician
          </label>
          <div className="relative">
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600 transition-colors"
            >
              {doctors.map((doc) => (
                <option key={doc._id} value={doc._id}>
                  {doc.userId?.name} – {doc.specialization} ({doc.hospitalName}) · ${doc.consultationFee}
                </option>
              ))}
            </select>
          </div>
          {selectedDoctor && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {selectedDoctor.qualification} · License: {selectedDoctor.licenseNumber}
            </p>
          )}
        </div>

        {/* Date and Time Slot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Consultation Date
            </label>
            <div className="relative">
              <input
                type="date"
                min={today}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Preferred Time Window
            </label>
            <div className="relative">
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600 font-mono"
              >
                <option value="">-- Choose Slot --</option>
                {availableSlotsList.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Chief Complaint / Reason */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Primary Reason / Chief Complaint *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Follow-up on blood pressure, recurring migraines, prescription renewal"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
        </div>

        {/* Additional Clinical Notes */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Prior Symptoms or Notes (Optional)
          </label>
          <textarea
            rows={3}
            placeholder="Describe any symptoms, recent vitals, or questions you wish to discuss..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-md shadow-teal-900/10 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {loading ? (
              <span>Confirming Schedule...</span>
            ) : (
              <>
                <CalendarIcon className="w-4 h-4" />
                <span>Confirm Clinical Booking</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default BookAppointmentModal;

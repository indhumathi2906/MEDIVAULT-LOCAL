import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertCircle, CheckCircle2, Calculator } from 'lucide-react';
import Modal from '../common/Modal.jsx';
import api from '../../services/api.js';

export const RecordProgressModal = ({
  isOpen,
  onClose,
  patientId,
  patientName = 'Patient',
  appointmentId = null,
  onSuccess,
}) => {
  const [weightKg, setWeightKg] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [calculatedBmi, setCalculatedBmi] = useState('');
  const [bpSystolic, setBpSystolic] = useState('');
  const [bpDiastolic, setBpDiastolic] = useState('');
  const [heartRateBpm, setHeartRateBpm] = useState('');
  const [bloodSugarMgDl, setBloodSugarMgDl] = useState('');
  const [temperatureC, setTemperatureC] = useState('');
  const [overallCondition, setOverallCondition] = useState('Improving');
  const [treatmentAdherence, setTreatmentAdherence] = useState('Good');
  const [doctorProgressNotes, setDoctorProgressNotes] = useState('');
  const [nextReviewDate, setNextReviewDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-calculate BMI in real-time
  useEffect(() => {
    const w = parseFloat(weightKg);
    const h = parseFloat(heightCm);
    if (w > 0 && h > 0) {
      const heightM = h / 100;
      const bmi = Math.round((w / (heightM * heightM)) * 10) / 10;
      setCalculatedBmi(bmi.toString());
    } else {
      setCalculatedBmi('');
    }
  }, [weightKg, heightCm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Business Rule 5: requires patientId and overallCondition
    if (!patientId || !overallCondition) {
      setError('Patient and Overall Condition evaluation are required');
      return;
    }

    setLoading(true);
    try {
      await api.post('/progress', {
        patientId,
        appointmentId: appointmentId || undefined,
        metrics: {
          weightKg: weightKg ? Number(weightKg) : null,
          heightCm: heightCm ? Number(heightCm) : null,
          bpSystolic: bpSystolic ? Number(bpSystolic) : null,
          bpDiastolic: bpDiastolic ? Number(bpDiastolic) : null,
          heartRateBpm: heartRateBpm ? Number(heartRateBpm) : null,
          bloodSugarMgDl: bloodSugarMgDl ? Number(bloodSugarMgDl) : null,
          temperatureC: temperatureC ? Number(temperatureC) : null,
        },
        overallCondition,
        treatmentAdherence,
        doctorProgressNotes,
        nextReviewDate,
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to record health progress');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Clinical Health Progress"
      subtitle={`Patient: ${patientName} · Quantitative biomarker telemetry and evaluation`}
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Overall Condition (Required) */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Overall Health Condition *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {['Improving', 'Stable', 'Needs Attention', 'Worsening'].map((cond) => {
              const isSelected = overallCondition === cond;
              return (
                <button
                  key={cond}
                  type="button"
                  onClick={() => setOverallCondition(cond)}
                  className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all text-center ${
                    isSelected
                      ? cond === 'Improving'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : cond === 'Stable'
                        ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                        : cond === 'Needs Attention'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                  }`}
                >
                  {cond}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quantitative Metrics Section */}
        <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
          <span className="block text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">
            Physical & Hemodynamic Biomarkers
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="72.5"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Height (cm)
              </label>
              <input
                type="number"
                step="0.5"
                placeholder="178"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center justify-between">
                <span>Calculated BMI</span>
                <Calculator className="w-3 h-3 text-teal-600" />
              </label>
              <div className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono font-bold text-teal-800 dark:text-teal-300">
                {calculatedBmi ? `${calculatedBmi} kg/m²` : '--'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Systolic BP (mmHg)
              </label>
              <input
                type="number"
                placeholder="120"
                value={bpSystolic}
                onChange={(e) => setBpSystolic(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Diastolic BP (mmHg)
              </label>
              <input
                type="number"
                placeholder="80"
                value={bpDiastolic}
                onChange={(e) => setBpDiastolic(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Heart Rate (bpm)
              </label>
              <input
                type="number"
                placeholder="72"
                value={heartRateBpm}
                onChange={(e) => setHeartRateBpm(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Blood Sugar (mg/dL)
              </label>
              <input
                type="number"
                placeholder="95"
                value={bloodSugarMgDl}
                onChange={(e) => setBloodSugarMgDl(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Adherence and Progress Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Treatment & Rx Adherence
            </label>
            <select
              value={treatmentAdherence}
              onChange={(e) => setTreatmentAdherence(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              <option value="Optimal">Optimal (100% Compliance)</option>
              <option value="Good">Good (Minor missed doses)</option>
              <option value="Moderate">Moderate (Occasional non-compliance)</option>
              <option value="Poor">Poor (Significant discontinuation)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Next Review Target Date
            </label>
            <input
              type="date"
              value={nextReviewDate}
              onChange={(e) => setNextReviewDate(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600 font-mono"
            />
          </div>
        </div>

        {/* Doctor Progress Directives */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
            Physician Progress Notes & Clinical Directives
          </label>
          <textarea
            rows={3}
            placeholder="Document patient progress, responses to current regimen, lifestyle modifications, or laboratory comparisons..."
            value={doctorProgressNotes}
            onChange={(e) => setDoctorProgressNotes(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600 resize-none"
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
              <span>Saving Clinical Record...</span>
            ) : (
              <>
                <TrendingUp className="w-4 h-4" />
                <span>Save Progress Review</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RecordProgressModal;

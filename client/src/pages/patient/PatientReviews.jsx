import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, AlertCircle, MessageSquare, Trash2, Edit2 } from 'lucide-react';
import api from '../../services/api.js';
import StarRating from '../../components/common/StarRating.jsx';
import Skeleton from '../../components/common/Skeleton.jsx';

export const PatientReviews = () => {
  const [completedAppointments, setCompletedAppointments] = useState([]);
  const [existingReviews, setExistingReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApptId, setSelectedApptId] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadReviewsData = async () => {
    try {
      setLoading(true);
      setError('');
      const [apptsRes, revRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/reviews/patient'),
      ]);

      // Only Completed appointments
      const completed = apptsRes.data.filter((a) => a.status === 'Completed');
      setCompletedAppointments(completed);
      setExistingReviews(revRes.data);

      // Filter unreviewed completed appointments
      const reviewedApptIds = new Set(revRes.data.map((r) => r.appointmentId?._id || r.appointmentId));
      const unreviewed = completed.filter((a) => !reviewedApptIds.has(a._id));

      if (unreviewed.length > 0) {
        setSelectedApptId(unreviewed[0]._id);
      } else {
        setSelectedApptId('');
      }
    } catch (err) {
      console.error('Failed to load review data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviewsData();
  }, []);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedApptId) {
      setError('Please select a completed appointment to review');
      return;
    }
    if (!rating || rating < 1 || rating > 5) {
      setError('Rating must be between 1 and 5');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/reviews', {
        appointmentId: selectedApptId,
        rating,
        comment,
      });
      setSuccess('Review successfully recorded and physician ratings updated!');
      setComment('');
      setRating(5);
      loadReviewsData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Delete this review? Doctor ratings will be recomputed.')) return;
    try {
      await api.delete(`/reviews/${id}`);
      loadReviewsData();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete review');
    }
  };

  const reviewedApptIds = new Set(existingReviews.map((r) => r.appointmentId?._id || r.appointmentId));
  const eligibleAppointments = completedAppointments.filter((a) => !reviewedApptIds.has(a._id));

  return (
    <div className="space-y-8 max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="font-editorial text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Physician Evaluations & Patient Reviews
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Provide anonymous or verified feedback on your completed specialist consultations to help maintain clinical standards
        </p>
      </div>

      {/* Review Submission Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
        <h3 className="font-editorial text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
          Rate a Completed Consultation
        </h3>

        {error && (
          <div className="mb-4 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {eligibleAppointments.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 py-3 italic">
            You have no unreviewed completed consultations at this time. Once a scheduled appointment is marked Completed by your attending physician, you may evaluate your care here.
          </p>
        ) : (
          <form onSubmit={handleSubmitReview} className="space-y-4 mt-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Select Completed Consultation *
              </label>
              <select
                value={selectedApptId}
                onChange={(e) => setSelectedApptId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                {eligibleAppointments.map((appt) => (
                  <option key={appt._id} value={appt._id}>
                    {appt.date} · {appt.doctorId?.userId?.name} ({appt.doctorId?.specialization}) – Reason: {appt.reason}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Care Experience Rating (1–5 Stars) *
              </label>
              <div className="flex items-center gap-3">
                <StarRating rating={rating} onChange={setRating} interactive size="lg" />
                <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                  {rating} / 5 Stars
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Clinical Feedback & Comments
              </label>
              <textarea
                rows={3}
                required
                placeholder="Describe your care experience, physician explanation of diagnosis, treatment efficacy, or bedside manner..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold shadow-md shadow-teal-900/10 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Star className="w-4 h-4" />
              <span>{submitting ? 'Submitting Evaluation...' : 'Submit Certified Review'}</span>
            </button>
          </form>
        )}
      </div>

      {/* Existing Reviews List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="font-editorial text-lg font-bold text-slate-900 dark:text-white">
          Your Submitted Physician Reviews ({existingReviews.length})
        </h3>

        {existingReviews.length === 0 ? (
          <p className="text-xs text-slate-500 py-3 italic">
            You have not submitted any physician reviews yet.
          </p>
        ) : (
          <div className="space-y-3">
            {existingReviews.map((rev) => (
              <div
                key={rev._id}
                className="p-4 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {rev.doctorId?.userId?.name || 'Physician'}
                    </h4>
                    <StarRating rating={rev.rating} size="sm" />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 italic leading-relaxed">
                    "{rev.comment}"
                  </p>
                  <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                    Recorded {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <button
                  onClick={() => handleDeleteReview(rev._id)}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
                  title="Delete Review"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientReviews;

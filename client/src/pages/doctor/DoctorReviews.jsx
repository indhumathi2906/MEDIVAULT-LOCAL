import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, ShieldCheck, User } from 'lucide-react';
import api from '../../services/api.js';
import StarRating from '../../components/common/StarRating.jsx';
import Skeleton from '../../components/common/Skeleton.jsx';

export const DoctorReviews = () => {
  const [data, setData] = useState({ reviews: [], total: 0, averageRating: 0, distribution: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyReviews = async () => {
      try {
        setLoading(true);
        const { data: profile } = await api.get('/doctors/dashboard');
        if (profile?.profile?._id) {
          const { data: revData } = await api.get(`/reviews/doctor/${profile.profile._id}`);
          setData(revData);
        }
      } catch (err) {
        console.error('Failed to load reviews:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyReviews();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        <Skeleton className="h-44 rounded-3xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  const { reviews, total, averageRating, distribution } = data;

  return (
    <div className="space-y-8 max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="font-editorial text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Verified Patient Reviews & Clinical Ratings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Patient evaluations submitted following finalized consultations
        </p>
      </div>

      {/* Aggregate Rating Breakdown Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Big Score */}
          <div className="text-center md:text-left md:border-r border-slate-100 dark:border-slate-800 md:pr-6">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Overall Patient Rating
            </span>
            <div className="flex items-baseline justify-center md:justify-start gap-2">
              <span className="font-editorial text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
                {averageRating > 0 ? averageRating.toFixed(1) : '5.0'}
              </span>
              <span className="font-mono text-sm text-slate-400">/ 5.0</span>
            </div>
            <div className="mt-2 flex justify-center md:justify-start">
              <StarRating rating={averageRating || 5} size="md" />
            </div>
            <span className="mt-1 text-xs font-mono text-slate-500 block">
              Based on {total} completed encounter reviews
            </span>
          </div>

          {/* Star distribution bars */}
          <div className="md:col-span-2 space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = distribution[stars] || 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={stars} className="flex items-center gap-3 text-xs font-mono">
                  <span className="w-12 text-slate-600 dark:text-slate-400">
                    {stars} Stars
                  </span>
                  <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-slate-500">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews list */}
      <div className="space-y-4">
        <h3 className="font-editorial text-lg font-bold text-slate-900 dark:text-white">
          Patient Testimonials ({reviews.length})
        </h3>

        {reviews.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <p className="text-xs text-slate-500 italic">
              No reviews published yet. Completed appointments will be eligible for patient evaluations.
            </p>
          </div>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev._id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {rev.patientId?.userId?.name || 'Verified Patient'}
                  </span>
                  <StarRating rating={rev.rating} size="sm" />
                </div>
                <span className="text-xs font-mono text-slate-400">
                  {new Date(rev.createdAt).toLocaleDateString()}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                "{rev.comment}"
              </p>

              {rev.appointmentId && (
                <div className="text-[11px] font-mono text-slate-400 pt-1">
                  Encounter: {rev.appointmentId.date} · Reason: {rev.appointmentId.reason}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DoctorReviews;

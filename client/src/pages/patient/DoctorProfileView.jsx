import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Stethoscope,
  Building2,
  Calendar,
  Clock,
  Star,
  ShieldCheck,
  User,
  ArrowLeft,
  Award,
} from 'lucide-react';
import api from '../../services/api.js';
import Skeleton from '../../components/common/Skeleton.jsx';
import StarRating from '../../components/common/StarRating.jsx';
import BookAppointmentModal from '../../components/patient/BookAppointmentModal.jsx';

export const DoctorProfileView = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [reviewsData, setReviewsData] = useState({ reviews: [], distribution: {}, total: 0 });
  const [loading, setLoading] = useState(true);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        setLoading(true);
        const [docRes, revRes] = await Promise.all([
          api.get(`/doctors/${id}`),
          api.get(`/reviews/doctor/${id}`),
        ]);
        setDoctor(docRes.data);
        setReviewsData(revRes.data);
      } catch (err) {
        console.error('Failed to load doctor profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        <Skeleton className="h-64 rounded-3xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <h2 className="font-editorial text-xl font-bold">Physician Profile Not Found</h2>
        <Link
          to="/patient/doctors"
          className="mt-3 inline-block text-xs text-teal-700 dark:text-teal-400 font-semibold underline"
        >
          Return to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <Link
        to="/patient/doctors"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Directory</span>
      </Link>

      {/* Main Profile Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-teal-600 shrink-0">
            {doctor.avatarUrl ? (
              <img
                src={doctor.avatarUrl}
                alt={doctor.userId?.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold font-editorial text-3xl">
                {doctor.userId?.name?.charAt(0) || 'D'}
              </div>
            )}
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="font-editorial text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {doctor.userId?.name}
                </h1>
                <p className="text-sm font-semibold text-teal-700 dark:text-teal-400 mt-0.5">
                  {doctor.specialization}
                </p>
              </div>

              <button
                onClick={() => setIsBookModalOpen(true)}
                className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold shadow-md shadow-teal-900/10 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Consultation (${doctor.consultationFee})</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500 dark:text-slate-400 pt-2">
              <span>{doctor.qualification}</span>
              <span>·</span>
              <span>{doctor.experienceYears} Years Clinical Experience</span>
              <span>·</span>
              <span>License #{doctor.licenseNumber}</span>
            </div>

            <div className="flex items-center gap-2 pt-1 font-mono text-xs">
              <StarRating rating={doctor.averageRating} size="sm" />
              <span className="font-bold text-slate-900 dark:text-white">
                {doctor.averageRating > 0 ? doctor.averageRating.toFixed(1) : 'New'} / 5.0
              </span>
              <span className="text-slate-400">({reviewsData.total} reviews)</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-2">
              {doctor.bio}
            </p>
          </div>
        </div>
      </div>

      {/* Available Weekly Schedule Slots */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
        <h3 className="font-editorial text-lg font-bold text-slate-900 dark:text-white mb-4">
          Weekly Clinical Consultation Schedule
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {doctor.availableSlots?.map((slotObj, sIdx) => (
            <div
              key={sIdx}
              className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1.5"
            >
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                {slotObj.day}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {slotObj.slots?.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-[11px] font-mono text-teal-700 dark:text-teal-400 font-semibold"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verified Patient Reviews Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <h3 className="font-editorial text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            Verified Clinical Reviews ({reviewsData.total})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Evaluations submitted only by verified patients following completed medical appointments
          </p>
        </div>

        {reviewsData.reviews?.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 py-4 italic">
            No patient reviews published yet for this physician.
          </p>
        ) : (
          <div className="space-y-4">
            {reviewsData.reviews?.map((rev) => (
              <div
                key={rev._id}
                className="p-4 bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {rev.patientId?.userId?.name || 'Verified Patient'}
                    </span>
                    <StarRating rating={rev.rating} size="sm" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <BookAppointmentModal
        isOpen={isBookModalOpen}
        initialDoctorId={doctor._id}
        onClose={() => setIsBookModalOpen(false)}
        onSuccess={() => {
          alert('Consultation booking request confirmed!');
        }}
      />
    </div>
  );
};

export default DoctorProfileView;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Star,
  Stethoscope,
  Building2,
  Calendar,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import api from '../../services/api.js';
import Skeleton from '../../components/common/Skeleton.jsx';
import StarRating from '../../components/common/StarRating.jsx';
import BookAppointmentModal from '../../components/patient/BookAppointmentModal.jsx';

export const DoctorDirectory = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [minRating, setMinRating] = useState('');
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (specialization) params.specialization = specialization;
      if (minRating) params.minRating = minRating;

      const { data } = await api.get('/doctors', { params });
      setDoctors(data);
    } catch (err) {
      console.error('Failed to load doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [specialization, minRating]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDoctors();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="font-editorial text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Accredited Physicians & Specialist Directory
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Explore hospital specialists, clinical credentials, verified patient ratings, and real-time consultation availability
        </p>
      </div>

      {/* Filter and Search Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-3"
      >
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by physician name, specialty, or clinic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600"
          >
            <option value="">All Specialties</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Neurology">Neurology</option>
            <option value="General Medicine">General Medicine</option>
            <option value="Pediatrics">Pediatrics</option>
          </select>

          <select
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600 font-mono"
          >
            <option value="">Any Rating</option>
            <option value="4.5">★ 4.5 & Above</option>
            <option value="4.0">★ 4.0 & Above</option>
            <option value="3.0">★ 3.0 & Above</option>
          </select>

          <button
            type="submit"
            className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Filter
          </button>
        </div>
      </form>

      {/* Doctor Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-2xl" count={3} />
        </div>
      ) : doctors.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
          <Stethoscope className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="font-editorial text-lg font-bold text-slate-900 dark:text-white">
            No Physicians Match Your Criteria
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Try adjusting your search terms or clearing specialty filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <div
              key={doc._id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between transition-all hover:border-slate-300 dark:hover:border-slate-700"
            >
              <div>
                {/* Doctor Avatar + Header */}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                    {doc.avatarUrl ? (
                      <img
                        src={doc.avatarUrl}
                        alt={doc.userId?.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold font-editorial text-xl">
                        {doc.userId?.name?.charAt(0) || 'D'}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-editorial text-base font-bold text-slate-900 dark:text-white">
                      {doc.userId?.name}
                    </h3>
                    <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                      {doc.specialization}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {doc.qualification} · {doc.experienceYears} Yrs Exp
                    </p>
                  </div>
                </div>

                {/* Rating & Fee */}
                <div className="mt-4 flex items-center justify-between py-2 border-y border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-1.5 font-mono">
                    <StarRating rating={doc.averageRating} size="sm" />
                    <span className="font-bold text-slate-900 dark:text-white ml-1">
                      {doc.averageRating > 0 ? doc.averageRating.toFixed(1) : 'New'}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      ({doc.totalReviews})
                    </span>
                  </div>

                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    ${doc.consultationFee}{' '}
                    <span className="text-[10px] text-slate-400 font-normal">/ session</span>
                  </span>
                </div>

                {/* Hospital and Bio */}
                <div className="mt-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{doc.hospitalName}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mt-1">
                    {doc.bio}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <Link
                  to={`/patient/doctors/${doc._id}`}
                  className="flex-1 py-2 text-center border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors"
                >
                  View Profile
                </Link>

                <button
                  onClick={() => setSelectedDoctorForBooking(doc._id)}
                  className="flex-1 py-2 text-center bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {selectedDoctorForBooking && (
        <BookAppointmentModal
          isOpen={!!selectedDoctorForBooking}
          initialDoctorId={selectedDoctorForBooking}
          onClose={() => setSelectedDoctorForBooking(null)}
          onSuccess={() => {
            alert('Consultation appointment successfully requested!');
            setSelectedDoctorForBooking(null);
          }}
        />
      )}
    </div>
  );
};

export default DoctorDirectory;

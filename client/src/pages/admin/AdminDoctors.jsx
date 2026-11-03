import React, { useState, useEffect } from 'react';
import { Stethoscope, Search, Star, Building2 } from 'lucide-react';
import api from '../../services/api.js';
import Skeleton from '../../components/common/Skeleton.jsx';
import StarRating from '../../components/common/StarRating.jsx';

export const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/admin/doctors');
        setDoctors(data);
      } catch (err) {
        console.error('Failed to load doctors:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const filtered = doctors.filter((d) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const nameMatch = d.userId?.name?.toLowerCase().includes(q);
    const specMatch = d.specialization?.toLowerCase().includes(q);
    const hospMatch = d.hospitalName?.toLowerCase().includes(q);
    return nameMatch || specMatch || hospMatch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="font-editorial text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Physicians & Specialists Roster
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Master registry of accredited hospital physicians, licensing credentials, and patient evaluations
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by physician name, clinical specialty, or hospital facility..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-12 w-full rounded-xl" count={4} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-6">Physician Name</th>
                  <th className="py-3 px-6">Specialty / Qualification</th>
                  <th className="py-3 px-6">Hospital Facility</th>
                  <th className="py-3 px-6">License Number</th>
                  <th className="py-3 px-6">Fee ($)</th>
                  <th className="py-3 px-6">Patient Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((d) => (
                  <tr
                    key={d._id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3.5 px-6 font-bold text-slate-900 dark:text-white">
                      {d.userId?.name}
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="font-semibold text-teal-700 dark:text-teal-400">
                        {d.specialization}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {d.qualification} · {d.experienceYears} Yrs
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-slate-600 dark:text-slate-300">
                      {d.hospitalName}
                    </td>
                    <td className="py-3.5 px-6 font-mono font-bold text-slate-700 dark:text-slate-300">
                      {d.licenseNumber}
                    </td>
                    <td className="py-3.5 px-6 font-mono font-bold text-slate-900 dark:text-white">
                      ${d.consultationFee}
                    </td>
                    <td className="py-3.5 px-6 font-mono">
                      <div className="flex items-center gap-1.5">
                        <StarRating rating={d.averageRating} size="sm" />
                        <span className="font-bold">{d.averageRating?.toFixed(1) || '0.0'}</span>
                        <span className="text-slate-400 text-[10px]">({d.totalReviews})</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDoctors;

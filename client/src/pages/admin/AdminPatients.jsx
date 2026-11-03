import React, { useState, useEffect } from 'react';
import { Users, Search, Heart, Phone, MapPin, Calendar } from 'lucide-react';
import api from '../../services/api.js';
import Skeleton from '../../components/common/Skeleton.jsx';

export const AdminPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/admin/patients');
        setPatients(data);
      } catch (err) {
        console.error('Failed to load patients:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const filtered = patients.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const nameMatch = p.userId?.name?.toLowerCase().includes(q);
    const emailMatch = p.userId?.email?.toLowerCase().includes(q);
    const bloodMatch = p.bloodGroup?.toLowerCase().includes(q);
    return nameMatch || emailMatch || bloodMatch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="font-editorial text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Hospital Network Patients Registry
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Master index of registered patients, blood groupings, and documented allergy alerts
        </p>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search patients by name, email, or blood group..."
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
                  <th className="py-3 px-6">Patient Name</th>
                  <th className="py-3 px-6">Email / Phone</th>
                  <th className="py-3 px-6">DOB & Gender</th>
                  <th className="py-3 px-6">Blood Group</th>
                  <th className="py-3 px-6">Allergies</th>
                  <th className="py-3 px-6">Conditions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((p) => (
                  <tr
                    key={p._id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3.5 px-6 font-bold text-slate-900 dark:text-white">
                      {p.userId?.name}
                    </td>
                    <td className="py-3.5 px-6 font-mono text-slate-600 dark:text-slate-300">
                      <div>{p.userId?.email}</div>
                      <div className="text-[11px] text-slate-400">{p.phone || 'No phone'}</div>
                    </td>
                    <td className="py-3.5 px-6 font-mono text-slate-600 dark:text-slate-300">
                      {p.dateOfBirth || 'N/A'} ({p.gender || 'N/A'})
                    </td>
                    <td className="py-3.5 px-6 font-mono font-bold text-teal-700 dark:text-teal-400">
                      {p.bloodGroup || 'N/A'}
                    </td>
                    <td className="py-3.5 px-6 text-slate-600 dark:text-slate-300">
                      {p.allergies?.length ? (
                        <span className="text-rose-600 dark:text-rose-400 font-semibold">
                          {p.allergies.join(', ')}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">None noted</span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-slate-600 dark:text-slate-300">
                      {p.existingConditions?.length
                        ? p.existingConditions.join(', ')
                        : 'None documented'}
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

export default AdminPatients;

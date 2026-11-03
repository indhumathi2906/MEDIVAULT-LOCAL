import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Printer,
  Calendar,
  User,
  CheckCircle,
  Plus,
} from 'lucide-react';
import api from '../../services/api.js';
import Skeleton from '../../components/common/Skeleton.jsx';
import PrescriptionCertificate from '../../components/prescription/PrescriptionCertificate.jsx';

export const DoctorPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/prescriptions');
      setPrescriptions(data);
    } catch (err) {
      console.error('Failed to load prescriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const filtered = prescriptions.filter((rx) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const patientMatch = rx.patientId?.userId?.name?.toLowerCase().includes(q);
    const diagMatch = rx.diagnosis?.toLowerCase().includes(q);
    const medMatch = rx.medicines?.some((m) => m.name.toLowerCase().includes(q));
    return patientMatch || diagMatch || medMatch;
  });

  if (selectedPrescription) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <PrescriptionCertificate
          prescription={selectedPrescription}
          onBack={() => setSelectedPrescription(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="font-editorial text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Issued Digital Prescriptions & Pharmacy Orders
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Archived digital certificates, medication dispensaries, and authorized refills
        </p>
      </div>

      {/* Search Input */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by patient name, medication (e.g. Amlodipine), or diagnosis..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none"
        />
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 rounded-2xl" count={3} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
          <FileText className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="font-editorial text-lg font-bold text-slate-900 dark:text-white">
            No Prescriptions Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Prescriptions issued during consultations will be archived here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((rx) => (
            <div
              key={rx._id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between transition-all hover:border-slate-300 dark:hover:border-slate-700"
            >
              <div>
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider font-mono">
                      Patient Recipient
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {rx.patientId?.userId?.name || 'Patient'}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      Blood Group: {rx.patientId?.bloodGroup || 'N/A'} · Phone: {rx.patientId?.phone || 'N/A'}
                    </p>
                  </div>

                  <span className="font-mono text-xs text-slate-400">
                    {new Date(rx.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {rx.diagnosis && (
                  <div className="mt-3 text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Indication:
                    </span>{' '}
                    <span className="font-medium text-teal-800 dark:text-teal-300">
                      {rx.diagnosis}
                    </span>
                  </div>
                )}

                <div className="mt-4 space-y-2">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
                    Medicines ({rx.medicines?.length || 0})
                  </span>
                  <div className="space-y-1.5">
                    {rx.medicines?.map((m, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl text-xs flex items-baseline justify-between"
                      >
                        <span className="font-bold text-slate-900 dark:text-white">
                          {m.name}{' '}
                          <span className="font-mono text-teal-700 dark:text-teal-400">
                            ({m.dosage})
                          </span>
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">
                          {m.frequency}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="font-mono text-xs text-slate-400">
                  Rx #{rx._id.slice(-6).toUpperCase()}
                </span>

                <button
                  onClick={() => setSelectedPrescription(rx)}
                  className="px-3.5 py-1.5 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Certificate</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorPrescriptions;

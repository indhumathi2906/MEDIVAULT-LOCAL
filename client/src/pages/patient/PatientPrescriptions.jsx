import React, { useState, useEffect } from 'react';
import {
  FileText,
  Printer,
  Calendar,
  Stethoscope,
  Pill,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import api from '../../services/api.js';
import PrescriptionCertificate from '../../components/prescription/PrescriptionCertificate.jsx';
import Skeleton from '../../components/common/Skeleton.jsx';

export const PatientPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
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
          Digital Prescriptions & Pharmacotherapy
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Certified e-prescriptions issued by attending hospital practitioners with pharmacy verification
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-36 rounded-2xl" count={3} />
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
          <FileText className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="font-editorial text-lg font-bold text-slate-900 dark:text-white">
            No Prescriptions on File
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Once your doctor concludes a consultation and issues medications, your digital certificates will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {prescriptions.map((rx) => (
            <div
              key={rx._id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between transition-all hover:border-slate-300 dark:hover:border-slate-700"
            >
              <div>
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-100 dark:border-teal-900 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold font-mono">
                      Rx
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {rx.doctorId?.userId?.name || 'Physician'}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {rx.doctorId?.specialization} · {rx.doctorId?.hospitalName}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                    {new Date(rx.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {rx.diagnosis && (
                  <div className="mt-3 text-xs text-slate-700 dark:text-slate-300">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      Diagnosis:
                    </span>{' '}
                    <span className="italic">{rx.diagnosis}</span>
                  </div>
                )}

                {/* Medicines List */}
                <div className="mt-4 space-y-2.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400 block">
                    Dispensed Medications ({rx.medicines?.length || 0})
                  </span>
                  <div className="space-y-2">
                    {rx.medicines?.map((med, mIdx) => (
                      <div
                        key={mIdx}
                        className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-start justify-between gap-2 text-xs"
                      >
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900 dark:text-white">
                            {med.name}{' '}
                            <span className="font-mono text-teal-700 dark:text-teal-400 font-semibold">
                              ({med.dosage})
                            </span>
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {med.frequency} · Duration: {med.duration}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {rx.additionalNotes && (
                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 italic">
                    Note: "{rx.additionalNotes}"
                  </p>
                )}
              </div>

              {/* Bottom Certificate Action */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">
                  Ref #{rx._id.slice(-6).toUpperCase()}
                </span>

                <button
                  onClick={() => setSelectedPrescription(rx)}
                  className="px-3.5 py-1.5 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Printable Certificate</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientPrescriptions;

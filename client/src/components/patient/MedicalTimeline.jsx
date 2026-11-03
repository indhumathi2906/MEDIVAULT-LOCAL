import React from 'react';
import {
  Calendar,
  Stethoscope,
  FileText,
  TrendingUp,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const MedicalTimeline = ({ events = [], onSelectPrescription }) => {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
        <Clock className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
        <h4 className="font-editorial text-lg font-bold text-slate-900 dark:text-white">
          No Clinical Timeline Records
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          Medical milestones, consultations, digital prescriptions, and vital progress evaluations will appear here chronologically.
        </p>
      </div>
    );
  }

  const getTypeConfig = (type) => {
    switch (type) {
      case 'APPOINTMENT':
        return {
          icon: Calendar,
          color: 'bg-sky-500',
          badge: 'Appointment',
          border: 'border-sky-200 dark:border-sky-900',
          bg: 'bg-sky-50/50 dark:bg-sky-950/20',
        };
      case 'CONSULTATION':
        return {
          icon: Stethoscope,
          color: 'bg-teal-600',
          badge: 'Consultation',
          border: 'border-teal-200 dark:border-teal-900',
          bg: 'bg-teal-50/50 dark:bg-teal-950/20',
        };
      case 'PRESCRIPTION':
        return {
          icon: FileText,
          color: 'bg-emerald-600',
          badge: 'Prescription',
          border: 'border-emerald-200 dark:border-emerald-900',
          bg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
        };
      case 'PROGRESS_RECORD':
        return {
          icon: TrendingUp,
          color: 'bg-amber-600',
          badge: 'Health Progress',
          border: 'border-amber-200 dark:border-amber-900',
          bg: 'bg-amber-50/50 dark:bg-amber-950/20',
        };
      default:
        return {
          icon: ShieldCheck,
          color: 'bg-slate-500',
          badge: 'Clinical Log',
          border: 'border-slate-200 dark:border-slate-800',
          bg: 'bg-slate-50 dark:bg-slate-800/40',
        };
    }
  };

  return (
    <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-[11px] sm:before:left-[15px] before:top-3 before:bottom-3 before:w-[2px] before:bg-slate-200 dark:before:bg-slate-800">
      {events.map((item, index) => {
        const config = getTypeConfig(item.type);
        const Icon = config.icon;

        return (
          <div key={item._id || index} className="relative group">
            {/* Timeline Node dot */}
            <div
              className={`absolute -left-[27px] sm:-left-[31px] top-1.5 w-6 h-6 rounded-full border-4 border-white dark:border-slate-900 ${config.color} text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-125`}
            >
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
            </div>

            {/* Event Card */}
            <div
              className={`bg-white dark:bg-slate-900 border ${config.border} rounded-2xl p-5 shadow-xs transition-all hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700`}
            >
              {/* Header Info */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider font-semibold rounded-md ${config.bg} text-slate-800 dark:text-slate-200`}
                  >
                    {config.badge}
                  </span>
                  {item.status && (
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                      · Status: <strong className="font-semibold text-slate-800 dark:text-slate-200">{item.status}</strong>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{item.date || new Date(item.createdAt).toISOString().split('T')[0]}</span>
                </div>
              </div>

              {/* Title & Physician */}
              <div className="mt-3">
                <h4 className="font-editorial text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Attending: <strong className="font-semibold text-teal-700 dark:text-teal-400">{item.doctor}</strong> ({item.specialization})
                  {item.hospital && ` · ${item.hospital}`}
                </p>
              </div>

              {/* Specific Content Details */}
              <div className="mt-3 text-xs text-slate-600 dark:text-slate-300 space-y-2">
                {item.type === 'APPOINTMENT' && item.details && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1">
                    <p>
                      <strong>Time Slot:</strong> <span className="font-mono">{item.details.timeSlot}</span>
                    </p>
                    {item.details.notes && (
                      <p className="italic text-slate-500">"{item.details.notes}"</p>
                    )}
                  </div>
                )}

                {item.type === 'CONSULTATION' && item.details && (
                  <div className="p-3.5 bg-teal-50/40 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/50 rounded-xl space-y-2">
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">Clinical Diagnosis:</span>
                      <p className="font-medium text-teal-800 dark:text-teal-300 mt-0.5">{item.details.diagnosis}</p>
                    </div>
                    {item.details.clinicalObservations && (
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">Observations:</span>
                        <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{item.details.clinicalObservations}</p>
                      </div>
                    )}
                    {item.details.doctorNotes && (
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">Physician Directives:</span>
                        <p className="text-slate-600 dark:text-slate-400 mt-0.5 italic">{item.details.doctorNotes}</p>
                      </div>
                    )}
                    {item.details.followUpDate && (
                      <p className="text-[11px] font-mono text-teal-700 dark:text-teal-400 pt-1">
                        Scheduled Follow-up: {item.details.followUpDate}
                      </p>
                    )}
                  </div>
                )}

                {item.type === 'PRESCRIPTION' && item.details && (
                  <div className="p-3.5 bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        Prescribed Pharmacotherapy:
                      </span>
                      {onSelectPrescription && (
                        <button
                          onClick={() => onSelectPrescription(item._id)}
                          className="text-xs text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1 font-medium"
                        >
                          View Certificate <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <ul className="space-y-1.5 divide-y divide-emerald-100/60 dark:divide-emerald-900/30">
                      {item.details.medicines?.map((med, mIdx) => (
                        <li key={mIdx} className="pt-1.5 first:pt-0 flex flex-wrap items-baseline justify-between gap-2">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {med.name} <span className="font-mono text-teal-700 dark:text-teal-400">({med.dosage})</span>
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">
                            {med.frequency} · {med.duration}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {item.type === 'PROGRESS_RECORD' && item.details && (
                  <div className="p-3.5 bg-amber-50/40 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 rounded-xl space-y-2">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                      <div className="p-2 bg-white/80 dark:bg-slate-900/80 rounded-lg border border-amber-100 dark:border-amber-900/40">
                        <span className="text-[10px] uppercase text-slate-500 block">Weight</span>
                        <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                          {item.details.metrics?.weightKg || '--'} kg
                        </span>
                      </div>
                      <div className="p-2 bg-white/80 dark:bg-slate-900/80 rounded-lg border border-amber-100 dark:border-amber-900/40">
                        <span className="text-[10px] uppercase text-slate-500 block">Blood Pressure</span>
                        <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                          {item.details.metrics?.bpSystolic}/{item.details.metrics?.bpDiastolic || '--'}
                        </span>
                      </div>
                      <div className="p-2 bg-white/80 dark:bg-slate-900/80 rounded-lg border border-amber-100 dark:border-amber-900/40">
                        <span className="text-[10px] uppercase text-slate-500 block">Heart Rate</span>
                        <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                          {item.details.metrics?.heartRateBpm || '--'} bpm
                        </span>
                      </div>
                      <div className="p-2 bg-white/80 dark:bg-slate-900/80 rounded-lg border border-amber-100 dark:border-amber-900/40">
                        <span className="text-[10px] uppercase text-slate-500 block">Fasting Glucose</span>
                        <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                          {item.details.metrics?.bloodSugarMgDl || '--'} mg/dL
                        </span>
                      </div>
                    </div>
                    {item.details.doctorProgressNotes && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic pt-1">
                        "{item.details.doctorProgressNotes}"
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MedicalTimeline;

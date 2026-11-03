import React from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Activity,
  Heart,
  Droplets,
  Scale,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export const VitalsSummaryCard = ({ summary, patientId }) => {
  if (!summary || !summary.latestRecord) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="font-editorial text-lg font-bold text-slate-900 dark:text-white">
            Physician Health Progress Review
          </h3>
          <span className="text-xs font-mono text-slate-400">Baseline Pending</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          Your physician will record clinical vitals, metabolic metrics, and treatment efficacy reviews following your next scheduled consultation.
        </p>
      </div>
    );
  }

  const { latestRecord, comparison } = summary;
  const metrics = latestRecord.metrics || {};

  const getConditionColor = (cond) => {
    switch (cond) {
      case 'Improving':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
      case 'Stable':
        return 'text-sky-700 bg-sky-50 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800';
      case 'Needs Attention':
        return 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
      case 'Worsening':
        return 'text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-editorial text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Physician Health Progress Review
            </h3>
            <span
              className={`px-2.5 py-0.5 text-[11px] font-mono uppercase tracking-wider font-semibold border rounded-full ${getConditionColor(
                latestRecord.overallCondition
              )}`}
            >
              {latestRecord.overallCondition}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
            Latest Evaluation: {new Date(latestRecord.reviewDate).toLocaleDateString()} · Attending: {latestRecord.doctorId?.userId?.name || 'Physician'}
          </p>
        </div>

        <Link
          to="/patient/progress"
          className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:text-teal-800 flex items-center gap-1 group"
        >
          <span>View Longitudinal Trends</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* 4 Core Vitals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        {/* Metric 1: Weight & BMI */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Weight / BMI</span>
            <Scale className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              {metrics.weightKg ?? '--'}
            </span>
            <span className="text-xs font-mono text-slate-500">kg</span>
            {metrics.bmi && (
              <span className="ml-auto text-xs font-mono px-2 py-0.5 bg-teal-100/60 dark:bg-teal-950 text-teal-800 dark:text-teal-300 rounded font-semibold">
                BMI {metrics.bmi}
              </span>
            )}
          </div>
          {comparison?.weight?.diff !== null && comparison?.weight?.diff !== undefined && (
            <div className="mt-2 text-[11px] font-mono text-slate-500 flex items-center gap-1">
              <span>vs prior:</span>
              <span
                className={`font-semibold ${
                  comparison.weight.diff <= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {comparison.weight.diff > 0 ? `+${comparison.weight.diff}` : comparison.weight.diff} kg
              </span>
            </div>
          )}
        </div>

        {/* Metric 2: Arterial Blood Pressure */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Blood Pressure</span>
            <Activity className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              {metrics.bpSystolic ?? '--'}
            </span>
            <span className="font-mono text-xl text-slate-400">/</span>
            <span className="font-mono text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              {metrics.bpDiastolic ?? '--'}
            </span>
            <span className="text-xs font-mono text-slate-500 ml-1">mmHg</span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-slate-500">
            Target: &lt;120/80 mmHg (Optimal)
          </div>
        </div>

        {/* Metric 3: Heart Rate */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Resting Heart Rate</span>
            <Heart className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              {metrics.heartRateBpm ?? '--'}
            </span>
            <span className="text-xs font-mono text-slate-500">bpm</span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-slate-500">
            Normal: 60–100 bpm (Resting)
          </div>
        </div>

        {/* Metric 4: Blood Sugar */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Fasting Glucose</span>
            <Droplets className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              {metrics.bloodSugarMgDl ?? '--'}
            </span>
            <span className="text-xs font-mono text-slate-500">mg/dL</span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-slate-500">
            Normal Fasting: 70–99 mg/dL
          </div>
        </div>
      </div>

      {/* Doctor Review Notes Footer */}
      {latestRecord.doctorProgressNotes && (
        <div className="mt-4 p-3.5 bg-teal-50/40 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/60 rounded-xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-900 dark:text-teal-300">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Physician Clinical Directives</span>
            {latestRecord.treatmentAdherence && (
              <span className="font-mono text-[10px] text-teal-700 dark:text-teal-400">
                · Adherence: {latestRecord.treatmentAdherence}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed italic">
            "{latestRecord.doctorProgressNotes}"
          </p>
        </div>
      )}
    </div>
  );
};

export default VitalsSummaryCard;

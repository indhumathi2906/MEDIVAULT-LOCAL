import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  Activity,
  Heart,
  Droplets,
  Scale,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import api from '../../services/api.js';
import Skeleton from '../../components/common/Skeleton.jsx';

export const PatientProgress = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState('bloodPressure'); // 'bloodPressure' | 'weight' | 'bloodSugar' | 'heartRate'

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true);
        const { data: profile } = await api.get('/patients/profile');
        if (profile?._id) {
          const { data } = await api.get(`/progress/patient/${profile._id}/summary`);
          setSummary(data);
        }
      } catch (err) {
        console.error('Failed to load progress summary:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  const getConditionBadge = (cond) => {
    switch (cond) {
      case 'Improving':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300';
      case 'Stable':
        return 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300';
      case 'Needs Attention':
        return 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300';
      case 'Worsening':
        return 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Skeleton className="h-28 rounded-3xl" />
        <Skeleton className="h-80 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Skeleton className="h-32 rounded-2xl" count={4} />
        </div>
      </div>
    );
  }

  const { latestRecord, previousRecord, comparison, chartData } = summary || {
    latestRecord: null,
    previousRecord: null,
    comparison: null,
    chartData: [],
  };

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-700 shadow-xl text-xs font-mono">
          <p className="font-bold border-b border-slate-700 pb-1 mb-1.5">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4 py-0.5">
              <span style={{ color: entry.color }} className="font-semibold">
                {entry.name}:
              </span>
              <span className="font-bold text-white">
                {entry.value} {entry.unit || ''}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header with CORE badge */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-editorial text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Health Progress & Vital Telemetry
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-mono tracking-widest bg-teal-600 text-white rounded font-bold uppercase">
              CORE
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Longitudinal clinical trends, hemodynamic tracking, and physician condition evaluations
          </p>
        </div>

        {latestRecord && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500">Overall Condition:</span>
            <span
              className={`px-3 py-1 text-xs font-mono uppercase font-bold rounded-full border ${getConditionBadge(
                latestRecord.overallCondition
              )}`}
            >
              {latestRecord.overallCondition}
            </span>
          </div>
        )}
      </div>

      {/* Previous vs Current Quantitative Comparison Matrix */}
      {comparison && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
          <h3 className="font-editorial text-lg font-bold text-slate-900 dark:text-white mb-4">
            Clinical Milestone Comparison (Current vs Prior Review)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Weight & BMI */}
            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 block">
                Body Weight
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-mono text-2xl font-bold text-slate-900 dark:text-white">
                  {comparison.weight.latest ?? '--'}
                </span>
                <span className="text-xs font-mono text-slate-500">kg</span>
              </div>
              <div className="mt-2 text-xs font-mono flex items-center justify-between text-slate-500 border-t border-slate-200/50 dark:border-slate-700/50 pt-2">
                <span>Prior: {comparison.weight.previous ?? '--'} kg</span>
                {comparison.weight.diff !== null && (
                  <span
                    className={`font-bold ${
                      comparison.weight.diff <= 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {comparison.weight.diff > 0 ? `+${comparison.weight.diff}` : comparison.weight.diff} kg
                  </span>
                )}
              </div>
            </div>

            {/* Blood Pressure Systolic/Diastolic */}
            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 block">
                Arterial Pressure
              </span>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="font-mono text-2xl font-bold text-slate-900 dark:text-white">
                  {comparison.bpSystolic.latest ?? '--'}/{comparison.bpDiastolic.latest ?? '--'}
                </span>
                <span className="text-xs font-mono text-slate-500 ml-1">mmHg</span>
              </div>
              <div className="mt-2 text-xs font-mono flex items-center justify-between text-slate-500 border-t border-slate-200/50 dark:border-slate-700/50 pt-2">
                <span>Prior: {comparison.bpSystolic.previous ?? '--'}/{comparison.bpDiastolic.previous ?? '--'}</span>
                {comparison.bpSystolic.diff !== null && (
                  <span
                    className={`font-bold ${
                      comparison.bpSystolic.diff <= 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {comparison.bpSystolic.diff > 0 ? `+${comparison.bpSystolic.diff}` : comparison.bpSystolic.diff}
                  </span>
                )}
              </div>
            </div>

            {/* Fasting Glucose */}
            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 block">
                Fasting Glucose
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-mono text-2xl font-bold text-slate-900 dark:text-white">
                  {comparison.bloodSugar.latest ?? '--'}
                </span>
                <span className="text-xs font-mono text-slate-500">mg/dL</span>
              </div>
              <div className="mt-2 text-xs font-mono flex items-center justify-between text-slate-500 border-t border-slate-200/50 dark:border-slate-700/50 pt-2">
                <span>Prior: {comparison.bloodSugar.previous ?? '--'}</span>
                {comparison.bloodSugar.diff !== null && (
                  <span
                    className={`font-bold ${
                      comparison.bloodSugar.diff <= 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {comparison.bloodSugar.diff > 0 ? `+${comparison.bloodSugar.diff}` : comparison.bloodSugar.diff}
                  </span>
                )}
              </div>
            </div>

            {/* Resting Heart Rate */}
            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 block">
                Resting Heart Rate
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-mono text-2xl font-bold text-slate-900 dark:text-white">
                  {comparison.heartRate.latest ?? '--'}
                </span>
                <span className="text-xs font-mono text-slate-500">bpm</span>
              </div>
              <div className="mt-2 text-xs font-mono flex items-center justify-between text-slate-500 border-t border-slate-200/50 dark:border-slate-700/50 pt-2">
                <span>Prior: {comparison.heartRate.previous ?? '--'}</span>
                {comparison.heartRate.diff !== null && (
                  <span
                    className={`font-bold ${
                      comparison.heartRate.diff <= 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {comparison.heartRate.diff > 0 ? `+${comparison.heartRate.diff}` : comparison.heartRate.diff}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Recharts Visualization Section with Metric Toggles */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
        {/* Metric Selector Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div>
            <h3 className="font-editorial text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Longitudinal Clinical Trajectory
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Reference bands indicate AHA / WHO normal medical benchmarks
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto">
            <button
              onClick={() => setActiveMetric('bloodPressure')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeMetric === 'bloodPressure'
                  ? 'bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Blood Pressure
            </button>
            <button
              onClick={() => setActiveMetric('weight')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeMetric === 'weight'
                  ? 'bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Weight (kg)
            </button>
            <button
              onClick={() => setActiveMetric('bloodSugar')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeMetric === 'bloodSugar'
                  ? 'bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Blood Sugar
            </button>
            <button
              onClick={() => setActiveMetric('heartRate')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeMetric === 'heartRate'
                  ? 'bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Heart Rate
            </button>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="h-80 sm:h-96 mt-6 w-full">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No longitudinal telemetry data recorded yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {activeMetric === 'bloodPressure' ? (
                <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sysGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0E7490" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0E7490" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="diaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284C7" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0284C7" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} fontFamily="IBM Plex Mono" />
                  <YAxis domain={[60, 160]} stroke="#94a3b8" fontSize={11} fontFamily="IBM Plex Mono" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'Plus Jakarta Sans' }} />
                  <ReferenceLine y={120} stroke="#10B981" strokeDasharray="4 4" label={{ value: 'Norm Systolic (120)', fill: '#10B981', fontSize: 10 }} />
                  <ReferenceLine y={80} stroke="#10B981" strokeDasharray="4 4" label={{ value: 'Norm Diastolic (80)', fill: '#10B981', fontSize: 10 }} />
                  <Area
                    type="monotone"
                    dataKey="bpSystolic"
                    name="Systolic BP (mmHg)"
                    stroke="#0E7490"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#sysGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="bpDiastolic"
                    name="Diastolic BP (mmHg)"
                    stroke="#0284C7"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#diaGradient)"
                  />
                </AreaChart>
              ) : activeMetric === 'weight' ? (
                <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0F766E" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0F766E" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} fontFamily="IBM Plex Mono" />
                  <YAxis domain={['dataMin - 3', 'dataMax + 3']} stroke="#94a3b8" fontSize={11} fontFamily="IBM Plex Mono" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Area
                    type="monotone"
                    dataKey="weight"
                    name="Body Weight (kg)"
                    stroke="#0F766E"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#weightGradient)"
                  />
                </AreaChart>
              ) : activeMetric === 'bloodSugar' ? (
                <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sugarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D97706" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#D97706" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} fontFamily="IBM Plex Mono" />
                  <YAxis domain={[70, 140]} stroke="#94a3b8" fontSize={11} fontFamily="IBM Plex Mono" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <ReferenceLine y={100} stroke="#10B981" strokeDasharray="4 4" label={{ value: 'Fasting Target (<100)', fill: '#10B981', fontSize: 10 }} />
                  <Area
                    type="monotone"
                    dataKey="bloodSugar"
                    name="Fasting Glucose (mg/dL)"
                    stroke="#D97706"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#sugarGradient)"
                  />
                </AreaChart>
              ) : (
                <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="hrGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E11D48" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#E11D48" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} fontFamily="IBM Plex Mono" />
                  <YAxis domain={[50, 110]} stroke="#94a3b8" fontSize={11} fontFamily="IBM Plex Mono" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <ReferenceLine y={60} stroke="#94a3b8" strokeDasharray="3 3" />
                  <ReferenceLine y={100} stroke="#94a3b8" strokeDasharray="3 3" />
                  <Area
                    type="monotone"
                    dataKey="heartRate"
                    name="Heart Rate (bpm)"
                    stroke="#E11D48"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#hrGradient)"
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientProgress;

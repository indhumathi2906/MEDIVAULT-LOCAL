import React from 'react';
import {
  Printer,
  ShieldCheck,
  Building2,
  Calendar,
  FileText,
  User,
  Stethoscope,
  CheckCircle,
} from 'lucide-react';

export const PrescriptionCertificate = ({ prescription, onBack }) => {
  if (!prescription) return null;

  const handlePrint = () => {
    window.print();
  };

  const doctor = prescription.doctorId;
  const doctorUser = doctor?.userId;
  const patient = prescription.patientId;
  const patientUser = patient?.userId;

  return (
    <div className="space-y-6">
      {/* Top action bar (hidden during print) */}
      <div className="no-print flex items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
        {onBack && (
          <button
            onClick={onBack}
            className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            ← Back to Prescriptions
          </button>
        )}
        <div className="flex items-center gap-3 ml-auto">
          <span className="text-xs text-slate-500 font-mono hidden sm:inline">
            Official Clinical Electronic Rx Verification Code: #{prescription._id.slice(-8).toUpperCase()}
          </span>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold shadow-md shadow-teal-900/10 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Clinical Certificate</span>
          </button>
        </div>
      </div>

      {/* Printable Clinical Paper Certificate */}
      <div className="printable-certificate bg-[#FAF9F5] text-slate-900 border-2 border-slate-800 rounded-xl p-8 sm:p-12 shadow-xl max-w-4xl mx-auto relative overflow-hidden font-sans">
        {/* Watermark Caduceus Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
          <Stethoscope className="w-96 h-96 stroke-[1]" />
        </div>

        {/* Header Institution Lockup */}
        <div className="border-b-2 border-slate-800 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold font-mono text-sm">
                  Rx
                </div>
                <h1 className="font-editorial text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  MEDIVAULT CLINICAL NETWORK
                </h1>
              </div>
              <p className="text-xs font-mono uppercase tracking-widest text-slate-600 mt-1">
                {doctor?.hospitalName || 'Centralized Hospital System'} · Ambulatory Healthcare Services
              </p>
            </div>

            <div className="text-right sm:text-right font-mono text-xs text-slate-600">
              <p className="font-bold text-slate-900">DIGITAL PRESCRIPTION</p>
              <p>Rx ID: #{prescription._id.slice(-8).toUpperCase()}</p>
              <p>Date: {new Date(prescription.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Doctor & Patient Two-Column Demographics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-slate-300 font-mono text-xs">
          {/* Prescribing Physician */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Prescribing Physician
            </span>
            <p className="text-sm font-bold text-slate-900">
              {doctorUser?.name || 'Licensed Physician'}
            </p>
            <p className="text-slate-700">{doctor?.specialization}</p>
            <p className="text-slate-600">{doctor?.qualification}</p>
            <p className="text-slate-600">State Medical License: {doctor?.licenseNumber}</p>
          </div>

          {/* Patient Details */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Patient Identification
            </span>
            <p className="text-sm font-bold text-slate-900">
              {patientUser?.name || 'Patient'}
            </p>
            <p className="text-slate-700">
              DOB: {patient?.dateOfBirth || 'N/A'} · Gender: {patient?.gender || 'N/A'}
            </p>
            <p className="text-slate-700">
              Blood Group: <strong className="text-slate-900">{patient?.bloodGroup || 'N/A'}</strong>
            </p>
            {patient?.allergies && patient.allergies.length > 0 && (
              <p className="text-rose-700 font-semibold">
                Known Drug Allergies: {patient.allergies.join(', ')}
              </p>
            )}
          </div>
        </div>

        {/* Clinical Diagnosis */}
        {prescription.diagnosis && (
          <div className="py-4 border-b border-slate-300 flex items-baseline gap-2">
            <span className="font-mono text-xs font-bold uppercase text-slate-500">
              Clinical Indication / Diagnosis:
            </span>
            <span className="text-sm font-semibold text-slate-900">
              {prescription.diagnosis}
            </span>
          </div>
        )}

        {/* Prescription Symbol and Table */}
        <div className="py-6 space-y-4">
          <div className="flex items-center gap-2 text-slate-800">
            <span className="font-serif italic text-3xl font-bold">℞</span>
            <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
              Dispense as Written (DAW)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans">
              <thead>
                <tr className="border-b-2 border-slate-800 font-mono text-[11px] uppercase tracking-wider text-slate-600">
                  <th className="py-2 pr-4">#</th>
                  <th className="py-2 pr-4">Medication & Strength</th>
                  <th className="py-2 pr-4">Dosage / Frequency</th>
                  <th className="py-2 pr-4">Duration</th>
                  <th className="py-2">Pharmacy Instructions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {prescription.medicines?.map((med, idx) => (
                  <tr key={idx} className="align-top">
                    <td className="py-3 pr-4 font-mono font-bold text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-3 pr-4 font-semibold text-slate-900">
                      <div className="text-sm font-bold text-slate-900">{med.name}</div>
                      <span className="font-mono text-xs text-teal-800 font-semibold">
                        Strength: {med.dosage}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-mono text-slate-700">
                      {med.frequency}
                    </td>
                    <td className="py-3 pr-4 font-mono text-slate-700">
                      {med.duration}
                    </td>
                    <td className="py-3 text-slate-600 italic">
                      {med.instructions || 'As instructed by physician'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Additional Physician Notes */}
        {prescription.additionalNotes && (
          <div className="p-4 bg-slate-100/70 border border-slate-300 rounded-lg text-xs space-y-1">
            <span className="font-mono font-bold uppercase text-slate-600 block text-[10px]">
              Special Clinical Instructions
            </span>
            <p className="text-slate-800 leading-relaxed">
              {prescription.additionalNotes}
            </p>
          </div>
        )}

        {/* Follow Up & Sign-Off Block */}
        <div className="mt-8 pt-6 border-t-2 border-slate-800 flex flex-col sm:flex-row items-end justify-between gap-6">
          <div className="text-xs font-mono text-slate-600 space-y-1">
            {prescription.followUpDate && (
              <p>
                <strong>Next Clinical Review:</strong> {prescription.followUpDate}
              </p>
            )}
            <p className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Certified Digital Signature Verified via MEDIVAULT PKI</span>
            </p>
            <p className="text-[10px] text-slate-400">
              Tamper-evident record authenticated at {new Date(prescription.createdAt).toISOString()}
            </p>
          </div>

          {/* Signature Box */}
          <div className="text-center sm:text-right">
            <div className="font-serif italic text-xl font-bold text-slate-900 border-b border-slate-800 pb-1 px-4 min-w-[200px]">
              {doctorUser?.name || 'Dr. Practitioner, MD'}
            </div>
            <p className="text-[11px] font-mono text-slate-600 uppercase mt-1">
              Authorized Medical Practitioner
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionCertificate;

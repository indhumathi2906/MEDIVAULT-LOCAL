import mongoose from 'mongoose';

const metricsSchema = new mongoose.Schema(
  {
    weightKg: { type: Number, default: null },
    heightCm: { type: Number, default: null },
    bmi: { type: Number, default: null },
    bpSystolic: { type: Number, default: null },
    bpDiastolic: { type: Number, default: null },
    heartRateBpm: { type: Number, default: null },
    bloodSugarMgDl: { type: Number, default: null },
    temperatureC: { type: Number, default: null },
  },
  { _id: false }
);

const progressRecordSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PatientProfile',
      required: [true, 'Patient ID is required'],
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DoctorProfile',
      required: [true, 'Doctor ID is required'],
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    consultationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Consultation',
    },
    reviewDate: {
      type: Date,
      default: Date.now,
    },
    metrics: {
      type: metricsSchema,
      default: () => ({}),
    },
    overallCondition: {
      type: String,
      enum: ['Improving', 'Stable', 'Needs Attention', 'Worsening'],
      required: [true, 'Overall condition is required'],
    },
    treatmentAdherence: {
      type: String,
      default: 'Good',
    },
    doctorProgressNotes: {
      type: String,
      default: '',
    },
    nextReviewDate: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const ProgressRecord = mongoose.model('ProgressRecord', progressRecordSchema);
export default ProgressRecord;

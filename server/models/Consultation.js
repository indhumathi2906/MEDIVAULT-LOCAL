import mongoose from 'mongoose';

const consultationSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: [true, 'Appointment ID is required'],
    },
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
    consultationDate: {
      type: Date,
      default: Date.now,
    },
    symptoms: {
      type: String,
      default: '',
    },
    clinicalObservations: {
      type: String,
      default: '',
    },
    diagnosis: {
      type: String,
      required: [true, 'Diagnosis is required for clinical consultation'],
      trim: true,
    },
    doctorNotes: {
      type: String,
      default: '',
    },
    followUpDate: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Consultation = mongoose.model('Consultation', consultationSchema);
export default Consultation;

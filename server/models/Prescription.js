import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
    },
    dosage: {
      type: String,
      required: [true, 'Dosage is required (e.g. 5mg, 500mg)'],
      trim: true,
    },
    frequency: {
      type: String,
      required: [true, 'Frequency is required (e.g. Once daily, Twice daily)'],
      trim: true,
    },
    duration: {
      type: String,
      required: [true, 'Duration is required (e.g. 30 days)'],
      trim: true,
    },
    instructions: {
      type: String,
      default: 'Take with water after meals',
    },
  },
  { _id: true }
);

const prescriptionSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: [true, 'Appointment ID is required'],
    },
    consultationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Consultation',
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
    diagnosis: {
      type: String,
      default: '',
      trim: true,
    },
    medicines: {
      type: [medicineSchema],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'A prescription must contain at least one medicine',
      },
    },
    additionalNotes: {
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

const Prescription = mongoose.model('Prescription', prescriptionSchema);
export default Prescription;

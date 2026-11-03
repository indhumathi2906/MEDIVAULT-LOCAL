import mongoose from 'mongoose';

const availableSlotSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: true,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    slots: {
      type: [String],
      default: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'],
    },
  },
  { _id: false }
);

const doctorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    specialization: {
      type: String,
      required: [true, 'Please provide doctor specialization'],
      trim: true,
    },
    qualification: {
      type: String,
      default: 'MD, MBBS',
    },
    experienceYears: {
      type: Number,
      default: 5,
      min: 0,
    },
    licenseNumber: {
      type: String,
      default: 'MED-90210-LIC',
      trim: true,
    },
    hospitalName: {
      type: String,
      default: 'Medivault Central Hospital',
      trim: true,
    },
    consultationFee: {
      type: Number,
      default: 120,
      min: 0,
    },
    bio: {
      type: String,
      default: 'Board-certified medical specialist dedicated to patient-centered evidence-based clinical care.',
    },
    availableSlots: {
      type: [availableSlotSchema],
      default: [
        { day: 'Monday', slots: ['09:00 AM', '10:30 AM', '02:00 PM', '03:30 PM'] },
        { day: 'Tuesday', slots: ['09:00 AM', '10:30 AM', '02:00 PM', '03:30 PM'] },
        { day: 'Wednesday', slots: ['09:00 AM', '10:30 AM', '02:00 PM', '03:30 PM'] },
        { day: 'Thursday', slots: ['09:00 AM', '10:30 AM', '02:00 PM', '03:30 PM'] },
        { day: 'Friday', slots: ['09:00 AM', '10:30 AM', '02:00 PM'] },
      ],
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    avatarUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const DoctorProfile = mongoose.model('DoctorProfile', doctorProfileSchema);
export default DoctorProfile;

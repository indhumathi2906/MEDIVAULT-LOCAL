import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import PatientProfile from './models/PatientProfile.js';
import DoctorProfile from './models/DoctorProfile.js';
import Appointment from './models/Appointment.js';
import Consultation from './models/Consultation.js';
import Prescription from './models/Prescription.js';
import ProgressRecord from './models/ProgressRecord.js';
import Review from './models/Review.js';
import Notification from './models/Notification.js';

export const seedDatabase = async () => {
  console.log('--- Commencing MEDIVAULT Clinical Seed Routine ---');

  // Clear existing records
  await Promise.all([
    User.deleteMany({}),
    PatientProfile.deleteMany({}),
    DoctorProfile.deleteMany({}),
    Appointment.deleteMany({}),
    Consultation.deleteMany({}),
    Prescription.deleteMany({}),
    ProgressRecord.deleteMany({}),
    Review.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  console.log('Cleared existing collections.');

  // Demo passwords
  const ADMIN_PASS = 'Admin@123456';
  const DOCTOR_PASS = 'Doctor@123456';
  const PATIENT_PASS = 'Patient@123456';

  // 1. Admin Account
  const adminUser = await User.create({
    name: 'System Administrator',
    email: 'admin@medivault.com',
    password: ADMIN_PASS,
    role: 'ADMIN',
    isActive: true,
  });

  // 2. Doctor Accounts
  // Doctor 1: Dr. Sarah Jenkins (Cardiology)
  const doctor1User = await User.create({
    name: 'Dr. Sarah Jenkins',
    email: 'doctor@medivault.com',
    password: DOCTOR_PASS,
    role: 'DOCTOR',
    isActive: true,
  });

  const doctor1Profile = await DoctorProfile.create({
    userId: doctor1User._id,
    specialization: 'Cardiology & Vascular Medicine',
    qualification: 'MD, FACC, Harvard Medical School',
    experienceYears: 14,
    licenseNumber: 'MED-CAR-84920',
    hospitalName: 'St. Jude Heart & Vascular Institute',
    consultationFee: 150,
    bio: 'Senior Consultant Cardiologist specializing in preventive hypertension management, coronary hemodynamics, and cardiac rehabilitation.',
    avatarUrl: '/src/assets/images/doctor_sarah_portrait_1792332726871.jpg',
    availableSlots: [
      { day: 'Monday', slots: ['09:00 AM', '10:30 AM', '02:00 PM', '03:30 PM'] },
      { day: 'Tuesday', slots: ['09:00 AM', '11:00 AM', '02:30 PM', '04:00 PM'] },
      { day: 'Wednesday', slots: ['09:00 AM', '10:30 AM', '01:30 PM', '03:00 PM'] },
      { day: 'Thursday', slots: ['10:00 AM', '11:30 AM', '02:00 PM', '04:30 PM'] },
      { day: 'Friday', slots: ['09:00 AM', '10:30 AM', '01:00 PM'] },
    ],
    averageRating: 4.9,
    totalReviews: 1,
  });

  // Doctor 2: Dr. Marcus Vance (Neurology & Internal Medicine)
  const doctor2User = await User.create({
    name: 'Dr. Marcus Vance',
    email: 'dr.marcus@medivault.com',
    password: DOCTOR_PASS,
    role: 'DOCTOR',
    isActive: true,
  });

  const doctor2Profile = await DoctorProfile.create({
    userId: doctor2User._id,
    specialization: 'Neurology & Cognitive Health',
    qualification: 'MD, PhD, Johns Hopkins Medicine',
    experienceYears: 18,
    licenseNumber: 'MED-NEU-55219',
    hospitalName: 'Medivault Neurological Sciences Center',
    consultationFee: 180,
    bio: 'Director of Neuro-vascular Diagnostics with clinical focus on autonomic balance, migraine management, and longevity neurology.',
    avatarUrl: '/src/assets/images/doctor_marcus_portrait_1792332726118.jpg',
    availableSlots: [
      { day: 'Monday', slots: ['10:00 AM', '11:30 AM', '02:30 PM'] },
      { day: 'Wednesday', slots: ['09:30 AM', '11:00 AM', '03:00 PM'] },
      { day: 'Thursday', slots: ['10:00 AM', '01:30 PM', '03:30 PM'] },
      { day: 'Friday', slots: ['09:00 AM', '11:00 AM', '02:00 PM'] },
    ],
    averageRating: 5.0,
    totalReviews: 0,
  });

  // 3. Patient Account
  // Patient: Alex Mercer, age ~40 (born 1986), blood group O+
  const patientUser = await User.create({
    name: 'Alex Mercer',
    email: 'patient@medivault.com',
    password: PATIENT_PASS,
    role: 'PATIENT',
    isActive: true,
  });

  const patientProfile = await PatientProfile.create({
    userId: patientUser._id,
    dateOfBirth: '1986-04-12',
    gender: 'Male',
    phone: '+1 (555) 234-5678',
    address: '742 Evergreen Terrace, Suite 4B, Boston, MA',
    emergencyContact: {
      name: 'Elena Mercer',
      phone: '+1 (555) 876-5432',
      relation: 'Spouse',
    },
    bloodGroup: 'O+',
    allergies: ['Penicillin', 'Sulfa Drugs'],
    existingConditions: ['Stage 1 Essential Hypertension', 'Hyperlipidemia (Managed)'],
    avatarUrl: '/src/assets/images/patient_alex_portrait_1792332726123.jpg',
  });

  // 4. Clinical Appointments
  // Appointment 1 (Past Completed with Dr. Sarah Jenkins)
  const apptCompleted1 = await Appointment.create({
    patientId: patientProfile._id,
    doctorId: doctor1Profile._id,
    date: '2026-08-15',
    timeSlot: '09:00 AM',
    reason: 'Initial cardiology evaluation for elevated blood pressure and morning palpitations',
    status: 'Completed',
    notes: 'Patient noted mild exertion fatigue. Baseline ECG obtained.',
  });

  // Appointment 2 (Past Completed follow-up with Dr. Sarah Jenkins)
  const apptCompleted2 = await Appointment.create({
    patientId: patientProfile._id,
    doctorId: doctor1Profile._id,
    date: '2026-09-20',
    timeSlot: '10:30 AM',
    reason: '6-week pharmacological response review & ambulatory blood pressure check',
    status: 'Completed',
    notes: 'Systolic pressure stabilized on Amlodipine regimen. Good medication tolerance.',
  });

  // Appointment 3 (Upcoming Confirmed with Dr. Sarah Jenkins)
  const apptUpcoming1 = await Appointment.create({
    patientId: patientProfile._id,
    doctorId: doctor1Profile._id,
    date: '2026-10-25',
    timeSlot: '09:00 AM',
    reason: 'Quarterly cardiovascular maintenance checkup & lipid profile review',
    status: 'Confirmed',
    notes: 'Please bring 7-day home BP monitoring log and fasting lab report.',
  });

  // Appointment 4 (Upcoming Pending with Dr. Marcus Vance)
  const apptUpcoming2 = await Appointment.create({
    patientId: patientProfile._id,
    doctorId: doctor2Profile._id,
    date: '2026-11-04',
    timeSlot: '10:00 AM',
    reason: 'Preventive cognitive screening & sleep pattern evaluation',
    status: 'Pending',
    notes: 'Initial sleep and neurological wellness consultation.',
  });

  // 5. Consultations
  const consult1 = await Consultation.create({
    appointmentId: apptCompleted1._id,
    patientId: patientProfile._id,
    doctorId: doctor1Profile._id,
    consultationDate: new Date('2026-08-15T09:30:00Z'),
    symptoms: 'Occasional morning occipital headache, seated BP 140/90 mmHg, mild exertional dyspnea.',
    clinicalObservations: 'S1/S2 distinct, no murmurs or carotid bruits. Peripheral pulses bounding. Heart rate regular at 76 bpm. EKG demonstrates normal sinus rhythm with no ST changes.',
    diagnosis: 'Primary Essential Hypertension (Stage 1) with borderline dyslipidemia',
    doctorNotes: 'Commence calcium channel blocker therapy with lifestyle dietary sodium reduction (<2g/day) and structured aerobic activity 150 min/week.',
    followUpDate: '2026-09-20',
  });

  const consult2 = await Consultation.create({
    appointmentId: apptCompleted2._id,
    patientId: patientProfile._id,
    doctorId: doctor1Profile._id,
    consultationDate: new Date('2026-09-20T11:00:00Z'),
    symptoms: 'Headaches resolved; patient reports improved sleep quality and high treatment compliance.',
    clinicalObservations: 'BP down to 124/82 mmHg. Clear lung fields bilaterally. Absence of pedal edema. Excellent cardiovascular tolerance.',
    diagnosis: 'Controlled Essential Hypertension under medical therapy',
    doctorNotes: 'Continue current pharmacotherapy. Reinforce Mediterranean dietary pattern and co-supplementation.',
    followUpDate: '2026-10-25',
  });

  // 6. Prescriptions (2 prescriptions as specified)
  // Prescription 1: Amlodipine Besylate with Omega-3 Fish Oil
  const rx1 = await Prescription.create({
    appointmentId: apptCompleted1._id,
    consultationId: consult1._id,
    patientId: patientProfile._id,
    doctorId: doctor1Profile._id,
    diagnosis: 'Primary Essential Hypertension & Endothelial Support',
    medicines: [
      {
        name: 'Amlodipine Besylate',
        dosage: '5 mg',
        frequency: 'Once daily in the morning',
        duration: '30 days',
        instructions: 'Take orally with water; do not skip morning dose.',
      },
      {
        name: 'Omega-3 Marine Triglyceride Concentrate (EPA/DHA)',
        dosage: '1000 mg',
        frequency: 'Twice daily with meals',
        duration: '60 days',
        instructions: 'Take with lunch and dinner for optimal lipid absorption.',
      },
    ],
    additionalNotes: 'Monitor home blood pressure twice weekly in seated position after 5 minutes of rest.',
    followUpDate: '2026-09-20',
  });

  // Prescription 2: Amlodipine Besylate with Coenzyme Q10 (CoQ10)
  const rx2 = await Prescription.create({
    appointmentId: apptCompleted2._id,
    consultationId: consult2._id,
    patientId: patientProfile._id,
    doctorId: doctor1Profile._id,
    diagnosis: 'Controlled Hypertension & Mitochondrial Cardiovascular Support',
    medicines: [
      {
        name: 'Amlodipine Besylate',
        dosage: '5 mg',
        frequency: 'Once daily in the morning',
        duration: '60 days',
        instructions: 'Maintain daily morning intake. Refill at hospital pharmacy.',
      },
      {
        name: 'Coenzyme Q10 (Ubiquinol Formulation)',
        dosage: '100 mg',
        frequency: 'Once daily with breakfast',
        duration: '60 days',
        instructions: 'Lipophilic antioxidant for vascular endothelial support.',
      },
      {
        name: 'Potassium Magnesium Aspartate',
        dosage: '250 mg',
        frequency: 'Once daily in the evening',
        duration: '30 days',
        instructions: 'Electrolyte balance support for arterial elasticity.',
      },
    ],
    additionalNotes: 'Continue low-sodium DASH dietary regimen. Lab draw scheduled before next visit.',
    followUpDate: '2026-10-25',
  });

  // 7. Progress Records (5 chronological progress records showing improvement)
  // Progression: Weight 78 -> 76.5 -> 75 -> 73.5 -> 72 kg, BP 140/90 -> 135/86 -> 128/84 -> 124/82 -> 120/80
  // Fasting glucose 115 -> 108 -> 102 -> 98 -> 94 mg/dL
  // Height = 178 cm -> BMI 24.6 -> 24.1 -> 23.7 -> 23.2 -> 22.7
  const progressEntries = [
    {
      reviewDate: new Date('2026-06-01'),
      metrics: {
        weightKg: 78.0,
        heightCm: 178,
        bmi: 24.6,
        bpSystolic: 140,
        bpDiastolic: 90,
        heartRateBpm: 76,
        bloodSugarMgDl: 115,
        temperatureC: 36.6,
      },
      overallCondition: 'Needs Attention',
      treatmentAdherence: 'Moderate',
      doctorProgressNotes: 'Baseline clinic intake. Blood pressure elevated at 140/90; fasting blood sugar borderline elevated at 115 mg/dL. Ordered cardiac workup.',
      nextReviewDate: '2026-07-01',
    },
    {
      reviewDate: new Date('2026-07-05'),
      metrics: {
        weightKg: 76.5,
        heightCm: 178,
        bmi: 24.1,
        bpSystolic: 135,
        bpDiastolic: 86,
        heartRateBpm: 75,
        bloodSugarMgDl: 108,
        temperatureC: 36.7,
      },
      overallCondition: 'Stable',
      treatmentAdherence: 'Good',
      doctorProgressNotes: 'Dietary sodium reduction initiated. 1.5 kg weight reduction observed. Arterial pressure shows downward trend.',
      nextReviewDate: '2026-08-15',
    },
    {
      reviewDate: new Date('2026-08-15'),
      metrics: {
        weightKg: 75.0,
        heightCm: 178,
        bmi: 23.7,
        bpSystolic: 128,
        bpDiastolic: 84,
        heartRateBpm: 74,
        bloodSugarMgDl: 102,
        temperatureC: 36.6,
      },
      overallCondition: 'Improving',
      treatmentAdherence: 'Excellent',
      doctorProgressNotes: 'Pharmacotherapy instituted with Amlodipine 5mg. Systolic blood pressure responsive at 128 mmHg. Fasting glucose normalized.',
      nextReviewDate: '2026-09-20',
    },
    {
      reviewDate: new Date('2026-09-20'),
      metrics: {
        weightKg: 73.5,
        heightCm: 178,
        bmi: 23.2,
        bpSystolic: 124,
        bpDiastolic: 82,
        heartRateBpm: 72,
        bloodSugarMgDl: 98,
        temperatureC: 36.5,
      },
      overallCondition: 'Improving',
      treatmentAdherence: 'Excellent',
      doctorProgressNotes: 'Consistent improvement across all cardiovascular indicators. Total cholesterol reduction corroborated by blood work.',
      nextReviewDate: '2026-10-15',
    },
    {
      reviewDate: new Date('2026-10-15'),
      metrics: {
        weightKg: 72.0,
        heightCm: 178,
        bmi: 22.7,
        bpSystolic: 120,
        bpDiastolic: 80,
        heartRateBpm: 70,
        bloodSugarMgDl: 94,
        temperatureC: 36.6,
      },
      overallCondition: 'Improving',
      treatmentAdherence: 'Optimal',
      doctorProgressNotes: 'Optimal clinical recovery. BP reached target 120/80 mmHg; weight stable at 72 kg (total 6 kg drop); resting heart rate steady at 70 bpm.',
      nextReviewDate: '2026-11-20',
    },
  ];

  for (const entry of progressEntries) {
    await ProgressRecord.create({
      patientId: patientProfile._id,
      doctorId: doctor1Profile._id,
      appointmentId: apptCompleted1._id,
      consultationId: consult1._id,
      ...entry,
    });
  }

  // 8. Review
  const review = await Review.create({
    appointmentId: apptCompleted1._id,
    patientId: patientProfile._id,
    doctorId: doctor1Profile._id,
    rating: 5,
    comment: 'Dr. Sarah Jenkins is an exceptional cardiologist. Her diagnostic clarity, thorough explanation of the Amlodipine regimen, and structured tracking helped normalize my blood pressure within 8 weeks. Highest recommendation!',
  });

  // Recompute doctor rating
  const totalReviews = 1;
  const avgRating = 5.0;
  await DoctorProfile.findByIdAndUpdate(doctor1Profile._id, {
    averageRating: avgRating,
    totalReviews: totalReviews,
  });

  // 9. Notifications
  await Notification.create({
    recipientUserId: patientUser._id,
    title: 'Digital Prescription Ready',
    message: 'Dr. Sarah Jenkins has issued your prescription for Amlodipine Besylate & Ubiquinol. View and print your certificate in Prescriptions.',
    type: 'PRESCRIPTION',
    isRead: false,
  });

  await Notification.create({
    recipientUserId: patientUser._id,
    title: 'Upcoming Appointment Confirmed',
    message: 'Your upcoming consultation with Dr. Sarah Jenkins is confirmed for October 25, 2026 at 09:00 AM.',
    type: 'APPOINTMENT',
    isRead: false,
  });

  await Notification.create({
    recipientUserId: doctor1User._id,
    title: '5-Star Clinical Review Received',
    message: 'Patient Alex Mercer submitted a 5-star review for your August 15 consultation.',
    type: 'REVIEW',
    isRead: false,
  });

  await Notification.create({
    recipientUserId: doctor2User._id,
    title: 'New Appointment Booking Request',
    message: 'Alex Mercer submitted a new booking request for November 4, 2026 at 10:00 AM.',
    type: 'APPOINTMENT',
    isRead: false,
  });

  console.log('--- MEDIVAULT Seed Completed Successfully ---');
  console.log('DEMO ACCOUNTS & CREDENTIALS:');
  console.log('--------------------------------------------------');
  console.log('1. [ADMIN]');
  console.log('   Email:    admin@medivault.com');
  console.log(`   Password: ${ADMIN_PASS}`);
  console.log('--------------------------------------------------');
  console.log('2. [DOCTOR - Cardiology]');
  console.log('   Email:    doctor@medivault.com');
  console.log(`   Password: ${DOCTOR_PASS}`);
  console.log('--------------------------------------------------');
  console.log('3. [DOCTOR - Neurology]');
  console.log('   Email:    dr.marcus@medivault.com');
  console.log(`   Password: ${DOCTOR_PASS}`);
  console.log('--------------------------------------------------');
  console.log('4. [PATIENT]');
  console.log('   Email:    patient@medivault.com');
  console.log(`   Password: ${PATIENT_PASS}`);
  console.log('--------------------------------------------------');
};

// If run directly from terminal: `node seed.js`
if (process.argv[1]?.endsWith('seed.js')) {
  (async () => {
    try {
      await connectDB();
      await seedDatabase();
      console.log('Seed execution finished. Disconnecting...');
      await mongoose.disconnect();
      process.exit(0);
    } catch (err) {
      console.error('Seed execution error:', err);
      process.exit(1);
    }
  })();
}

import express from 'express';
import PatientProfile from '../models/PatientProfile.js';
import DoctorProfile from '../models/DoctorProfile.js';
import Appointment from '../models/Appointment.js';
import Consultation from '../models/Consultation.js';
import Prescription from '../models/Prescription.js';
import ProgressRecord from '../models/ProgressRecord.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Helper to assemble chronological history
const buildPatientTimeline = async (patientProfileId) => {
  const [appointments, consultations, prescriptions, progressRecords] = await Promise.all([
    Appointment.find({ patientId: patientProfileId })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email' },
      })
      .lean(),
    Consultation.find({ patientId: patientProfileId })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email' },
      })
      .lean(),
    Prescription.find({ patientId: patientProfileId })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email' },
      })
      .lean(),
    ProgressRecord.find({ patientId: patientProfileId })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email' },
      })
      .lean(),
  ]);

  const timeline = [
    ...appointments.map((a) => ({
      _id: a._id,
      type: 'APPOINTMENT',
      date: a.date,
      createdAt: a.createdAt,
      title: `Clinical Appointment: ${a.reason}`,
      status: a.status,
      doctor: a.doctorId?.userId?.name || 'Physician',
      specialization: a.doctorId?.specialization || 'Clinical Generalist',
      hospital: a.doctorId?.hospitalName,
      details: {
        timeSlot: a.timeSlot,
        notes: a.notes,
      },
    })),
    ...consultations.map((c) => ({
      _id: c._id,
      type: 'CONSULTATION',
      date: c.consultationDate ? new Date(c.consultationDate).toISOString().split('T')[0] : '',
      createdAt: c.createdAt,
      title: `Physician Consultation: ${c.diagnosis}`,
      doctor: c.doctorId?.userId?.name || 'Physician',
      specialization: c.doctorId?.specialization || 'Specialist',
      hospital: c.doctorId?.hospitalName,
      details: {
        symptoms: c.symptoms,
        clinicalObservations: c.clinicalObservations,
        diagnosis: c.diagnosis,
        doctorNotes: c.doctorNotes,
        followUpDate: c.followUpDate,
      },
    })),
    ...prescriptions.map((p) => ({
      _id: p._id,
      type: 'PRESCRIPTION',
      date: p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : '',
      createdAt: p.createdAt,
      title: `Digital Prescription (${p.medicines?.length || 0} Medications)`,
      doctor: p.doctorId?.userId?.name || 'Physician',
      specialization: p.doctorId?.specialization || 'Pharmacotherapy',
      hospital: p.doctorId?.hospitalName,
      details: {
        diagnosis: p.diagnosis,
        medicines: p.medicines,
        additionalNotes: p.additionalNotes,
        followUpDate: p.followUpDate,
      },
    })),
    ...progressRecords.map((r) => ({
      _id: r._id,
      type: 'PROGRESS_RECORD',
      date: r.reviewDate ? new Date(r.reviewDate).toISOString().split('T')[0] : '',
      createdAt: r.createdAt,
      title: `Vitals & Condition Review: ${r.overallCondition}`,
      status: r.overallCondition,
      doctor: r.doctorId?.userId?.name || 'Physician',
      specialization: r.doctorId?.specialization || 'Internal Medicine',
      details: {
        metrics: r.metrics,
        overallCondition: r.overallCondition,
        treatmentAdherence: r.treatmentAdherence,
        doctorProgressNotes: r.doctorProgressNotes,
        nextReviewDate: r.nextReviewDate,
      },
    })),
  ];

  // Sort chronologically descending
  timeline.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
  return timeline;
};

// @route   GET /api/patients/profile
// @desc    Get current logged-in patient's profile
// @access  Private (PATIENT)
router.get('/profile', protect, authorize('PATIENT'), async (req, res) => {
  try {
    const profile = await PatientProfile.findOne({ userId: req.user._id }).populate('userId', 'name email role');
    if (!profile) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }
    return res.json(profile);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/patients/profile
// @desc    Update current logged-in patient's profile
// @access  Private (PATIENT)
router.put('/profile', protect, authorize('PATIENT'), async (req, res) => {
  try {
    let profile = await PatientProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = new PatientProfile({ userId: req.user._id });
    }

    const {
      dateOfBirth,
      gender,
      phone,
      address,
      emergencyContact,
      bloodGroup,
      allergies,
      existingConditions,
      avatarUrl,
    } = req.body;

    if (dateOfBirth !== undefined) profile.dateOfBirth = dateOfBirth;
    if (gender !== undefined) profile.gender = gender;
    if (phone !== undefined) profile.phone = phone;
    if (address !== undefined) profile.address = address;
    if (emergencyContact !== undefined) profile.emergencyContact = emergencyContact;
    if (bloodGroup !== undefined) profile.bloodGroup = bloodGroup;
    if (allergies !== undefined) profile.allergies = allergies;
    if (existingConditions !== undefined) profile.existingConditions = existingConditions;
    if (avatarUrl !== undefined) profile.avatarUrl = avatarUrl;

    await profile.save();
    return res.json(profile);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/patients/dashboard
// @desc    Get dashboard metrics and active schedule for logged-in patient
// @access  Private (PATIENT)
router.get('/dashboard', protect, authorize('PATIENT'), async (req, res) => {
  try {
    const profile = await PatientProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Stats
    const [upcomingAppointments, upcomingCount, prescriptionCount, latestProgress] = await Promise.all([
      Appointment.find({
        patientId: profile._id,
        date: { $gte: todayStr },
        status: { $in: ['Pending', 'Confirmed'] },
      })
        .sort({ date: 1, timeSlot: 1 })
        .limit(3)
        .populate({
          path: 'doctorId',
          populate: { path: 'userId', select: 'name email' },
        }),
      Appointment.countDocuments({
        patientId: profile._id,
        date: { $gte: todayStr },
        status: { $in: ['Pending', 'Confirmed'] },
      }),
      Prescription.countDocuments({ patientId: profile._id }),
      ProgressRecord.findOne({ patientId: profile._id })
        .sort({ reviewDate: -1, createdAt: -1 })
        .populate({
          path: 'doctorId',
          populate: { path: 'userId', select: 'name email' },
        }),
    ]);

    // Latest prescription for next follow-up
    const latestPrescription = await Prescription.findOne({ patientId: profile._id })
      .sort({ createdAt: -1 });

    return res.json({
      profile,
      stats: {
        upcomingVisits: upcomingCount,
        activePrescriptions: prescriptionCount,
        clinicalHealthStatus: latestProgress?.overallCondition || 'Stable',
        nextFollowUp: latestPrescription?.followUpDate || 'None scheduled',
      },
      upcomingAppointments,
      latestProgress,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/patients/history
// @desc    Get combined timeline history for logged-in patient
// @access  Private (PATIENT)
router.get('/history', protect, authorize('PATIENT'), async (req, res) => {
  try {
    const profile = await PatientProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }
    const timeline = await buildPatientTimeline(profile._id);
    return res.json(timeline);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/patients/:id/history
// @desc    Get combined timeline history for patient by ID
// @access  Private (DOCTOR, ADMIN, or PATIENT owner)
router.get('/:id/history', protect, async (req, res) => {
  try {
    const patientProfile = await PatientProfile.findById(req.params.id);
    if (!patientProfile) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Role check: If patient, must be own profile
    if (req.user.role === 'PATIENT' && !patientProfile.userId.equals(req.user._id)) {
      return res.status(403).json({ message: 'Access denied. You can only view your own records.' });
    }

    const timeline = await buildPatientTimeline(patientProfile._id);
    return res.json(timeline);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;

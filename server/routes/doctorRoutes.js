import express from 'express';
import DoctorProfile from '../models/DoctorProfile.js';
import PatientProfile from '../models/PatientProfile.js';
import Appointment from '../models/Appointment.js';
import Consultation from '../models/Consultation.js';
import Prescription from '../models/Prescription.js';
import Review from '../models/Review.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/doctors
// @desc    Get all active physicians with search, specialization, and rating filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, specialization, minRating } = req.query;

    let query = {};
    if (specialization) {
      query.specialization = new RegExp(specialization, 'i');
    }
    if (minRating) {
      query.averageRating = { $gte: Number(minRating) };
    }

    let doctors = await DoctorProfile.find(query)
      .populate('userId', 'name email isActive')
      .lean();

    // Filter out inactive doctors
    doctors = doctors.filter((doc) => doc.userId && doc.userId.isActive !== false);

    // Filter by text search if provided (name, hospitalName, specialization)
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      doctors = doctors.filter(
        (doc) =>
          searchRegex.test(doc.userId?.name || '') ||
          searchRegex.test(doc.specialization || '') ||
          searchRegex.test(doc.hospitalName || '')
      );
    }

    return res.json(doctors);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/doctors/dashboard
// @desc    Get doctor dashboard statistics and today's schedule
// @access  Private (DOCTOR)
router.get('/dashboard', protect, authorize('DOCTOR'), async (req, res) => {
  try {
    const profile = await DoctorProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const [todayAppointments, upcomingCount, pendingCount, completedCount, prescriptionsCount, appointmentsList] =
      await Promise.all([
        Appointment.find({ doctorId: profile._id, date: todayStr })
          .populate({
            path: 'patientId',
            populate: { path: 'userId', select: 'name email' },
          })
          .sort({ timeSlot: 1 }),
        Appointment.countDocuments({
          doctorId: profile._id,
          date: { $gt: todayStr },
          status: { $in: ['Pending', 'Confirmed'] },
        }),
        Appointment.countDocuments({
          doctorId: profile._id,
          status: 'Pending',
        }),
        Appointment.countDocuments({
          doctorId: profile._id,
          status: 'Completed',
        }),
        Prescription.countDocuments({
          doctorId: profile._id,
        }),
        Appointment.find({ doctorId: profile._id }).distinct('patientId'),
      ]);

    return res.json({
      profile,
      stats: {
        todayVisits: todayAppointments.length,
        upcomingAppointments: upcomingCount,
        pendingAppointments: pendingCount,
        completedConsultations: completedCount,
        totalPrescriptions: prescriptionsCount,
        uniquePatients: appointmentsList.length,
        averageRating: profile.averageRating,
        totalReviews: profile.totalReviews,
      },
      todayAppointments,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/doctors/patients
// @desc    Get list of patients treated or scheduled by this doctor
// @access  Private (DOCTOR)
router.get('/patients', protect, authorize('DOCTOR'), async (req, res) => {
  try {
    const profile = await DoctorProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // Get distinct patient IDs from appointments
    const patientIds = await Appointment.find({ doctorId: profile._id }).distinct('patientId');

    const patients = await PatientProfile.find({ _id: { $in: patientIds } })
      .populate('userId', 'name email isActive')
      .lean();

    // Attach latest appointment and latest diagnosis to each patient
    const enrichedPatients = await Promise.all(
      patients.map(async (p) => {
        const lastAppt = await Appointment.findOne({ doctorId: profile._id, patientId: p._id })
          .sort({ date: -1 })
          .lean();
        const lastConsult = await Consultation.findOne({ doctorId: profile._id, patientId: p._id })
          .sort({ consultationDate: -1 })
          .lean();
        return {
          ...p,
          latestAppointmentDate: lastAppt?.date || null,
          latestStatus: lastAppt?.status || null,
          latestDiagnosis: lastConsult?.diagnosis || 'Initial assessment',
        };
      })
    );

    return res.json(enrichedPatients);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/doctors/:id
// @desc    Get doctor profile by ID with reviews
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const doctor = await DoctorProfile.findById(req.params.id)
      .populate('userId', 'name email isActive')
      .lean();

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const reviews = await Review.find({ doctorId: doctor._id })
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name' },
      })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      ...doctor,
      reviews,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/doctors/profile
// @desc    Update logged-in doctor's clinical profile
// @access  Private (DOCTOR)
router.put('/profile', protect, authorize('DOCTOR'), async (req, res) => {
  try {
    let profile = await DoctorProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const {
      specialization,
      qualification,
      experienceYears,
      licenseNumber,
      hospitalName,
      consultationFee,
      bio,
      availableSlots,
      avatarUrl,
    } = req.body;

    if (specialization !== undefined) profile.specialization = specialization;
    if (qualification !== undefined) profile.qualification = qualification;
    if (experienceYears !== undefined) profile.experienceYears = Number(experienceYears);
    if (licenseNumber !== undefined) profile.licenseNumber = licenseNumber;
    if (hospitalName !== undefined) profile.hospitalName = hospitalName;
    if (consultationFee !== undefined) profile.consultationFee = Number(consultationFee);
    if (bio !== undefined) profile.bio = bio;
    if (availableSlots !== undefined) profile.availableSlots = availableSlots;
    if (avatarUrl !== undefined) profile.avatarUrl = avatarUrl;

    await profile.save();
    return res.json(profile);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;

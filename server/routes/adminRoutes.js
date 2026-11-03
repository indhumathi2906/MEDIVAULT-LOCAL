import express from 'express';
import User from '../models/User.js';
import PatientProfile from '../models/PatientProfile.js';
import DoctorProfile from '../models/DoctorProfile.js';
import Appointment from '../models/Appointment.js';
import Consultation from '../models/Consultation.js';
import Prescription from '../models/Prescription.js';
import Review from '../models/Review.js';
import ProgressRecord from '../models/ProgressRecord.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply protect + authorize ADMIN for all admin endpoints
router.use(protect, authorize('ADMIN'));

// @route   GET /api/admin/dashboard
// @desc    Admin analytics, counts, recent appointments and new users
// @access  Private (ADMIN)
router.get('/dashboard', async (req, res) => {
  try {
    const [
      patientsCount,
      doctorsCount,
      appointmentsCount,
      consultationsCount,
      prescriptionsCount,
      reviewsCount,
      progressCount,
      activeUsersCount,
      totalUsersCount,
      recentAppointments,
      newestUsers,
    ] = await Promise.all([
      PatientProfile.countDocuments(),
      DoctorProfile.countDocuments(),
      Appointment.countDocuments(),
      Consultation.countDocuments(),
      Prescription.countDocuments(),
      Review.countDocuments(),
      ProgressRecord.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments(),
      Appointment.find()
        .populate({
          path: 'patientId',
          populate: { path: 'userId', select: 'name email' },
        })
        .populate({
          path: 'doctorId',
          populate: { path: 'userId', select: 'name email' },
        })
        .sort({ createdAt: -1 })
        .limit(8),
      User.find()
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    return res.json({
      counts: {
        patients: patientsCount,
        doctors: doctorsCount,
        appointments: appointmentsCount,
        completedConsultations: consultationsCount,
        prescriptions: prescriptionsCount,
        reviews: reviewsCount,
        healthReviews: progressCount,
        activeUsers: activeUsersCount,
        totalUsers: totalUsersCount,
      },
      recentAppointments,
      newestUsers,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/users
// @desc    List all system users with their profile metadata
// @access  Private (ADMIN)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();

    const enrichedUsers = await Promise.all(
      users.map(async (u) => {
        let profile = null;
        if (u.role === 'PATIENT') {
          profile = await PatientProfile.findOne({ userId: u._id }).lean();
        } else if (u.role === 'DOCTOR') {
          profile = await DoctorProfile.findOne({ userId: u._id }).lean();
        }
        return {
          ...u,
          profile,
        };
      })
    );

    return res.json(enrichedUsers);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Toggle user active status (never allow modifying ADMIN account)
// @access  Private (ADMIN)
router.put('/users/:id/status', async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Protection rule: never allow changing an ADMIN account
    if (targetUser.role === 'ADMIN') {
      return res.status(400).json({
        message: 'Security policy violation: Administrator accounts cannot be deactivated',
      });
    }

    targetUser.isActive = !targetUser.isActive;
    await targetUser.save();

    return res.json({
      message: `User account successfully ${targetUser.isActive ? 'activated' : 'deactivated'}`,
      user: {
        id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        isActive: targetUser.isActive,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/prescriptions
// @desc    List all issued prescriptions across the hospital network
// @access  Private (ADMIN)
router.get('/prescriptions', async (req, res) => {
  try {
    const prescriptions = await Prescription.find()
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email phone' },
      })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email specialization hospitalName' },
      })
      .populate('appointmentId')
      .sort({ createdAt: -1 });

    return res.json(prescriptions);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/patients
// @desc    List all registered patients with their contact details & conditions
// @access  Private (ADMIN)
router.get('/patients', async (req, res) => {
  try {
    const patients = await PatientProfile.find()
      .populate('userId', 'name email isActive createdAt')
      .sort({ createdAt: -1 });
    return res.json(patients);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/doctors
// @desc    List all physicians with license and ratings
// @access  Private (ADMIN)
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await DoctorProfile.find()
      .populate('userId', 'name email isActive createdAt')
      .sort({ createdAt: -1 });
    return res.json(doctors);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;

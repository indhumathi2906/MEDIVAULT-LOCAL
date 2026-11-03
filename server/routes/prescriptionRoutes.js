import express from 'express';
import Prescription from '../models/Prescription.js';
import Appointment from '../models/Appointment.js';
import PatientProfile from '../models/PatientProfile.js';
import DoctorProfile from '../models/DoctorProfile.js';
import Notification from '../models/Notification.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/prescriptions
// @desc    Issue a digital prescription (requires appointment and at least 1 medicine; notifies patient)
// @access  Private (DOCTOR)
router.post('/', protect, authorize('DOCTOR'), async (req, res) => {
  try {
    const {
      appointmentId,
      consultationId,
      diagnosis,
      medicines,
      additionalNotes,
      followUpDate,
    } = req.body;

    // Business Rule 4: requires an appointment and at least one medicine
    if (!appointmentId) {
      return res.status(400).json({ message: 'Appointment ID is required to issue a prescription' });
    }

    if (!medicines || !Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({ message: 'Prescription must contain at least one valid medication' });
    }

    // Validate that each medicine has name, dosage, frequency, duration
    for (const med of medicines) {
      if (!med.name || !med.dosage || !med.frequency || !med.duration) {
        return res.status(400).json({
          message: 'Each medication requires a name, dosage, frequency, and duration',
        });
      }
    }

    const doctor = await DoctorProfile.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const appointment = await Appointment.findById(appointmentId).populate({
      path: 'patientId',
      populate: { path: 'userId', select: 'name email' },
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Referenced appointment not found' });
    }

    // Ensure doctor is assigned to this appointment
    if (!appointment.doctorId.equals(doctor._id)) {
      return res.status(403).json({ message: 'You are not assigned as the physician for this appointment' });
    }

    const prescription = await Prescription.create({
      appointmentId,
      consultationId: consultationId || null,
      patientId: appointment.patientId._id,
      doctorId: doctor._id,
      diagnosis: diagnosis || '',
      medicines,
      additionalNotes: additionalNotes || '',
      followUpDate: followUpDate || '',
    });

    // Business Rule 4: notifies the patient
    if (appointment.patientId?.userId?._id) {
      await Notification.create({
        recipientUserId: appointment.patientId.userId._id,
        title: 'New Digital Prescription Issued',
        message: `Dr. ${req.user.name} issued a new certified digital prescription with ${medicines.length} medication(s). Available for pharmacy verification.`,
        type: 'PRESCRIPTION',
      });
    }

    const populatedPrescription = await Prescription.findById(prescription._id)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email phone' },
      })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate('appointmentId');

    return res.status(201).json(populatedPrescription);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/prescriptions
// @desc    Get prescriptions (role-filtered with ownership checks)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'PATIENT') {
      const patient = await PatientProfile.findOne({ userId: req.user._id });
      if (!patient) return res.json([]);
      query.patientId = patient._id;
    } else if (req.user.role === 'DOCTOR') {
      const doctor = await DoctorProfile.findOne({ userId: req.user._id });
      if (!doctor) return res.json([]);
      query.doctorId = doctor._id;
    }
    // ADMIN can see all

    const prescriptions = await Prescription.find(query)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email phone' },
      })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate('appointmentId')
      .sort({ createdAt: -1 });

    return res.json(prescriptions);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/prescriptions/patient/:patientId
// @desc    Get prescriptions for a specific patient
// @access  Private (ownership checked)
router.get('/patient/:patientId', protect, async (req, res) => {
  try {
    const patientProfile = await PatientProfile.findById(req.params.patientId);
    if (!patientProfile) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    if (req.user.role === 'PATIENT' && !patientProfile.userId.equals(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const prescriptions = await Prescription.find({ patientId: patientProfile._id })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate('appointmentId')
      .sort({ createdAt: -1 });

    return res.json(prescriptions);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/prescriptions/:id
// @desc    Get single prescription details
// @access  Private (ownership checked)
router.get('/:id', protect, async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email phone' },
      })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate('appointmentId');

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    if (req.user.role === 'PATIENT' && !prescription.patientId?.userId?._id?.equals(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (req.user.role === 'DOCTOR' && !prescription.doctorId?.userId?._id?.equals(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    return res.json(prescription);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;

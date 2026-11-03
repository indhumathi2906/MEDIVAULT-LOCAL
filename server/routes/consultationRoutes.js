import express from 'express';
import Consultation from '../models/Consultation.js';
import Appointment from '../models/Appointment.js';
import DoctorProfile from '../models/DoctorProfile.js';
import PatientProfile from '../models/PatientProfile.js';
import Notification from '../models/Notification.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/consultations
// @desc    Record clinical consultation (requires appointmentId & diagnosis; marks appointment Completed)
// @access  Private (DOCTOR)
router.post('/', protect, authorize('DOCTOR'), async (req, res) => {
  try {
    const {
      appointmentId,
      symptoms,
      clinicalObservations,
      diagnosis,
      doctorNotes,
      followUpDate,
    } = req.body;

    // Business Rule 3: requires appointmentId and diagnosis
    if (!appointmentId || !diagnosis) {
      return res.status(400).json({ message: 'Appointment ID and Diagnosis are mandatory to complete a consultation' });
    }

    const doctor = await DoctorProfile.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const appointment = await Appointment.findById(appointmentId)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email' },
      });

    if (!appointment) {
      return res.status(404).json({ message: 'Referenced appointment not found' });
    }

    // Ownership check: Must be the doctor on this appointment
    if (!appointment.doctorId.equals(doctor._id)) {
      return res.status(403).json({ message: 'You are not assigned as the physician for this appointment' });
    }

    // Business Rule 3: sets appointment status to Completed
    appointment.status = 'Completed';
    await appointment.save();

    const consultation = await Consultation.create({
      appointmentId,
      patientId: appointment.patientId._id,
      doctorId: doctor._id,
      symptoms: symptoms || '',
      clinicalObservations: clinicalObservations || '',
      diagnosis,
      doctorNotes: doctorNotes || '',
      followUpDate: followUpDate || '',
    });

    // Notify the patient
    if (appointment.patientId?.userId?._id) {
      await Notification.create({
        recipientUserId: appointment.patientId.userId._id,
        title: 'Clinical Consultation Completed',
        message: `Dr. ${req.user.name} finalized your clinical consultation. Diagnosis recorded: "${diagnosis}".`,
        type: 'APPOINTMENT',
      });
    }

    const populatedConsultation = await Consultation.findById(consultation._id)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email' },
      });

    return res.status(201).json(populatedConsultation);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/consultations/patient/:patientId
// @desc    Get all consultations for a specific patient
// @access  Private (ownership checked)
router.get('/patient/:patientId', protect, async (req, res) => {
  try {
    const patientProfile = await PatientProfile.findById(req.params.patientId);
    if (!patientProfile) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // If PATIENT, must be own profile
    if (req.user.role === 'PATIENT' && !patientProfile.userId.equals(req.user._id)) {
      return res.status(403).json({ message: 'Access denied to these consultations' });
    }

    const consultations = await Consultation.find({ patientId: patientProfile._id })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate('appointmentId')
      .sort({ consultationDate: -1, createdAt: -1 });

    return res.json(consultations);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/consultations/:id
// @desc    Get single consultation details
// @access  Private (ownership checked)
router.get('/:id', protect, async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate('appointmentId');

    if (!consultation) {
      return res.status(404).json({ message: 'Consultation record not found' });
    }

    if (req.user.role === 'PATIENT' && !consultation.patientId?.userId?._id?.equals(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (req.user.role === 'DOCTOR' && !consultation.doctorId?.userId?._id?.equals(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    return res.json(consultation);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;

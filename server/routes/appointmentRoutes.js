import express from 'express';
import Appointment from '../models/Appointment.js';
import PatientProfile from '../models/PatientProfile.js';
import DoctorProfile from '../models/DoctorProfile.js';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Helper to create notifications
const notifyUser = async (recipientUserId, title, message, type = 'APPOINTMENT') => {
  try {
    await Notification.create({
      recipientUserId,
      title,
      message,
      type,
    });
  } catch (err) {
    console.error('Failed to create notification:', err.message);
  }
};

// @route   GET /api/appointments
// @desc    Get all appointments (role-filtered with ownership rules)
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
    // ADMIN sees all

    const appointments = await Appointment.find(query)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email phone' },
      })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email' },
      })
      .sort({ date: -1, timeSlot: -1 });

    return res.json(appointments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/appointments
// @desc    Book a new appointment (with double-booking prevention & notification)
// @access  Private (PATIENT or ADMIN)
router.post('/', protect, async (req, res) => {
  try {
    const { doctorId, date, timeSlot, reason, notes } = req.body;

    if (!doctorId || !date || !timeSlot || !reason) {
      return res.status(400).json({ message: 'Doctor, date, time slot, and reason are required' });
    }

    // Determine patient ID
    let patientProfileId = null;
    if (req.user.role === 'PATIENT') {
      const patient = await PatientProfile.findOne({ userId: req.user._id });
      if (!patient) {
        return res.status(404).json({ message: 'Patient profile not found' });
      }
      patientProfileId = patient._id;
    } else if (req.user.role === 'ADMIN' && req.body.patientId) {
      patientProfileId = req.body.patientId;
    } else {
      return res.status(403).json({ message: 'Only patients or administrators can book appointments' });
    }

    const doctor = await DoctorProfile.findById(doctorId).populate('userId', 'name email');
    if (!doctor) {
      return res.status(404).json({ message: 'Physician not found' });
    }

    // Business Rule 1: Double-booking prevention
    // Reject booking if a non-Cancelled appointment exists for same doctor, date and time slot
    const existingBooking = await Appointment.findOne({
      doctorId,
      date,
      timeSlot,
      status: { $ne: 'Cancelled' },
    });

    if (existingBooking) {
      return res.status(400).json({
        message: `Dr. ${doctor.userId?.name || 'the physician'} is already booked on ${date} at ${timeSlot}. Please select another slot.`,
      });
    }

    const appointment = await Appointment.create({
      patientId: patientProfileId,
      doctorId,
      date,
      timeSlot,
      reason,
      notes: notes || '',
      status: 'Pending',
    });

    // Business Rule 2: Creating an appointment notifies the doctor
    if (doctor.userId?._id) {
      await notifyUser(
        doctor.userId._id,
        'New Clinical Appointment Booked',
        `Patient ${req.user.name} scheduled an appointment for ${date} at ${timeSlot}. Chief complaint: "${reason}".`,
        'APPOINTMENT'
      );
    }

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email phone' },
      })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email' },
      });

    return res.status(201).json(populatedAppointment);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/appointments/:id
// @desc    Get single appointment details
// @access  Private (ownership checked)
router.get('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email phone' },
      })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email' },
      });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Ownership check
    if (req.user.role === 'PATIENT') {
      if (!appointment.patientId?.userId?._id?.equals(req.user._id)) {
        return res.status(403).json({ message: 'Access denied to this appointment record' });
      }
    } else if (req.user.role === 'DOCTOR') {
      if (!appointment.doctorId?.userId?._id?.equals(req.user._id)) {
        return res.status(403).json({ message: 'Access denied to this appointment record' });
      }
    }

    return res.json(appointment);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/appointments/:id
// @desc    Update appointment status / notes (with notification to other party)
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email' },
      });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Ownership check
    const isPatientParty = appointment.patientId?.userId?._id?.equals(req.user._id);
    const isDoctorParty = appointment.doctorId?.userId?._id?.equals(req.user._id);
    const isAdmin = req.user.role === 'ADMIN';

    if (!isPatientParty && !isDoctorParty && !isAdmin) {
      return res.status(403).json({ message: 'Access denied to update this appointment' });
    }

    const { status, notes } = req.body;
    const oldStatus = appointment.status;

    if (status && ['Pending', 'Confirmed', 'Completed', 'Cancelled'].includes(status)) {
      appointment.status = status;
    }
    if (notes !== undefined) {
      appointment.notes = notes;
    }

    await appointment.save();

    // Business Rule 2: Status change notifies the other party
    if (status && status !== oldStatus) {
      if (isDoctorParty && appointment.patientId?.userId?._id) {
        // Doctor changed status -> notify patient
        await notifyUser(
          appointment.patientId.userId._id,
          `Appointment ${status}`,
          `Dr. ${req.user.name} updated your appointment on ${appointment.date} at ${appointment.timeSlot} to: ${status}.`,
          'APPOINTMENT'
        );
      } else if (isPatientParty && appointment.doctorId?.userId?._id) {
        // Patient changed status -> notify doctor
        await notifyUser(
          appointment.doctorId.userId._id,
          `Appointment ${status}`,
          `Patient ${req.user.name} changed their appointment on ${appointment.date} at ${appointment.timeSlot} to: ${status}.`,
          'APPOINTMENT'
        );
      } else if (isAdmin) {
        // Admin changed status -> notify both parties
        if (appointment.patientId?.userId?._id) {
          await notifyUser(
            appointment.patientId.userId._id,
            `Appointment Status Update: ${status}`,
            `The clinic administration updated your appointment on ${appointment.date} to: ${status}.`,
            'APPOINTMENT'
          );
        }
        if (appointment.doctorId?.userId?._id) {
          await notifyUser(
            appointment.doctorId.userId._id,
            `Appointment Status Update: ${status}`,
            `The clinic administration updated your appointment on ${appointment.date} to: ${status}.`,
            'APPOINTMENT'
          );
        }
      }
    }

    return res.json(appointment);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/appointments/:id
// @desc    Cancel/delete an appointment
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email' },
      });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const isPatientParty = appointment.patientId?.userId?._id?.equals(req.user._id);
    const isDoctorParty = appointment.doctorId?.userId?._id?.equals(req.user._id);
    const isAdmin = req.user.role === 'ADMIN';

    if (!isPatientParty && !isDoctorParty && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    appointment.status = 'Cancelled';
    await appointment.save();

    // Notify other party
    if (isPatientParty && appointment.doctorId?.userId?._id) {
      await notifyUser(
        appointment.doctorId.userId._id,
        'Appointment Cancelled',
        `Patient ${req.user.name} cancelled the appointment for ${appointment.date} at ${appointment.timeSlot}.`,
        'APPOINTMENT'
      );
    } else if (isDoctorParty && appointment.patientId?.userId?._id) {
      await notifyUser(
        appointment.patientId.userId._id,
        'Appointment Cancelled',
        `Dr. ${req.user.name} cancelled the appointment scheduled for ${appointment.date}.`,
        'APPOINTMENT'
      );
    }

    return res.json({ message: 'Appointment cancelled successfully', appointment });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;

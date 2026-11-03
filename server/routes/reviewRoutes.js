import express from 'express';
import Review from '../models/Review.js';
import Appointment from '../models/Appointment.js';
import DoctorProfile from '../models/DoctorProfile.js';
import PatientProfile from '../models/PatientProfile.js';
import Notification from '../models/Notification.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Helper to recompute doctor's average rating and total reviews
const recomputeDoctorRating = async (doctorId) => {
  const reviews = await Review.find({ doctorId });
  const total = reviews.length;
  let avg = 0;
  if (total > 0) {
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    avg = Math.round((sum / total) * 10) / 10;
  }
  await DoctorProfile.findByIdAndUpdate(doctorId, {
    averageRating: avg,
    totalReviews: total,
  });
};

// @route   POST /api/reviews
// @desc    Submit a patient review for a completed appointment
// @access  Private (PATIENT)
router.post('/', protect, authorize('PATIENT'), async (req, res) => {
  try {
    const { appointmentId, rating, comment } = req.body;

    const numRating = Number(rating);
    // Business Rule 7: rating must be 1–5
    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
    }

    if (!appointmentId) {
      return res.status(400).json({ message: 'Appointment ID is required' });
    }

    const patient = await PatientProfile.findOne({ userId: req.user._id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    const appointment = await Appointment.findById(appointmentId).populate('patientId');
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Business Rule 7: appointment must belong to logged-in patient
    if (!appointment.patientId._id.equals(patient._id)) {
      return res.status(403).json({ message: 'You can only review your own appointments' });
    }

    // Business Rule 7: status must be Completed
    if (appointment.status !== 'Completed') {
      return res.status(400).json({ message: 'Reviews can only be submitted for Completed appointments' });
    }

    // Business Rule 7: no review exists for it
    const existingReview = await Review.findOne({ appointmentId });
    if (existingReview) {
      return res.status(400).json({ message: 'A review has already been submitted for this appointment' });
    }

    const review = await Review.create({
      appointmentId,
      patientId: patient._id,
      doctorId: appointment.doctorId,
      rating: numRating,
      comment: comment || '',
    });

    // Business Rule 7: Recompute doctor averageRating (1 decimal) & totalReviews
    await recomputeDoctorRating(appointment.doctorId);

    // Notify doctor
    const doctor = await DoctorProfile.findById(appointment.doctorId);
    if (doctor?.userId) {
      await Notification.create({
        recipientUserId: doctor.userId,
        title: 'New Patient Review Submitted',
        message: `${req.user.name} posted a ${numRating}-star review for your clinical consultation.`,
        type: 'REVIEW',
      });
    }

    const populatedReview = await Review.findById(review._id)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name' },
      })
      .populate('appointmentId');

    return res.status(201).json(populatedReview);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/reviews/doctor/:doctorId
// @desc    Get reviews for a doctor with rating distribution
// @access  Public
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const reviews = await Review.find({ doctorId: req.params.doctorId })
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name' },
      })
      .populate('appointmentId', 'date timeSlot reason')
      .sort({ createdAt: -1 });

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      if (distribution[r.rating] !== undefined) {
        distribution[r.rating]++;
      }
    });

    const total = reviews.length;
    const avg = total > 0 ? Math.round((reviews.reduce((acc, r) => acc + r.rating, 0) / total) * 10) / 10 : 0;

    return res.json({
      reviews,
      total,
      averageRating: avg,
      distribution,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/reviews/patient
// @desc    Get all reviews authored by logged-in patient
// @access  Private (PATIENT)
router.get('/patient', protect, authorize('PATIENT'), async (req, res) => {
  try {
    const patient = await PatientProfile.findOne({ userId: req.user._id });
    if (!patient) return res.json([]);

    const reviews = await Review.find({ patientId: patient._id })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name' },
      })
      .populate('appointmentId')
      .sort({ createdAt: -1 });

    return res.json(reviews);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/reviews/all
// @desc    Get all reviews in system
// @access  Private (ADMIN)
router.get('/all', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate('appointmentId')
      .sort({ createdAt: -1 });

    return res.json(reviews);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/reviews/:id
// @desc    Update own review (recomputes doctor rating)
// @access  Private (PATIENT)
router.put('/:id', protect, authorize('PATIENT'), async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate('patientId');
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (!review.patientId.userId.equals(req.user._id)) {
      return res.status(403).json({ message: 'You can only edit your own reviews' });
    }

    const { rating, comment } = req.body;
    if (rating !== undefined) {
      const numRating = Number(rating);
      if (numRating < 1 || numRating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }
      review.rating = numRating;
    }
    if (comment !== undefined) {
      review.comment = comment;
    }

    await review.save();
    // Recompute
    await recomputeDoctorRating(review.doctorId);

    return res.json(review);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete review (PATIENT own or ADMIN; recomputes doctor rating)
// @access  Private (PATIENT or ADMIN)
router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate('patientId');
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const isOwner = review.patientId?.userId?.equals(req.user._id);
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    const doctorId = review.doctorId;
    await Review.findByIdAndDelete(review._id);

    // Recompute doctor rating
    await recomputeDoctorRating(doctorId);

    return res.json({ message: 'Review removed and doctor rating recomputed successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;

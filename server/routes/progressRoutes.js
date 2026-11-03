import express from 'express';
import ProgressRecord from '../models/ProgressRecord.js';
import PatientProfile from '../models/PatientProfile.js';
import DoctorProfile from '../models/DoctorProfile.js';
import Notification from '../models/Notification.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/progress
// @desc    Record clinical progress entry (auto-calculates BMI; notifies patient)
// @access  Private (DOCTOR)
router.post('/', protect, authorize('DOCTOR'), async (req, res) => {
  try {
    const {
      patientId,
      appointmentId,
      consultationId,
      metrics = {},
      overallCondition,
      treatmentAdherence,
      doctorProgressNotes,
      nextReviewDate,
    } = req.body;

    // Business Rule 5: requires patientId and overallCondition
    if (!patientId || !overallCondition) {
      return res.status(400).json({
        message: 'Patient ID and Overall Condition (Improving/Stable/Needs Attention/Worsening) are required',
      });
    }

    const doctor = await DoctorProfile.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const patient = await PatientProfile.findById(patientId).populate('userId', 'name email');
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    // Business Rule 5: auto-calculates BMI = weightKg / (heightCm/100)², rounded to 1 decimal
    const parsedMetrics = { ...metrics };
    if (parsedMetrics.weightKg && parsedMetrics.heightCm && Number(parsedMetrics.heightCm) > 0) {
      const heightInMeters = Number(parsedMetrics.heightCm) / 100;
      const rawBmi = Number(parsedMetrics.weightKg) / (heightInMeters * heightInMeters);
      parsedMetrics.bmi = Math.round(rawBmi * 10) / 10;
    }

    const progressRecord = await ProgressRecord.create({
      patientId,
      doctorId: doctor._id,
      appointmentId: appointmentId || null,
      consultationId: consultationId || null,
      metrics: parsedMetrics,
      overallCondition,
      treatmentAdherence: treatmentAdherence || 'Good',
      doctorProgressNotes: doctorProgressNotes || '',
      nextReviewDate: nextReviewDate || '',
      reviewDate: new Date(),
    });

    // Business Rule 5: notifies the patient
    if (patient.userId?._id) {
      await Notification.create({
        recipientUserId: patient.userId._id,
        title: 'Health Progress Review Recorded',
        message: `Dr. ${req.user.name} evaluated your health progress. Current status marked as: "${overallCondition}".`,
        type: 'PROGRESS',
      });
    }

    const populatedRecord = await ProgressRecord.findById(progressRecord._id)
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate('patientId');

    return res.status(201).json(populatedRecord);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/progress/patient/:patientId
// @desc    Get all progress records for a patient
// @access  Private (ownership checked)
router.get('/patient/:patientId', protect, async (req, res) => {
  try {
    const patient = await PatientProfile.findById(req.params.patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    if (req.user.role === 'PATIENT' && !patient.userId.equals(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const records = await ProgressRecord.find({ patientId: patient._id })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email' },
      })
      .sort({ reviewDate: -1, createdAt: -1 });

    return res.json(records);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/progress/patient/:patientId/summary
// @desc    Get progress summary with comparisons and chronologically sorted chartData
// @access  Private (ownership checked)
router.get('/patient/:patientId/summary', protect, async (req, res) => {
  try {
    const patient = await PatientProfile.findById(req.params.patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    if (req.user.role === 'PATIENT' && !patient.userId.equals(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Fetch chronologically sorted records (oldest to newest)
    const records = await ProgressRecord.find({ patientId: patient._id })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email' },
      })
      .sort({ reviewDate: 1, createdAt: 1 })
      .lean();

    if (records.length === 0) {
      return res.json({
        latestRecord: null,
        previousRecord: null,
        comparison: null,
        chartData: [],
      });
    }

    const latestRecord = records[records.length - 1];
    const previousRecord = records.length > 1 ? records[records.length - 2] : null;

    // Business Rule 6: metric-by-metric comparison with differences
    const calcDiff = (curr, prev) => {
      if (curr === undefined || curr === null) return null;
      if (prev === undefined || prev === null) return null;
      return Math.round((curr - prev) * 10) / 10;
    };

    const comparison = {
      weight: {
        latest: latestRecord.metrics?.weightKg ?? null,
        previous: previousRecord?.metrics?.weightKg ?? null,
        diff: calcDiff(latestRecord.metrics?.weightKg, previousRecord?.metrics?.weightKg),
        unit: 'kg',
      },
      bmi: {
        latest: latestRecord.metrics?.bmi ?? null,
        previous: previousRecord?.metrics?.bmi ?? null,
        diff: calcDiff(latestRecord.metrics?.bmi, previousRecord?.metrics?.bmi),
        unit: '',
      },
      bpSystolic: {
        latest: latestRecord.metrics?.bpSystolic ?? null,
        previous: previousRecord?.metrics?.bpSystolic ?? null,
        diff: calcDiff(latestRecord.metrics?.bpSystolic, previousRecord?.metrics?.bpSystolic),
        unit: 'mmHg',
      },
      bpDiastolic: {
        latest: latestRecord.metrics?.bpDiastolic ?? null,
        previous: previousRecord?.metrics?.bpDiastolic ?? null,
        diff: calcDiff(latestRecord.metrics?.bpDiastolic, previousRecord?.metrics?.bpDiastolic),
        unit: 'mmHg',
      },
      bloodSugar: {
        latest: latestRecord.metrics?.bloodSugarMgDl ?? null,
        previous: previousRecord?.metrics?.bloodSugarMgDl ?? null,
        diff: calcDiff(latestRecord.metrics?.bloodSugarMgDl, previousRecord?.metrics?.bloodSugarMgDl),
        unit: 'mg/dL',
      },
      heartRate: {
        latest: latestRecord.metrics?.heartRateBpm ?? null,
        previous: previousRecord?.metrics?.heartRateBpm ?? null,
        diff: calcDiff(latestRecord.metrics?.heartRateBpm, previousRecord?.metrics?.heartRateBpm),
        unit: 'bpm',
      },
      condition: {
        latest: latestRecord.overallCondition,
        previous: previousRecord?.overallCondition ?? null,
      },
    };

    // Business Rule 6: chronologically sorted chartData
    const chartData = records.map((r) => {
      const dateLabel = r.reviewDate
        ? new Date(r.reviewDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : 'Session';
      return {
        id: r._id,
        rawDate: r.reviewDate,
        date: dateLabel,
        weight: r.metrics?.weightKg ?? null,
        bmi: r.metrics?.bmi ?? null,
        bpSystolic: r.metrics?.bpSystolic ?? null,
        bpDiastolic: r.metrics?.bpDiastolic ?? null,
        bloodSugar: r.metrics?.bloodSugarMgDl ?? null,
        heartRate: r.metrics?.heartRateBpm ?? null,
        condition: r.overallCondition,
      };
    });

    return res.json({
      latestRecord,
      previousRecord,
      comparison,
      chartData,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;

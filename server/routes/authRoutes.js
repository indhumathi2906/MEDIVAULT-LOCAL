import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import PatientProfile from '../models/PatientProfile.js';
import DoctorProfile from '../models/DoctorProfile.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user (PATIENT or DOCTOR) and create matching profile
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role: requestedRole,
      // Patient fields
      dateOfBirth,
      gender,
      phone,
      address,
      emergencyContact,
      bloodGroup,
      allergies,
      existingConditions,
      // Doctor fields
      specialization,
      qualification,
      experienceYears,
      licenseNumber,
      hospitalName,
      consultationFee,
      bio,
      avatarUrl,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Role enforcement: Public registration only creates PATIENT or DOCTOR; fallback to PATIENT
    let role = 'PATIENT';
    if (requestedRole === 'DOCTOR') {
      role = 'DOCTOR';
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email address' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      role,
      isActive: true,
    });

    let profile = null;
    if (role === 'PATIENT') {
      profile = await PatientProfile.create({
        userId: user._id,
        dateOfBirth: dateOfBirth || '',
        gender: gender || '',
        phone: phone || '',
        address: address || '',
        emergencyContact: emergencyContact || { name: '', phone: '', relation: '' },
        bloodGroup: bloodGroup || '',
        allergies: allergies || [],
        existingConditions: existingConditions || [],
        avatarUrl: avatarUrl || '',
      });
    } else if (role === 'DOCTOR') {
      profile = await DoctorProfile.create({
        userId: user._id,
        specialization: specialization || 'General Medicine',
        qualification: qualification || 'MD, MBBS',
        experienceYears: Number(experienceYears) || 3,
        licenseNumber: licenseNumber || `MED-${Math.floor(10000 + Math.random() * 90000)}`,
        hospitalName: hospitalName || 'Medivault Central Hospital',
        consultationFee: Number(consultationFee) || 100,
        bio: bio || 'Board-certified medical practitioner dedicated to evidence-based healthcare.',
        avatarUrl: avatarUrl || '',
      });
    }

    const token = generateToken(user._id);

    return res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile,
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Registration failed' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Same error message for wrong email or wrong password to prevent user enumeration
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Account status check
    if (user.isActive === false) {
      return res.status(403).json({ message: 'Account is deactivated. Please contact administration.' });
    }

    let profile = null;
    if (user.role === 'PATIENT') {
      profile = await PatientProfile.findOne({ userId: user._id });
    } else if (user.role === 'DOCTOR') {
      profile = await DoctorProfile.findOne({ userId: user._id });
    }

    const token = generateToken(user._id);

    return res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile,
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Login failed' });
  }
});

// @route   GET /api/auth/me
// @desc    Get currently logged-in user profile
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    let profile = null;
    if (req.user.role === 'PATIENT') {
      profile = await PatientProfile.findOne({ userId: req.user._id });
    } else if (req.user.role === 'DOCTOR') {
      profile = await DoctorProfile.findOne({ userId: req.user._id });
    }

    return res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      isActive: req.user.isActive,
      profile,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch current user' });
  }
});

export default router;

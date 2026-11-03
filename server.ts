import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { connectDB } from './server/config/db.js';
import { seedDatabase } from './server/seed.js';
import User from './server/models/User.js';

// Route imports
import authRoutes from './server/routes/authRoutes.js';
import patientRoutes from './server/routes/patientRoutes.js';
import doctorRoutes from './server/routes/doctorRoutes.js';
import appointmentRoutes from './server/routes/appointmentRoutes.js';
import consultationRoutes from './server/routes/consultationRoutes.js';
import prescriptionRoutes from './server/routes/prescriptionRoutes.js';
import progressRoutes from './server/routes/progressRoutes.js';
import reviewRoutes from './server/routes/reviewRoutes.js';
import notificationRoutes from './server/routes/notificationRoutes.js';
import adminRoutes from './server/routes/adminRoutes.js';

// Ensure JWT secret is set for runtime security
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'medivault_production_secure_jwt_secret_clinical_2026';
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

let isDbReady = false;

// Immediate Health Check for Cloud Run readiness and liveness probes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    dbReady: isDbReady,
    timestamp: new Date().toISOString(),
    service: 'MEDIVAULT Full-Stack Clinical Management System API',
  });
});

// Asynchronous DB initialization routine
const dbInitPromise = (async () => {
  try {
    await connectDB();
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Database empty on startup. Executing clinical seed routine...');
      await seedDatabase();
    }
    isDbReady = true;
    console.log('✓ Database fully initialized and seeded.');
  } catch (err: any) {
    console.error('Database initialization error:', err.message);
    throw err;
  }
})();

// API readiness gate for data-dependent endpoints
app.use('/api', async (req, res, next) => {
  if (req.path === '/health') return next();
  try {
    if (!isDbReady) {
      await dbInitPromise;
    }
    next();
  } catch (err: any) {
    res.status(503).json({
      message: 'Database is still initializing, please retry momentarily.',
      error: err.message,
    });
  }
});

// Mount /api endpoints
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Configure Static Serving & Vite
async function configureFrontend() {
  const distPath = path.resolve(process.cwd(), 'dist');
  const isProd = process.env.NODE_ENV === 'production' || fs.existsSync(distPath);

  if (isProd && fs.existsSync(distPath)) {
    // Serve production build
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('✓ Mounted production static files from dist/');
  } else {
    // Mount Vite dev server in middleware mode
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('✓ Mounted Vite development middleware');
  }
}

// 1. Immediately bind listener to fulfill Cloud Run rollout health check
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ MEDIVAULT HTTP Listener active immediately on http://0.0.0.0:${PORT}`);
});

// 2. Configure frontend (Vite or static dist)
configureFrontend().catch((err) => {
  console.error('Error configuring frontend:', err);
});

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';

// Common components
import Navbar from './components/common/Navbar.jsx';
import Sidebar from './components/common/Sidebar.jsx';
import Skeleton from './components/common/Skeleton.jsx';

// Auth Pages
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard.jsx';
import PatientAppointments from './pages/patient/PatientAppointments.jsx';
import DoctorDirectory from './pages/patient/DoctorDirectory.jsx';
import DoctorProfileView from './pages/patient/DoctorProfileView.jsx';
import PatientPrescriptions from './pages/patient/PatientPrescriptions.jsx';
import PatientHistory from './pages/patient/PatientHistory.jsx';
import PatientProgress from './pages/patient/PatientProgress.jsx';
import PatientReviews from './pages/patient/PatientReviews.jsx';
import PatientProfileEdit from './pages/patient/PatientProfileEdit.jsx';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard.jsx';
import DoctorAppointments from './pages/doctor/DoctorAppointments.jsx';
import DoctorPatients from './pages/doctor/DoctorPatients.jsx';
import DoctorPrescriptions from './pages/doctor/DoctorPrescriptions.jsx';
import DoctorReviews from './pages/doctor/DoctorReviews.jsx';
import DoctorProfileEdit from './pages/doctor/DoctorProfileEdit.jsx';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import AdminPatients from './pages/admin/AdminPatients.jsx';
import AdminDoctors from './pages/admin/AdminDoctors.jsx';
import AdminAppointments from './pages/admin/AdminAppointments.jsx';

// ProtectedRoute enforces authentication & redirects users accessing another role's views to their own dashboard
const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-md w-full space-y-4">
          <Skeleton className="h-10 w-48 mx-auto" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If role is not allowed, redirect to their proper dashboard
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (user.role === 'PATIENT') return <Navigate to="/patient/dashboard" replace />;
    if (user.role === 'DOCTOR') return <Navigate to="/doctor/dashboard" replace />;
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      <Navbar />
      <div className="flex-1 flex max-w-[1920px] w-full mx-auto pb-16 lg:pb-0">
        <Sidebar />
        <main className="flex-1 min-w-0 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

// Root redirect based on role
const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
        <Skeleton className="h-48 w-96 rounded-2xl" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'PATIENT') return <Navigate to="/patient/dashboard" replace />;
  if (user.role === 'DOCTOR') return <Navigate to="/doctor/dashboard" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/login" replace />;
};

export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Patient Routes */}
          <Route
            path="/patient/dashboard"
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/appointments"
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <PatientAppointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/doctors"
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <DoctorDirectory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/doctors/:id"
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <DoctorProfileView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/prescriptions"
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <PatientPrescriptions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/history"
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <PatientHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/progress"
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <PatientProgress />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/reviews"
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <PatientReviews />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/profile"
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <PatientProfileEdit />
              </ProtectedRoute>
            }
          />

          {/* Doctor Routes */}
          <Route
            path="/doctor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/appointments"
            element={
              <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DoctorAppointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/patients"
            element={
              <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DoctorPatients />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/prescriptions"
            element={
              <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DoctorPrescriptions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/reviews"
            element={
              <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DoctorReviews />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/profile"
            element={
              <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DoctorProfileEdit />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/patients"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminPatients />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/doctors"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDoctors />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/appointments"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminAppointments />
              </ProtectedRoute>
            }
          />

          {/* Root and Fallback */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;

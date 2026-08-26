import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import MyBookingsPage from './pages/MyBookingsPage';
import DashboardPage from './pages/DashboardPage';
import OrganizerDashboardPage from './pages/OrganizerDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import CreateEventPage from './pages/CreateEventPage';
import { ReactNode } from 'react';

function ProtectedRoute({ children, roles }: { children: ReactNode; roles?: string[] }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/events" />;
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/create" element={<ProtectedRoute roles={['ORGANIZER', 'ADMIN']}><CreateEventPage /></ProtectedRoute>} />
              <Route path="/events/:id" element={<EventDetailPage />} />

              {/* Authenticated routes */}
              <Route path="/my-bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

              {/* Organizer routes */}
              <Route path="/organizer" element={<ProtectedRoute roles={['ORGANIZER', 'ADMIN']}><OrganizerDashboardPage /></ProtectedRoute>} />

              {/* Admin routes */}
              <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboardPage /></ProtectedRoute>} />

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/events" />} />
            </Routes>
          </main>
        </div>
        <Toaster position="top-right" />
      </Router>
    </AuthProvider>
  );
}

export default App;

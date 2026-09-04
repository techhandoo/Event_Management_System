import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth, homeForRole } from './context/AuthContext';
import { SidebarProvider } from './context/SidebarContext';
import DashboardLayout from './components/DashboardLayout';
import { PageLoader } from './components/ui/LoadingState';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminSetupPage from './pages/AdminSetupPage';
import EventsPageWrapper from './components/EventsPageWrapper';
import EventDetailPageWrapper from './components/EventDetailPageWrapper';
import MyBookingsPage from './pages/MyBookingsPage';
import DashboardPage from './pages/DashboardPage';
import OrganizerDashboardPage from './pages/OrganizerDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import CreateEventPage from './pages/CreateEventPage';
import EditEventPage from './pages/EditEventPage';
import ProfilePage from './pages/ProfilePage';
import ErrorPage from './pages/ErrorPage';
import AboutPage from './pages/static/AboutPage';
import BlogPage from './pages/static/BlogPage';
import CareersPage from './pages/static/CareersPage';
import ContactPage from './pages/static/ContactPage';
import PrivacyPage from './pages/static/PrivacyPage';
import TermsPage from './pages/static/TermsPage';
import CookiesPage from './pages/static/CookiesPage';
import ApiDocsPage from './pages/static/ApiDocsPage';
import { ReactNode } from 'react';

function ProtectedRoute({ children, roles }: { children: ReactNode; roles?: string[] }) {
 const { user, isAuthenticated, isLoading } = useAuth();
 if (isLoading) return <PageLoader />;
 if (!isAuthenticated) return <Navigate to="/login" />;
 if (roles && user && !roles.includes(user.role)) return <ErrorPage code={403} />;
 return <DashboardLayout>{children}</DashboardLayout>;
}

function PublicRoute({ children }: { children: ReactNode }) {
 const { isAuthenticated, isLoading, user } = useAuth();
 if (isLoading) return <PageLoader />;
 if (isAuthenticated) return <Navigate to={homeForRole(user?.role)} />;
 return <>{children}</>;
}

function App() {
 return (
  <AuthProvider>
   <SidebarProvider>
    <Router>
     <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
      <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
      <Route path="/setup-admin" element={<AdminSetupPage />} />
      <Route path="/events" element={<EventsPageWrapper />} />
      <Route path="/events/:id" element={<EventDetailPageWrapper />} />
      <Route path="/events/create" element={<ProtectedRoute roles={['ORGANIZER', 'ADMIN']}><CreateEventPage /></ProtectedRoute>} />
      <Route path="/events/:id/edit" element={<ProtectedRoute roles={['ORGANIZER', 'ADMIN']}><EditEventPage /></ProtectedRoute>} />
      <Route path="/my-bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/organizer" element={<ProtectedRoute roles={['ORGANIZER', 'ADMIN']}><OrganizerDashboardPage /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboardPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      {/* Static pages */}
      <Route path="/about" element={<AboutPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/careers" element={<CareersPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/cookies" element={<CookiesPage />} />
      <Route path="/api-docs" element={<ApiDocsPage />} />
      <Route path="/" element={<LandingPage />} />
      <Route path="/403" element={<ErrorPage code={403} />} />
      <Route path="/500" element={<ErrorPage code={500} />} />
      <Route path="*" element={<ErrorPage code={404} />} />
     </Routes>
     <Toaster
      position="top-right"
      toastOptions={{
       className: 'text-sm font-medium',
       style: { borderRadius: '10px', background: '#101828', color: '#f2f4f7', fontSize: '14px', padding: '12px 16px' },
       duration: 3000,
      }}
     />
    </Router>
   </SidebarProvider>
  </AuthProvider>
 );
}

export default App;

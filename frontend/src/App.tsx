import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth, homeForRole } from './context/AuthContext';
import { SidebarProvider } from './context/SidebarContext';
import DashboardLayout from './components/DashboardLayout';
import { PageLoader } from './components/ui/LoadingState';
import { lazy, Suspense, ReactNode } from 'react';

// ─── Route-level code splitting ───────────────────────
// Entry pages (landing, auth, event browse) load eagerly; everything else is
// split into per-route chunks so the initial bundle stays small.
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EventsPageWrapper from './components/EventsPageWrapper';
import EventDetailPageWrapper from './components/EventDetailPageWrapper';

const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const AdminSetupPage = lazy(() => import('./pages/AdminSetupPage'));
const MyBookingsPage = lazy(() => import('./pages/MyBookingsPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const OrganizerDashboardPage = lazy(() => import('./pages/OrganizerDashboardPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const CreateEventPage = lazy(() => import('./pages/CreateEventPage'));
const EditEventPage = lazy(() => import('./pages/EditEventPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const ErrorPage = lazy(() => import('./pages/ErrorPage'));
const AboutPage = lazy(() => import('./pages/static/AboutPage'));
const BlogPage = lazy(() => import('./pages/static/BlogPage'));
const CareersPage = lazy(() => import('./pages/static/CareersPage'));
const ContactPage = lazy(() => import('./pages/static/ContactPage'));
const PrivacyPage = lazy(() => import('./pages/static/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/static/TermsPage'));
const CookiesPage = lazy(() => import('./pages/static/CookiesPage'));
const ApiDocsPage = lazy(() => import('./pages/static/ApiDocsPage'));

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

function AnimatedRoutes() {
 const location = useLocation();
 return (
  // Page-fade route transitions: a short opacity crossfade on every navigation.
  // initial={false} so the first render doesn't flash.
  <AnimatePresence initial={false}>
   <motion.div
    key={location.pathname}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.12 }}
   >
    <Suspense fallback={<PageLoader />}>
     <Routes location={location}>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
      <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
      <Route path="/setup-admin" element={<AdminSetupPage />} />
      <Route path="/events" element={<EventsPageWrapper />} />
      <Route path="/events/create" element={<ProtectedRoute roles={['ORGANIZER', 'ADMIN']}><CreateEventPage /></ProtectedRoute>} />
      <Route path="/events/:id/edit" element={<ProtectedRoute roles={['ORGANIZER', 'ADMIN']}><EditEventPage /></ProtectedRoute>} />
      <Route path="/events/:id" element={<EventDetailPageWrapper />} />
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
    </Suspense>
   </motion.div>
  </AnimatePresence>
 );
}

function App() {
 return (
  <AuthProvider>
   <SidebarProvider>
    <Router>
     <AnimatedRoutes />
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

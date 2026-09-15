import { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from './DashboardLayout';

/**
 * Route gate for pages that render bare for guests but inside the dashboard
 * shell for signed-in users. Replaces the two identical *PageWrapper files.
 */
export default function DashboardGate({ children }: { children: ReactNode }) {
 const { isAuthenticated } = useAuth();

 if (isAuthenticated) {
  return <DashboardLayout>{children}</DashboardLayout>;
 }

 return <>{children}</>;
}

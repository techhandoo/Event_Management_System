import { useAuth } from '../context/AuthContext';
import DashboardLayout from './DashboardLayout';
import EventDetailPage from '../pages/EventDetailPage';

export default function EventDetailPageWrapper() {
 const { isAuthenticated } = useAuth();

 if (isAuthenticated) {
  return (
   <DashboardLayout>
    <EventDetailPage />
   </DashboardLayout>
  );
 }

 return <EventDetailPage />;
}

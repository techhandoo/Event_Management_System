import { useAuth } from '../context/AuthContext';
import DashboardLayout from './DashboardLayout';
import EventsPage from '../pages/EventsPage';

export default function EventsPageWrapper() {
 const { isAuthenticated } = useAuth();

 if (isAuthenticated) {
  return (
   <DashboardLayout>
    <EventsPage />
   </DashboardLayout>
  );
 }

 return <EventsPage />;
}

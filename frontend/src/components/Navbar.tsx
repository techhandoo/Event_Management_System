import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Calendar, LayoutDashboard, Plus } from 'lucide-react';
import NotificationCenter from './NotificationCenter';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/events" className="flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">FreeBuff</span>
            </Link>
            <Link to="/events" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Events</Link>
            {isAuthenticated && (
              <Link to="/my-bookings" className="text-gray-600 hover:text-gray-900 text-sm font-medium">My Bookings</Link>
            )}
            {isAuthenticated && (user?.role === 'ORGANIZER') && (
              <>
                <Link to="/organizer" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Dashboard</Link>
                <Link to="/events/create" className="text-gray-600 hover:text-gray-900 text-sm font-medium flex items-center gap-1">
                  <Plus size={14} /> Create Event
                </Link>
              </>
            )}
            {isAuthenticated && user?.role === 'ADMIN' && (
              <Link to="/admin" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Admin</Link>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <NotificationCenter />
                <span className="text-sm text-gray-700 font-medium">{user?.fullName}</span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  user?.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                  user?.role === 'ORGANIZER' ? 'bg-indigo-100 text-indigo-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {user?.role}
                </span>
                <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 p-1.5 rounded-lg hover:bg-gray-100 transition" title="Logout">
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Login</Link>
                <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium transition">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

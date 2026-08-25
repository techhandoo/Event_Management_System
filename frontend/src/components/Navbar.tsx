import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Calendar, LayoutDashboard } from 'lucide-react';

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
              <Calendar className="h-6 w-6 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">FreeBuff</span>
            </Link>
            <Link to="/events" className="text-gray-600 hover:text-gray-900">Events</Link>
            {isAuthenticated && (
              <Link to="/my-bookings" className="text-gray-600 hover:text-gray-900">My Bookings</Link>
            )}
            {isAuthenticated && (user?.role === 'ORGANIZER' || user?.role === 'ADMIN') && (
              <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600">{user?.fullName}</span>
                <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">{user?.role}</span>
                <button onClick={handleLogout} className="text-gray-500 hover:text-red-600">
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-gray-900">Login</Link>
                <Link to="/register" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
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

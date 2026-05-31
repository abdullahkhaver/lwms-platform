import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';

export const Navbar = () => {
  const { user, isAdmin, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to={isAuthenticated ? '/profile' : '/login'} className="text-2xl font-bold text-blue-600">
            LWMS
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated && (
              <>
                <Link to="/profile" className="text-gray-700 hover:text-blue-600 transition">
                  Profile
                </Link>
                <Link to="/submit-complaint" className="text-gray-700 hover:text-blue-600 transition">
                  Submit Complaint
                </Link>
                <Link to="/my-complaints" className="text-gray-700 hover:text-blue-600 transition">
                  My Complaints
                </Link>
                {isAdmin && (
                  <>
                    <Link to="/admin/dashboard" className="text-gray-700 hover:text-blue-600 transition">
                      Dashboard
                    </Link>
                    <Link to="/admin/users" className="text-gray-700 hover:text-blue-600 transition">
                      Users
                    </Link>
                  </>
                )}
              </>
            )}
            {!isAuthenticated && (
              <>
                <Link to="/track" className="text-gray-700 hover:text-blue-600 transition">
                  Track Complaint
                </Link>
              </>
            )}
            {isAuthenticated && (
              <div className="flex items-center space-x-3 pl-6 border-l border-gray-300">
                <div>
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-700 hover:text-red-600 transition"
                  title="Logout"
                >
                  <FiLogOut size={20} />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-700"
          >
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {isAuthenticated && (
              <>
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                  onClick={() => setIsOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  to="/submit-complaint"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                  onClick={() => setIsOpen(false)}
                >
                  Submit Complaint
                </Link>
                <Link
                  to="/my-complaints"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                  onClick={() => setIsOpen(false)}
                >
                  My Complaints
                </Link>
                {isAdmin && (
                  <>
                    <Link
                      to="/admin/dashboard"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                      onClick={() => setIsOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/admin/users"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                      onClick={() => setIsOpen(false)}
                    >
                      Users
                    </Link>
                  </>
                )}
              </>
            )}
            {!isAuthenticated && (
              <>
                <Link
                  to="/track"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                  onClick={() => setIsOpen(false)}
                >
                  Track Complaint
                </Link>
              </>
            )}
            {isAuthenticated && (
              <div className="px-4 py-2 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize mb-3">{user?.role}</p>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition flex items-center justify-center space-x-2"
                >
                  <FiLogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

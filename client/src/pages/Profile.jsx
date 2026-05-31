import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navbar, Alert, LoadingSpinner } from '../components';
import { FiUser, FiMail, FiEdit2, FiCheck, FiX } from 'react-icons/fi';

export default function Profile() {
  const { user, updateProfile, error, setError } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    if (!formData.name.trim()) {
      setAlert({ type: 'error', message: 'Name is required' });
      return;
    }

    if (!formData.email.trim()) {
      setAlert({ type: 'error', message: 'Email is required' });
      return;
    }

    setLoading(true);

    try {
      await updateProfile(formData.name, formData.email);
      setAlert({ type: 'success', message: 'Profile updated successfully' });
      setIsEditing(false);
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Failed to update profile',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
    });
    setIsEditing(false);
    setAlert(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <FiEdit2 size={18} />
                <span>Edit Profile</span>
              </button>
            )}
          </div>

          {alert && (
            <div className="mb-6">
              <Alert
                type={alert.type}
                message={alert.message}
                onClose={() => setAlert(null)}
                autoClose={true}
              />
            </div>
          )}

          {error && (
            <div className="mb-6">
              <Alert
                type="error"
                message={error}
                onClose={() => setError(null)}
                autoClose={true}
              />
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <FiCheck size={18} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                >
                  <FiX size={18} />
                  <span>Cancel</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <FiUser className="text-blue-600" size={24} />
                  <div>
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="text-lg font-semibold text-gray-900">{user?.name}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <FiMail className="text-blue-600" size={24} />
                  <div>
                    <p className="text-sm text-gray-600">Email Address</p>
                    <p className="text-lg font-semibold text-gray-900">{user?.email}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <p className="text-sm text-gray-600">Account Role</p>
                <p className="text-lg font-semibold text-blue-900 capitalize">{user?.role}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

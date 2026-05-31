import { useState } from 'react';
import { useComplaints } from '../context/ComplaintContext';
import { Alert, LoadingSpinner } from './index';
import { FiSearch } from 'react-icons/fi';

export const ComplaintTracker = () => {
  const { trackComplaint, error, setError } = useComplaints();
  const [trackingId, setTrackingId] = useState('');
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setAlert(null);

    if (!trackingId.trim()) {
      setAlert({ type: 'error', message: 'Please enter a tracking ID' });
      return;
    }

    setLoading(true);
    try {
      const response = await trackComplaint(trackingId);
      setComplaint(response.complaint);
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Complaint not found',
      });
      setComplaint(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'In Progress': 'bg-blue-100 text-blue-800 border-blue-300',
      Completed: 'bg-green-100 text-green-800 border-green-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusIcon = (status) => {
    const icons = {
      Pending: '⏳',
      'In Progress': '🔄',
      Completed: '✅',
    };
    return icons[status] || '❓';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Track Your Complaint</h2>

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

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="Enter tracking ID (e.g., LWMS-20260521-12345)"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Search'}
          </button>
        </div>
      </form>

      {/* Complaint Details */}
      {complaint && (
        <div className="space-y-6">
          {/* Status Card */}
          <div className={`border-2 rounded-lg p-6 ${getStatusColor(complaint.status)}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-75">Current Status</p>
                <p className="text-2xl font-bold">{getStatusIcon(complaint.status)} {complaint.status}</p>
              </div>
              <div className="text-4xl">{getStatusIcon(complaint.status)}</div>
            </div>
          </div>

          {/* Tracking ID */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Tracking ID</p>
            <p className="text-lg font-mono font-semibold text-gray-900">{complaint.trackingId}</p>
          </div>

          {/* Complaint Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Name</p>
              <p className="text-lg font-semibold text-gray-900">{complaint.name}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Phone</p>
              <p className="text-lg font-semibold text-gray-900">{complaint.phone}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
              <p className="text-sm text-gray-600">Address</p>
              <p className="text-lg font-semibold text-gray-900">{complaint.address}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
              <p className="text-sm text-gray-600">Description</p>
              <p className="text-lg font-semibold text-gray-900">{complaint.description}</p>
            </div>
          </div>

          {/* Image */}
          {complaint.image && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-3">Complaint Image</p>
              <img
                src={complaint.image}
                alt="Complaint"
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Timeline */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-3">Timeline</p>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Submitted</p>
                  <p className="text-xs text-gray-600">
                    {new Date(complaint.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              {complaint.updatedAt !== complaint.createdAt && (
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Last Updated</p>
                    <p className="text-xs text-gray-600">
                      {new Date(complaint.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!complaint && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-600">Enter a tracking ID to view complaint status</p>
        </div>
      )}
    </div>
  );
};

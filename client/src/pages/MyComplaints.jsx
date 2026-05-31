import { useState, useEffect } from 'react';
import { useComplaints } from '../context/ComplaintContext';
import { Navbar, Alert, LoadingSpinner } from '../components';
import { FiFilter, FiRefreshCw, FiMapPin, FiPhone, FiUser } from 'react-icons/fi';

export default function MyComplaints() {
  const { complaints, getUserComplaints, loading, error, setError } = useComplaints();
  const [statusFilter, setStatusFilter] = useState(null);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      await getUserComplaints();
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Failed to fetch complaints',
      });
    }
  };

  const handleFilterChange = async (status) => {
    setStatusFilter(status);
    try {
      await getUserComplaints(status);
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Failed to filter complaints',
      });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: 'bg-yellow-100 text-yellow-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      Completed: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      Pending: '⏳',
      'In Progress': '🔄',
      Completed: '✅',
    };
    return icons[status] || '❓';
  };

  const filteredComplaints = statusFilter
    ? complaints.filter((c) => c.status === statusFilter)
    : complaints;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Complaints</h1>
          <button
            onClick={fetchComplaints}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            <FiRefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
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

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => handleFilterChange(null)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              statusFilter === null
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            All
          </button>
          <button
            onClick={() => handleFilterChange('Pending')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              statusFilter === 'Pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            ⏳ Pending
          </button>
          <button
            onClick={() => handleFilterChange('In Progress')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              statusFilter === 'In Progress'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            🔄 In Progress
          </button>
          <button
            onClick={() => handleFilterChange('Completed')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              statusFilter === 'Completed'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            ✅ Completed
          </button>
        </div>

        {/* Complaints List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">No complaints found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredComplaints.map((complaint) => (
              <div
                key={complaint._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
              >
                {/* Image */}
                {complaint.image && (
                  <img
                    src={complaint.image}
                    alt="Complaint"
                    className="w-full h-40 object-cover"
                  />
                )}

                {/* Content */}
                <div className="p-4">
                  {/* Status Badge */}
                  <div className="mb-3">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                        complaint.status
                      )}`}
                    >
                      {getStatusIcon(complaint.status)} {complaint.status}
                    </span>
                  </div>

                  {/* Tracking ID */}
                  <p className="text-xs text-gray-500 font-mono mb-2">
                    ID: {complaint.trackingId}
                  </p>

                  {/* Name */}
                  <div className="flex items-start space-x-2 mb-2">
                    <FiUser className="text-gray-400 mt-1 flex-shrink-0" size={16} />
                    <div>
                      <p className="text-xs text-gray-600">Name</p>
                      <p className="text-sm font-semibold text-gray-900">{complaint.name}</p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start space-x-2 mb-2">
                    <FiPhone className="text-gray-400 mt-1 flex-shrink-0" size={16} />
                    <div>
                      <p className="text-xs text-gray-600">Phone</p>
                      <p className="text-sm font-semibold text-gray-900">{complaint.phone}</p>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start space-x-2 mb-3">
                    <FiMapPin className="text-gray-400 mt-1 flex-shrink-0" size={16} />
                    <div>
                      <p className="text-xs text-gray-600">Address</p>
                      <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                        {complaint.address}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-600">Description</p>
                    <p className="text-sm text-gray-700 line-clamp-2">{complaint.description}</p>
                  </div>

                  {/* Date */}
                  <p className="text-xs text-gray-500">
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

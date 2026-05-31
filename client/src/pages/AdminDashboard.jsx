import { useState, useEffect } from 'react';
import { useComplaints } from '../context/ComplaintContext';
import { Navbar, Alert, LoadingSpinner } from '../components';
import { FiRefreshCw, FiDownload, FiEdit2, FiTrash2 } from 'react-icons/fi';

export default function AdminDashboard() {
  const {
    complaints,
    getAllComplaints,
    getDashboardStats,
    updateComplaintStatus,
    deleteComplaint,
    loading,
    error,
    setError,
  } = useComplaints();

  const [stats, setStats] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingStatus, setEditingStatus] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [complaintRes, statsRes] = await Promise.all([
        getAllComplaints(),
        getDashboardStats(),
      ]);
      setStats(statsRes.stats);
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Failed to fetch dashboard data',
      });
    }
  };

  const handleStatusChange = async (id, status) => {
    setActionLoading(id);
    try {
      await updateComplaintStatus(id, status);
      setAlert({
        type: 'success',
        message: 'Status updated successfully',
      });
      setEditingId(null);
      await getAllComplaints(statusFilter);
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Failed to update status',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this complaint?')) {
      return;
    }

    setActionLoading(id);
    try {
      await deleteComplaint(id);
      setAlert({
        type: 'success',
        message: 'Complaint deleted successfully',
      });
      await getAllComplaints(statusFilter);
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Failed to delete complaint',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleFilterChange = async (status) => {
    setStatusFilter(status);
    try {
      await getAllComplaints(status);
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

  const filteredComplaints = statusFilter
    ? complaints.filter((c) => c.status === statusFilter)
    : complaints;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={fetchDashboardData}
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

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm font-medium">Total Complaints</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg shadow-md p-6 border-l-4 border-yellow-400">
              <p className="text-yellow-800 text-sm font-medium">Pending</p>
              <p className="text-3xl font-bold text-yellow-900 mt-2">{stats.pending}</p>
            </div>
            <div className="bg-blue-50 rounded-lg shadow-md p-6 border-l-4 border-blue-400">
              <p className="text-blue-800 text-sm font-medium">In Progress</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{stats.inProgress}</p>
            </div>
            <div className="bg-green-50 rounded-lg shadow-md p-6 border-l-4 border-green-400">
              <p className="text-green-800 text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold text-green-900 mt-2">{stats.completed}</p>
            </div>
            <div className="bg-purple-50 rounded-lg shadow-md p-6 border-l-4 border-purple-400">
              <p className="text-purple-800 text-sm font-medium">Completion Rate</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">{stats.completionRate}%</p>
            </div>
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

        {/* Complaints Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">No complaints found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Tracking ID
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredComplaints.map((complaint) => (
                    <tr key={complaint._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-mono text-gray-900">
                        {complaint.trackingId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {complaint.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {complaint.address}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {editingId === complaint._id ? (
                          <select
                            value={editingStatus}
                            onChange={(e) => setEditingStatus(e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        ) : (
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              complaint.status
                            )}`}
                          >
                            {complaint.status}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center space-x-2">
                          {editingId === complaint._id ? (
                            <>
                              <button
                                onClick={() =>
                                  handleStatusChange(complaint._id, editingStatus)
                                }
                                disabled={actionLoading === complaint._id}
                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50 text-xs font-medium"
                              >
                                {actionLoading === complaint._id ? 'Saving...' : 'Save'}
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition text-xs font-medium"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingId(complaint._id);
                                  setEditingStatus(complaint.status);
                                }}
                                className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-xs font-medium"
                              >
                                <FiEdit2 size={14} />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDelete(complaint._id)}
                                disabled={actionLoading === complaint._id}
                                className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50 text-xs font-medium"
                              >
                                <FiTrash2 size={14} />
                                <span>Delete</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

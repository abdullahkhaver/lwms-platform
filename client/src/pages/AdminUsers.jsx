import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navbar, Alert, LoadingSpinner } from '../components';
import { FiTrash2, FiEdit2, FiRefreshCw } from 'react-icons/fi';

export default function AdminUsers() {
  const { getAllUsers, updateUserRole, deleteUser, error, setError } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingRole, setEditingRole] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setAlert(null);
    try {
      const response = await getAllUsers();
      setUsers(response.users);
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Failed to fetch users',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditRole = (userId, currentRole) => {
    setEditingId(userId);
    setEditingRole(currentRole);
  };

  const handleSaveRole = async (userId) => {
    setActionLoading(userId);
    try {
      await updateUserRole(userId, editingRole);
      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, role: editingRole } : user
        )
      );
      setAlert({ type: 'success', message: 'Role updated successfully' });
      setEditingId(null);
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Failed to update role',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    setActionLoading(userId);
    try {
      await deleteUser(userId);
      setUsers((prev) => prev.filter((user) => user._id !== userId));
      setAlert({ type: 'success', message: 'User deleted successfully' });
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Failed to delete user',
      });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <button
            onClick={fetchUsers}
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

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">No users found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Joined</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{user.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4 text-sm">
                        {editingId === user._id ? (
                          <select
                            value={editingRole}
                            onChange={(e) => setEditingRole(e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center space-x-2">
                          {editingId === user._id ? (
                            <>
                              <button
                                onClick={() => handleSaveRole(user._id)}
                                disabled={actionLoading === user._id}
                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50 text-xs font-medium"
                              >
                                {actionLoading === user._id ? 'Saving...' : 'Save'}
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
                                onClick={() => handleEditRole(user._id, user.role)}
                                className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-xs font-medium"
                              >
                                <FiEdit2 size={14} />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user._id)}
                                disabled={actionLoading === user._id}
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

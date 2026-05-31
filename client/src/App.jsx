import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ComplaintProvider } from './context/ComplaintContext';
import { ProtectedRoute } from './components';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminUsers from './pages/AdminUsers';
import SubmitComplaint from './pages/SubmitComplaint';
import MyComplaints from './pages/MyComplaints';
import AdminDashboard from './pages/AdminDashboard';
import TrackComplaint from './pages/TrackComplaint';

export default function App() {
  return (
    <AuthProvider>
      <ComplaintProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/track" element={<TrackComplaint />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/submit-complaint"
              element={
                <ProtectedRoute>
                  <SubmitComplaint />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-complaints"
              element={
                <ProtectedRoute>
                  <MyComplaints />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/profile" replace />} />
            <Route path="*" element={<Navigate to="/profile" replace />} />
          </Routes>
        </BrowserRouter>
      </ComplaintProvider>
    </AuthProvider>
  );
}

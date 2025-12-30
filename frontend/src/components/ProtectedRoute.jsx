import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  console.log('ProtectedRoute: token =', token);
  if (!token) {
    console.log('ProtectedRoute: No token, redirecting to /signin');
    return <Navigate to="/signin" replace />;
  }
  return children ? children : <Outlet />;
} 
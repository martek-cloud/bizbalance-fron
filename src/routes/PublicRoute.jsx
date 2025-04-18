
import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from '@/store/authStore';

export const PublicRoute = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated());

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
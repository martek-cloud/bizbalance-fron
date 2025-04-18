// src/guards/AuthGuards.jsx
import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from '@/store/authStore';
import Layout from "@/components/Layout";

export const ComptableGuard = () => {
  const user = useAuthStore(state => state.user);

  if (!['admin', 'comptable'].includes(user?.role_type)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

export const AdminGuard = () => {
  const user = useAuthStore(state => state.user);

  if (user?.role_type !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};
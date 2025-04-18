// src/routes/PermissionGuard.jsx
import { Navigate } from "react-router-dom";
import roleStore from "@/store/roleStore";
import authStore from "@/store/authStore";
import { useEffect, useState } from "react";
import { Loader2 } from 'lucide-react';


export function PermissionGuard({ module, action, children }) {
  const { hasPermission, fetchUserPermissions } = roleStore();
  const { user } = authStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializePermissions = async () => {
      if (user?.role_id) {
        // Call fetchUserPermissions only once
        const permissions = await fetchUserPermissions(user.role_id);
      }
      setIsLoading(false);
    };

    initializePermissions();
  }, [user]);

  if (isLoading) {
    return <div className="min-h-screen flex justify-center items-center">
      <Loader2 className={'animate-spin'} />
    </div>;
  }

  // If user doesn't have permission, redirect to unauthorized
  if (!hasPermission(module, action)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If user has permission, render children
  return children;
}
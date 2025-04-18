import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import authStore from '@/store/authStore'; // Adjust path as needed
import useBusinessStore from '@/store/businessStore'; // Adjust path as needed
import { Loader2 } from 'lucide-react';

/**
 * BusinessGuard component
 * 
 * Protects routes by checking if the user has at least one business.
 * If the user has no businesses, they are redirected to the NoBusiness page.
 */
const BusinessGuard = () => {
  const [isChecking, setIsChecking] = useState(true);
  const [hasBusinesses, setHasBusinesses] = useState(false);
  
  const location = useLocation();
  const isAuthenticated = authStore.getState().isAuthenticated();
  const {user} = authStore();
  const fetchBusinesses = useBusinessStore.getState().fetchBusinesses;
  
  useEffect(() => {
    const checkBusinesses = async () => {
      if (!isAuthenticated) {
        setIsChecking(false);
        return;
      }
      
      try {
        const businesses = await fetchBusinesses();
        setHasBusinesses(Array.isArray(businesses) && businesses.length > 0);
      } catch (error) {
        console.error('Error checking businesses:', error);
        // If there's an error, we'll default to false for safety
        setHasBusinesses(false);
      } finally {
        setIsChecking(false);
      }
    };
    
    checkBusinesses();
  }, []);
  
  // If still checking, show loading spinner
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Checking business information...</span>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  // If authenticated but has no businesses, redirect to NoBusiness page
  if (!hasBusinesses && user.role_type !== 'admin') {
    return <Navigate to="/no-business" state={{ from: location }} replace />;
  }
  
  // If authenticated and has businesses, render the protected route
  return <Outlet />;
};

export default BusinessGuard;
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import authStore from '@/store/authStore'; // Adjust path as needed
import useBusinessStore from '@/store/businessStore'; // Adjust path as needed
import BusinessForm from '@/pages/BusinessUI/BusinessForm'; // Adjust path as needed
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Briefcase, Loader2 } from 'lucide-react';

const NoBusiness = () => {
  const [addBusinessOpen, setAddBusinessOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const navigate = useNavigate();
  
  // Get the current user and businesses
  const user = authStore.getState().user;
  const businesses = useBusinessStore.getState().businesses;
  const fetchBusinesses = useBusinessStore.getState().fetchBusinesses;
  const addBusiness = useBusinessStore.getState().addBusiness;
  
  useEffect(() => {
    // Fetch businesses when component mounts
    fetchBusinesses();
  }, []);

  const handleAddBusiness = async (data) => {
    setIsSubmitting(true);
    try {
      const success = await addBusiness(data);
      if (success) {
        setAddBusinessOpen(false);
        navigate('/dashboard');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authStore.getState().logout();
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-8">

<Briefcase className="w-24 h-24 mx-auto" />
        </div>
        
        <h1 className="text-4xl font-bold mb-4">No Business Found</h1>
        
        <p className="text-lg mb-8">
          {user?.role_type === 'user' 
            ? "You don't have any businesses yet. Create your first business to get started."
            : "We couldn't find the business you were looking for. It may have been removed, renamed, or is temporarily unavailable."}
        </p>
        
        <div className="space-y-4">
          {user?.role_type === 'user' && (
            <Dialog open={addBusinessOpen} onOpenChange={setAddBusinessOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">Create a Business</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create a New Business</DialogTitle>
                  <DialogDescription>
                    Fill in the details below to create your business profile.
                  </DialogDescription>
                </DialogHeader>
                <BusinessForm 
                  onSubmit={handleAddBusiness}
                  onCancel={() => setAddBusinessOpen(false)}
                  isSubmitting={isSubmitting}
                />
              </DialogContent>
            </Dialog>
          )}
          
          <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">Logout</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Logout</DialogTitle>
                <DialogDescription>
                  Are you sure you want to log out of your account?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="sm:justify-end mt-4">
                <Button variant="outline" onClick={() => setLogoutDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleLogout}>
                  {isLoggingOut ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging out...
                    </>
                  ) : (
                    "Logout"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* <Link to="/dashboard" className="block">
            <Button variant="outline" className="w-full">Return to Dashboard</Button>
          </Link> */}
        </div>
      </div>
      
      {/* <div className="mt-12 text-center">
        <p>Need assistance? <a href="/contact" className="hover:underline">Contact Support</a></p>
      </div> */}
    </div>
  );
};

export default NoBusiness;
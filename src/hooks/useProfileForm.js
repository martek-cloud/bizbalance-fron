// src/hooks/useProfileForm.js
import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import authStore from '@/store/authStore';

export const useProfileForm = (user) => {
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [removeExistingPhoto, setRemoveExistingPhoto] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const updateProfile = authStore((state) => state.updateProfile);

  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",

  });

  // Update formData when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (user?.profile_picture) {
      setPhotoPreview(
        `${import.meta.env.VITE_API_URL}/storage/${user.profile_picture}`
      );
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formDataToSubmit = new FormData();
      
      // Add _method field for Laravel to handle it as PUT
      formDataToSubmit.append('_method', 'PUT');
      
      // Append all form data fields
      Object.keys(formData).forEach(key => {
        formDataToSubmit.append(key, formData[key]);
      });

      // Handle photo
      if (photoFile) {
        formDataToSubmit.append('photo', photoFile);
      }

      // Handle photo removal
      if (removeExistingPhoto) {
        formDataToSubmit.append('remove_photo', 'true');
      }

      // Log FormData contents for debugging
      for (let pair of formDataToSubmit.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      const success = await updateProfile(formDataToSubmit);
      if (success) {
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.message || "Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    photoFile,
    setPhotoFile,
    photoPreview,
    setPhotoPreview,
    removeExistingPhoto,
    setRemoveExistingPhoto,
    loading,
    fileInputRef,
    handleSubmit
  };
};
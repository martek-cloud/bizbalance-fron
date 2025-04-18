// src/pages/ProfileUI/PhotoUpload.jsx
import React from 'react';
import { X, ImageIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from 'react-hot-toast';

export const PhotoUpload = ({ 
  photoPreview, 
  formData, 
  removeExistingPhoto, 
  handlePhotoClick, 
  handleRemovePhoto,
  fileInputRef,
  setPhotoFile,
  setPhotoPreview,
  setRemoveExistingPhoto 
}) => (
  <div className="flex items-center gap-6">
    <div className="relative">
      <Avatar
        className="w-24 h-24 cursor-pointer hover:opacity-90 transition-opacity"
        onClick={handlePhotoClick}
      >
        <AvatarImage
          src={removeExistingPhoto ? null : photoPreview}
          alt={`${formData.first_name} ${formData.last_name}`}
        />
        <AvatarFallback>
          {formData.first_name?.[0]}
          {formData.last_name?.[0]}
        </AvatarFallback>
      </Avatar>
      {photoPreview && !removeExistingPhoto && (
        <button
          type="button"
          onClick={handleRemovePhoto}
          className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
        >
          <X className="w-4" />
        </button>
      )}
    </div>
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            if (file.size > 5 * 1024 * 1024) {
              toast.error("Image size must not exceed 5MB");
              return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
              setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
            setPhotoFile(file);
            setRemoveExistingPhoto(false);
          }
        }}
        className="hidden"
      />
      <Button type="button" variant="outline" onClick={handlePhotoClick}>
        <ImageIcon className="mr-2 h-4 w-4" />
        {photoPreview ? "Change Photo" : "Upload Photo"}
      </Button>
      <p className="text-sm text-muted-foreground">
        Maximum file size: 5MB
      </p>
    </div>
  </div>
);
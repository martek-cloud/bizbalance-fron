// src/pages/ProfileUI/GeneralInfo.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PhotoUpload } from "./PhotoUpload";

export const GeneralInfo = ({
  formData,
  handleChange,
  handleSubmit,
  loading,
  photoPreview,
  removeExistingPhoto,
  handlePhotoClick,
  handleRemovePhoto,
  fileInputRef,
  setPhotoFile,
  setPhotoPreview,
  setRemoveExistingPhoto,
  setFormData,
}) => {
  const handleSelectChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          <PhotoUpload
            photoPreview={photoPreview}
            formData={formData}
            removeExistingPhoto={removeExistingPhoto}
            handlePhotoClick={handlePhotoClick}
            handleRemovePhoto={handleRemovePhoto}
            fileInputRef={fileInputRef}
            setPhotoFile={setPhotoFile}
            setPhotoPreview={setPhotoPreview}
            setRemoveExistingPhoto={setRemoveExistingPhoto}
          />

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled
              className="bg-muted"
            />
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading} className="min-w-[150px]">
          {loading ? (
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Saving...
            </div>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
};

export default GeneralInfo;

// src/pages/ProfileUI/ProfilePage.jsx
import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Toaster } from "react-hot-toast";
import authStore from "@/store/authStore";
import { useTheme } from "@/components/theme-provider";
import { ProfileLayout } from "./ProfileLayout";
import { GeneralInfo } from "./GeneralInfo";
import { SecuritySettings } from "./SecuritySettings"; // Create this component
import { AppearanceSettings } from "./AppearanceSettings"; // Create this component
import Settings from "./Settings"; // Import the Settings component
import { useProfileForm } from "@/hooks/useProfileForm";

const ProfilePage = () => {
  const user = authStore((state) => state.user);
  const [activeTab, setActiveTab] = useState("general");
  const { theme, setTheme } = useTheme();
  const [tempTheme, setTempTheme] = useState(theme);
  const [tempFontSize, setTempFontSize] = useState("medium");
  const [tempLanguage, setTempLanguage] = useState("en");

  const {
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
  } = useProfileForm(user);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setRemoveExistingPhoto(true);
  };

  return (
    <ProfileLayout user={user} activeTab={activeTab} setActiveTab={setActiveTab}>
      <Card className="w-full p-4 mx-auto">
        <CardHeader>
          <h3 className="text-2xl font-bold">
            {activeTab === "general" && "General Information"}
            {activeTab === "security" && "Security Settings"}
            {activeTab === "appearance" && "Appearance Settings"}
            {activeTab === "settings" && "Application Settings"}
          </h3>
        </CardHeader>
        <CardContent>
          {activeTab === "general" && (
            <GeneralInfo
              formData={formData}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              loading={loading}
              photoPreview={photoPreview}
              removeExistingPhoto={removeExistingPhoto}
              handlePhotoClick={handlePhotoClick}
              handleRemovePhoto={handleRemovePhoto}
              fileInputRef={fileInputRef}
              setPhotoFile={setPhotoFile}
              setPhotoPreview={setPhotoPreview}
              setRemoveExistingPhoto={setRemoveExistingPhoto}
            />
          )}
          {activeTab === "security" && <SecuritySettings />}
          {activeTab === "appearance" && (
            <AppearanceSettings
              tempTheme={tempTheme}
              setTempTheme={setTempTheme}
              tempFontSize={tempFontSize}
              setTempFontSize={setTempFontSize}
              tempLanguage={tempLanguage}
              setTempLanguage={setTempLanguage}
              setTheme={setTheme}
            />
          )}
          {activeTab === "settings" && <Settings />}
        </CardContent>
      </Card>
    </ProfileLayout>
  );
};

export default ProfilePage;
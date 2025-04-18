// src/pages/ProfileUI/ProfileLayout.jsx
import React from 'react';
import { User, Lock, Palette, Settings } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export const ProfileLayout = ({ user, activeTab, setActiveTab, children }) => (
  <div className="flex min-h-screen bg-muted/30">
    <div className="w-64 border-r bg-background">
      <div className="p-4 space-y-4">
        <div className="flex items-center space-x-2 px-2">
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={user?.profile_picture ? `${import.meta.env.VITE_API_URL}/storage/${user.profile_picture}` : null} 
            />
            <AvatarFallback>
              {user?.first_name?.[0]}
              {user?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-muted-foreground">{user?.role_type}</p>
          </div>
        </div>
        <Separator />
        <nav className="space-y-2">
          <ProfileNavButton 
            icon={<User className="mr-2 h-4 w-4" />}
            label="General Info"
            isActive={activeTab === "general"}
            onClick={() => setActiveTab("general")}
          />
          <ProfileNavButton 
            icon={<Lock className="mr-2 h-4 w-4" />}
            label="Security"
            isActive={activeTab === "security"}
            onClick={() => setActiveTab("security")}
          />
          <ProfileNavButton 
            icon={<Palette className="mr-2 h-4 w-4" />}
            label="Appearance"
            isActive={activeTab === "appearance"}
            onClick={() => setActiveTab("appearance")}
          />
          {user?.role_type === 'admin' && (
            <ProfileNavButton 
              icon={<Settings className="mr-2 h-4 w-4" />}
              label="Settings"
            isActive={activeTab === "settings"}
            onClick={() => setActiveTab("settings")}
          />
          )}
        </nav>
      </div>
    </div>
    <div className="flex-1 p-6">
      {children}
    </div>
  </div>
);

const ProfileNavButton = ({ icon, label, isActive, onClick }) => (
  <Button
    variant={isActive ? "default" : "ghost"}
    className="w-full justify-start"
    onClick={onClick}
  >
    {icon}
    {label}
  </Button>
);
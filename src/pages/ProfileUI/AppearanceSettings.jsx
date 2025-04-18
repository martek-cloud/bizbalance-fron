// src/pages/ProfileUI/AppearanceSettings.jsx
import React from 'react';
import { Moon, Sun, Languages, Type, Monitor } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/theme-provider";
import { useState, useEffect } from 'react';

const fontSizes = {
  small: "14px",
  medium: "16px",
  large: "18px",
};

const languages = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'es', name: 'Español' },
  { code: 'de', name: 'Deutsch' },
  { code: 'ar', name: 'العربية' },
];

export const AppearanceSettings = () => {
  const { theme, setTheme } = useTheme();
  const [preferences, setPreferences] = useState({
    fontSize: localStorage.getItem('fontSize') || 'medium',
    language: localStorage.getItem('language') || 'en',
    reduceMotion: localStorage.getItem('reduceMotion') === 'true',
    highContrast: localStorage.getItem('highContrast') === 'true',
  });
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    // Apply stored preferences on component mount
    applyPreferences(preferences, false);
  }, []);

  const applyPreferences = async (newPrefs, showToast = true) => {
    try {
      // Apply font size
      document.documentElement.style.fontSize = fontSizes[newPrefs.fontSize];

      // Apply language
      document.documentElement.lang = newPrefs.language;

      // Apply motion preferences
      document.documentElement.style.setProperty(
        '--reduce-motion',
        newPrefs.reduceMotion ? 'reduce' : 'no-preference'
      );

      // Apply contrast preferences
      if (newPrefs.highContrast) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }

      // Save to localStorage
      localStorage.setItem('fontSize', newPrefs.fontSize);
      localStorage.setItem('language', newPrefs.language);
      localStorage.setItem('reduceMotion', newPrefs.reduceMotion);
      localStorage.setItem('highContrast', newPrefs.highContrast);

      if (showToast) {
        toast.success('Appearance settings updated successfully!');
      }
    } catch (error) {
      console.error('Error applying preferences:', error);
      toast.error('Failed to update appearance settings');
    }
  };

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApplyChanges = async () => {
    setIsApplying(true);
    await applyPreferences(preferences);
    setIsApplying(false);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Theme Settings</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Theme Mode</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    Light
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    Dark
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    System
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Font Size</Label>
            <Select 
              value={preferences.fontSize} 
              onValueChange={(value) => handlePreferenceChange('fontSize', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">
                  <div className="flex items-center gap-2">
                    <Type className="h-3 w-3" />
                    Small
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    Medium
                  </div>
                </SelectItem>
                <SelectItem value="large">
                  <div className="flex items-center gap-2">
                    <Type className="h-5 w-5" />
                    Large
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Language</Label>
            <Select 
              value={preferences.language} 
              onValueChange={(value) => handlePreferenceChange('language', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <div className="flex items-center gap-2">
                      <Languages className="h-4 w-4" />
                      {lang.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Accessibility</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Reduce Motion</Label>
              <p className="text-sm text-muted-foreground">
                Reduce animation and motion effects
              </p>
            </div>
            <Switch
              checked={preferences.reduceMotion}
              onCheckedChange={(checked) => handlePreferenceChange('reduceMotion', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>High Contrast</Label>
              <p className="text-sm text-muted-foreground">
                Increase contrast for better visibility
              </p>
            </div>
            <Switch
              checked={preferences.highContrast}
              onCheckedChange={(checked) => handlePreferenceChange('highContrast', checked)}
            />
          </div>
        </div>
      </Card> */}

      <Button 
        className="w-full"
        onClick={handleApplyChanges}
        disabled={isApplying}
      >
        {isApplying ? (
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Applying Changes...
          </div>
        ) : (
          'Apply Changes'
        )}
      </Button>
    </div>
  );
};
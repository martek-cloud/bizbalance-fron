import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Car, RefreshCw, Clock, Loader2, Settings as SettingsIcon, Zap } from 'lucide-react';
import useSettingsStore from '@/store/settingsStore';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

// Define available settings
const AVAILABLE_SETTINGS = [
  { id: 'mileage_ratio', name: 'Mileage Ratio', icon: Car, defaultValue: '0.7', description: 'Dollar amount per mile for expense calculations' },
  { id: 'tax_rate', name: 'Tax Rate', icon: Zap, defaultValue: '22', description: 'Default tax rate percentage for calculations' },
];

const Settings = () => {
  const [selectedSetting, setSelectedSetting] = useState('');
  const [settingValue, setSettingValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Get store methods and states
  const { 
    settings, 
    latestSetting,
    loading, 
    fetchSettings, 
    addSetting,
    fetchLatestSetting
  } = useSettingsStore();

  // Load all settings when component mounts
  useEffect(() => {
    const loadSettings = async () => {
      await fetchSettings();
    };
    loadSettings();
  }, [fetchSettings]);

  // Find the current setting value from the settings list
  const getCurrentSettingValue = (settingId) => {
    if (!settingId) return '';
    
    // Find setting in the list - note the field is 'setting' not 'key'
    const setting = settings.find(s => s.setting === settingId);
    return setting ? setting.value : getDefaultValue(settingId);
  };

  // Get the default value for a setting
  const getDefaultValue = (settingId) => {
    const setting = AVAILABLE_SETTINGS.find(s => s.id === settingId);
    return setting ? setting.defaultValue : '';
  };

  // Handle setting selection change
  const handleSettingChange = (settingId) => {
    setSelectedSetting(settingId);
    setSettingValue(getCurrentSettingValue(settingId));
  };

  // Handle input value change
  const handleValueChange = (e) => {
    setSettingValue(e.target.value);
  };

  // Save the setting
  const handleSaveSetting = async () => {
    if (!selectedSetting || !settingValue) {
      toast.error('Please select a setting and enter a value');
      return;
    }

    setIsSaving(true);
    try {
      await addSetting({
        setting: selectedSetting, // Use 'setting' instead of 'key'
        value: settingValue,
        status: 'active'
      });
      
      // Fetch all settings again to update the list
      await fetchSettings();
      toast.success(`${getSettingName(selectedSetting)} updated successfully`);
    } catch (error) {
      console.error('Error saving setting:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to default value
  const resetToDefault = () => {
    if (!selectedSetting) return;
    setSettingValue(getDefaultValue(selectedSetting));
    toast.success(`Reset to default value`);
  };

  // Get setting name for display
  const getSettingName = (settingId) => {
    const setting = AVAILABLE_SETTINGS.find(s => s.id === settingId);
    return setting ? setting.name : settingId;
  };

  // Get the latest setting (useful for initialization)
  const handleGetLatest = async () => {
    const latest = await fetchLatestSetting();
    if (latest) {
      setSelectedSetting(latest.setting);
      setSettingValue(latest.value);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <SettingsIcon className="h-6 w-6 text-primary" />
              <CardTitle>Settings</CardTitle>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleGetLatest}
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Clock className="mr-2 h-4 w-4" />}
              Load Latest
            </Button>
          </div>
          <CardDescription>
            Configure application settings and preferences
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="setting">Select Setting</Label>
              <Select
                value={selectedSetting}
                onValueChange={handleSettingChange}
              >
                <SelectTrigger id="setting">
                  <SelectValue placeholder="Select a setting to configure" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_SETTINGS.map((setting) => (
                    <SelectItem key={setting.id} value={setting.id}>
                      <div className="flex items-center">
                        {React.createElement(setting.icon, { className: "mr-2 h-4 w-4" })}
                        <span>{setting.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedSetting && (
                <p className="text-sm text-muted-foreground mt-1">
                  {AVAILABLE_SETTINGS.find(s => s.id === selectedSetting)?.description}
                </p>
              )}
            </div>

            {selectedSetting && (
              <div className="space-y-2">
                <Label htmlFor="value">Setting Value</Label>
                <div className="flex space-x-2">
                  <Input
                    id="value"
                    value={settingValue}
                    onChange={handleValueChange}
                    placeholder={`Enter value for ${getSettingName(selectedSetting)}`}
                  />
                  <Button variant="outline" onClick={resetToDefault}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                onClick={handleSaveSetting}
                disabled={!selectedSetting || !settingValue || isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Setting
                  </>
                )}
              </Button>
            </div>
            
            {settings.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-2">Current Settings</h3>
                <div className="bg-muted rounded-md p-4">
                  <div className="space-y-2">
                    {settings.map((setting, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{getSettingName(setting.setting)}: </span>
                          <span>{setting.value}</span>
                          {setting.status !== 'active' && (
                            <span className="ml-2 text-sm text-muted-foreground">({setting.status})</span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {setting.created_at && format(new Date(setting.created_at), 'MMM d, yyyy')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
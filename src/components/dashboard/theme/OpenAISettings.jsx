import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast";

const OpenAISettings = () => {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load API key from localStorage on component mount
  useEffect(() => {
    const savedKey = localStorage.getItem("openai_api_key");
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    
    // Save API key to localStorage
    localStorage.setItem("openai_api_key", apiKey);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsSaving(false);
      toast.success("OpenAI API key saved successfully");
    }, 500);
  };

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <Label htmlFor="api-key">OpenAI API Key</Label>
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Input
              id="api-key"
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your OpenAI API key"
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={isSaving || !apiKey}
          >
            {isSaving ? (
              <div className="flex items-center">
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Saving...
              </div>
            ) : (
              <div className="flex items-center">
                <Save className="mr-2 h-4 w-4" />
                Save
              </div>
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Your API key is stored locally and never sent to our servers.
        </p>
      </div>
    </div>
  );
};

export default OpenAISettings; 
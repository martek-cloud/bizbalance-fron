import { create } from "zustand";
import axios from "@/lib/axios";
import { toast } from "react-hot-toast";
import authStore from "./authStore";

const useSettingsStore = create((set, get) => ({
  settings: [],
  latestSetting: null,
  loading: false,
  error: null,

  // Reset the store to initial state
  resetState: () => {
    set({
      settings: [],
      latestSetting: null,
      loading: false,
      error: null,
    });
  },

  // Fetch all settings (index)
  fetchSettings: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get('/api/settings');
      if (response.data.status === 'success') {
        set({ 
          settings: response.data.data,
          loading: false 
        });
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch settings');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Error fetching settings';
      set({ 
        error: errorMessage, 
        loading: false 
      });
      toast.error(errorMessage);
      return [];
    }
  },

  // Add a new setting (store)
  addSetting: async (settingData) => {
    set({ loading: true, error: null });
    try {
      // Make sure we're using the correct field names from the model
      const data = {
        setting: settingData.setting,
        value: settingData.value,
        status: settingData.status || 'active'
      };

      const response = await axios.post('/api/settings', data);
      if (response.data.status === 'success') {
        // Add the new setting to the settings array
        const newSettings = [...get().settings, response.data.data];
        set({ 
          settings: newSettings,
          latestSetting: response.data.data,
          loading: false 
        });
        toast.success('Setting added successfully');
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to add setting');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Error adding setting';
      set({ 
        error: errorMessage, 
        loading: false 
      });
      toast.error(errorMessage);
      return null;
    }
  },

  // Get the latest setting (getLast)
  fetchLatestSetting: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get('/api/settings/latest');
      if (response.data.status === 'success') {
        set({ 
          latestSetting: response.data.data,
          loading: false 
        });
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch latest setting');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Error fetching latest setting';
      set({ 
        error: errorMessage, 
        loading: false 
      });
      toast.error(errorMessage);
      return null;
    }
  }
}));

export default useSettingsStore;

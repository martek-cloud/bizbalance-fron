import { create } from "zustand";
import axios from "@/lib/axios";
import { toast } from "react-hot-toast";

const useVehicleUsageStore = create((set, get) => ({
  // State
  usages: [],
  loading: false,
  error: null,
  currentUsage: null,
  vehicleTotals: {}, // Object to store total miles per vehicle ID

  // Reset state
  resetState: () => set({ 
    usages: [], 
    loading: false, 
    error: null, 
    currentUsage: null,
    vehicleTotals: {}
  }),

  // Calculate and update total miles in state for a specific vehicle
  calculateTotalMiles: (vehicleId) => {
    const total = get().usages.reduce((total, usage) => total + parseFloat(usage.mileage), 0);
    
    set((state) => ({ 
      vehicleTotals: {
        ...state.vehicleTotals,
        [vehicleId]: total
      }
    }));
    
    return total;
  },

  // Get total miles for a specific vehicle
  getTotalMilesForVehicle: (vehicleId) => {
    // If we have a cached value for this vehicle, return it
    if (get().vehicleTotals[vehicleId] !== undefined) {
      return get().vehicleTotals[vehicleId];
    }
    
    // Otherwise calculate it
    return get().calculateTotalMiles(vehicleId);
  },

  // Fetch all usages for a vehicle
  fetchUsages: async (vehicleId) => {
    set({ loading: true });
    try {
      const response = await axios.get(`/api/vehicles/${vehicleId}/usages`);
      set({ 
        usages: response.data,
        error: null 
      });
      
      // Calculate total miles for this vehicle
      get().calculateTotalMiles(vehicleId);
      
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch usages";
      set({ error: message });
      toast.error(message);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  // Add new usage
  addUsage: async (vehicleId, data) => {
    set({ loading: true });
    try {
      const response = await axios.post(`/api/vehicles/${vehicleId}/usages`, {
        usage_date: data.usage_date,
        mileage: parseFloat(data.mileage),
        notes: data.notes || ""
      });

      set((state) => ({ 
        usages: [...state.usages, response.data],
        error: null 
      }));

      // Update total miles for this vehicle
      get().calculateTotalMiles(vehicleId);

      toast.success("Usage record added successfully");
      return true;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to add usage";
      set({ error: message });
      toast.error(message);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  // Update usage
  updateUsage: async (vehicleId, usageId, data) => {
    set({ loading: true });
    try {
      const response = await axios.put(`/api/vehicles/${vehicleId}/usages/${usageId}`, {
        usage_date: data.usage_date,
        mileage: parseFloat(data.mileage),
        notes: data.notes || ""
      });

      set((state) => ({
        usages: state.usages.map((usage) => 
          usage.id === usageId ? response.data : usage
        ),
        error: null
      }));

      // Update total miles for this vehicle
      get().calculateTotalMiles(vehicleId);

      toast.success("Usage record updated successfully");
      return true;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update usage";
      set({ error: message });
      toast.error(message);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  // Delete usage
  deleteUsage: async (vehicleId, usageId) => {
    set({ loading: true });
    try {
      await axios.delete(`/api/vehicles/${vehicleId}/usages/${usageId}`);

      set((state) => ({
        usages: state.usages.filter((usage) => usage.id !== usageId),
        error: null
      }));

      // Update total miles for this vehicle
      get().calculateTotalMiles(vehicleId);

      toast.success("Usage record deleted successfully");
      return true;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to delete usage";
      set({ error: message });
      toast.error(message);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  // Get single usage
  getUsage: async (vehicleId, usageId) => {
    set({ loading: true });
    try {
      const response = await axios.get(`/api/vehicles/${vehicleId}/usages/${usageId}`);
      set({ 
        currentUsage: response.data,
        error: null 
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch usage";
      set({ error: message });
      toast.error(message);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  // Original method for backward compatibility
  getTotalMileage: () => {
    const currentVehicleId = get().usages[0]?.vehicle_id;
    if (currentVehicleId) {
      return get().getTotalMilesForVehicle(currentVehicleId);
    }
    return 0;
  },

  // Getters
  getLoading: () => get().loading,
  getError: () => get().error,
  getCurrentUsage: () => get().currentUsage,
  getAllUsages: () => get().usages,
  getVehicleTotals: () => get().vehicleTotals
}));

export default useVehicleUsageStore;
import { create } from "zustand";
import axios from "@/lib/axios";
import { toast } from "react-hot-toast";
import authStore from "./authStore";

const useVehicleStore = create((set, get) => ({
  vehicles: [],
  loading: false,
  error: null,
  currentVehicle: null,

  // Reset state
  resetState: () => set({ 
    vehicles: [], 
    loading: false, 
    error: null, 
    currentVehicle: null 
  }),

  // Permission check helper
  canModifyVehicle: (vehicle) => {
    const user = authStore.getState().user;
    return user && 
           user.role_type === 'user' && 
           vehicle?.created_by?.toString() === user.id?.toString();
  },

  fetchVehicles: async () => {
    set({ loading: true, error: null });
    try {
      const user = authStore.getState().user;
      const response = await axios.get('/api/vehicles', {
        params: {
          role_type: user.role_type,
          comptable_key: user.comptable_key,
          comptable_reference_key: user.comptable_reference_key,
          id: user.id,
        },
      });
      set({ vehicles: response.data });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to fetch vehicles";
      set({ error: errorMessage });
      toast.error(errorMessage);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  addVehicle: async (vehicleData) => {
    const user = authStore.getState().user;
    if (user.role_type !== 'user') {
      toast.error("Only users can create vehicle records");
      return false;
    }

    set({ loading: true, error: null });
    try {
      // Ensure personal_miles is included in the request
      const dataToSend = {
        ...vehicleData,
        personal_miles: vehicleData.personal_miles || 0, // Default to 0 if not provided
        created_by: user.id,
      };

      const response = await axios.post('/api/vehicles', dataToSend);
      
      set((state) => ({
        vehicles: [...state.vehicles, response.data]
      }));
      toast.success("Vehicle created successfully");
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to add vehicle";
      set({ error: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  updateVehicle: async (id, data) => {
    const vehicle = get().vehicles.find(v => v.id === id);
    if (!get().canModifyVehicle(vehicle)) {
      toast.error("You don't have permission to update this vehicle");
      return false;
    }

    set({ loading: true, error: null });
    try {
      // Transform the data to match the API expectations
      const dataToUpdate = {
        business_id: data.business_id,
        date_placed_in_service: data.date_placed_in_service,
        vehicle_make: data.vehicle_make,
        cost: parseFloat(data.cost),
        jan_miles: parseFloat(data.jan_miles),
        personal_miles: parseFloat(data.personal_miles), // Add personal_miles
        ownership_type: data.ownership_type,
        deduction_type: data.deduction_type,
      };

      const response = await axios.put(`/api/vehicles/${id}`, dataToUpdate);
      
      set((state) => ({
        vehicles: state.vehicles.map((vehicle) => 
          vehicle.id === id ? response.data : vehicle
        )
      }));
      toast.success("Vehicle updated successfully");
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to update vehicle";
      set({ error: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  deleteVehicle: async (id) => {
    const vehicle = get().vehicles.find(v => v.id === id);
    if (!get().canModifyVehicle(vehicle)) {
      toast.error("You don't have permission to delete this vehicle");
      return false;
    }

    set({ loading: true, error: null });
    try {
      await axios.delete(`/api/vehicles/${id}`);
      set((state) => ({
        vehicles: state.vehicles.filter((vehicle) => vehicle.id !== id)
      }));
      toast.success("Vehicle deleted successfully");
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to delete vehicle";
      set({ error: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  // Helper methods
  getCurrentVehicle: () => get().currentVehicle,
  getAllVehicles: () => get().vehicles,
  getVehicleById: (id) => get().vehicles.find(vehicle => vehicle.id === id),
  isLoading: () => get().loading,
  getError: () => get().error,
}));

export default useVehicleStore;
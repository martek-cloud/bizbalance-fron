import { create } from "zustand";
import axios from "@/lib/axios";
import { toast } from "react-hot-toast";
import authStore from "./authStore";

const useBusinessStore = create((set, get) => ({
  businesses: [],
  loading: false,
  error: null,
  currentBusiness: null,
  oldestBusiness: null,

  resetState: () => set({ 
    businesses: [], 
    loading: false, 
    error: null, 
    currentBusiness: null,
    oldestBusiness: null
  }),

  canModifyBusiness: (business) => {
    const user = authStore.getState().user;
    return user && 
           user.role_type === 'user' && 
           business?.created_by?.toString() === user.id?.toString();
  },

  fetchBusinesses: async () => {
    set({ loading: true, error: null });
    try {
      const user = authStore.getState().user;
      const response = await axios.get('/api/businesses', {
        params: {
          role_type: user.role_type,
          comptable_key: user.comptable_key,
          comptable_reference_key: user.comptable_reference_key,
          id: user.id,
        },
      });
      set({ businesses: response.data });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to fetch businesses";
      set({ error: errorMessage });
      toast.error(errorMessage);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  addBusiness: async (businessData) => {
    const user = authStore.getState().user;
    if (user.role_type !== 'user') {
      toast.error("Only users can create business records");
      return false;
    }

    set({ loading: true, error: null });
    try {
      const response = await axios.post('/api/businesses', {
        ...businessData,
        created_by: user.id
      });
      
      set((state) => ({
        businesses: [...state.businesses, response.data]
      }));
      toast.success("Business created successfully");
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to add business";
      set({ error: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  updateBusiness: async (id, data) => {
    const business = get().businesses.find(b => b.id === id);
    if (!get().canModifyBusiness(business)) {
      toast.error("You don't have permission to update this business");
      return false;
    }

    set({ loading: true, error: null });
    try {
      const response = await axios.put(`/api/businesses/${id}`, data);
      set((state) => ({
        businesses: state.businesses.map((business) => 
          business.id === id ? response.data : business
        )
      }));
      toast.success("Business updated successfully");
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to update business";
      set({ error: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  deleteBusiness: async (id) => {
    const business = get().businesses.find(b => b.id === id);
    const user = authStore.getState().user;

    if (!get().canModifyBusiness(business)) {
      toast.error("You don't have permission to delete this business");
      return false;
    }

    set({ loading: true, error: null });
    try {
      // Add role_type as a query parameter
      await axios.delete(`/api/businesses/${id}`, {
        params: {
          role_type: user.role_type
        }
      });
      
      set((state) => ({
        businesses: state.businesses.filter((business) => business.id !== id)
      }));
      toast.success("Business deleted successfully");
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to delete business";
      set({ error: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  fetchOldestBusiness: async () => {
    set({ loading: true, error: null });
    try {
      const user = authStore.getState().user;
      
      const response = await axios.get('/api/businesses/oldest', {
        params: {
          role_type: user.role_type,
          comptable_key: user.comptable_key,
          comptable_reference_key: user.comptable_reference_key,
          id: user.id,
        },
      });
      
      
      // Check if response indicates an empty result (no business found)
      if (response.data.status === 'empty') {
        set({ oldestBusiness: null });
        return null;
      }
      
      set({ oldestBusiness: response.data });
      return response.data;
    } catch (error) {
      console.error('Error fetching oldest business:', error);
      const errorMessage = error.response?.data?.message || "Failed to fetch oldest business";
      set({ error: errorMessage, oldestBusiness: null });
      // Don't show error toast for this common case
      // toast.error(errorMessage);
      return null;
    } finally {
      set({ loading: false });
    }
  },


  // Helper methods
  getCurrentBusiness: () => get().currentBusiness,
  getAllBusinesses: () => get().businesses,
  getBusinessById: (id) => get().businesses.find(business => business.id === id),
  isLoading: () => get().loading,
  getError: () => get().error
}));

export default useBusinessStore;
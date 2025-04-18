// store/labelStore.js
import { create } from "zustand";
import axios from "@/lib/axios";
import { toast } from "react-hot-toast";
const useLabelStore = create((set, get) => ({
    labels: [],
    loading: false,
    error: null,
    currentLabel: null,
  
    resetState: () => {
      set({
        labels: [],
        loading: false,
        error: null,
        currentLabel: null,
      });
    },
  
    fetchLabelsByType: async (typeId) => {
      set({ loading: true, error: null });
      try {
        const response = await axios.get(`/api/expense-labels?type_id=${typeId}`);
        set({ labels: response.data });
        return response.data;
      } catch (error) {
        const errorMessage = error.response?.data?.message || "Failed to fetch labels";
        set({ error: errorMessage });
        toast.error(errorMessage);
        return null;
      } finally {
        set({ loading: false });
      }
    },
  
    addLabels: async (typeId, data) => {
      set({ loading: true, error: null });
      try {
        const response = await axios.post('/api/expense-labels', {
          type_id: typeId,
          labels: data.labels,
          computable: data.computable,
          expense_method: data.expense_method
        });
        
        set((state) => ({
          labels: [...state.labels, ...response.data]
        }));
  
        toast.success("Labels created successfully");
        return true;
      } catch (error) {
        console.error('Label creation error:', error);
        const errorMessage = error.response?.data?.message || "Failed to add labels";
        set({ error: errorMessage });
        toast.error(errorMessage);
        return false;
      } finally {
        set({ loading: false });
      }
    },

    updateLabel: async (id, data) => {
      set({ loading: true, error: null });
      try {
        const response = await axios.put(`/api/expense-labels/${id}`, {
          name: data.name,
          type_id: data.type_id
        });
        
        set((state) => ({
          labels: state.labels.map((label) => 
            label.id === id ? response.data : label
          )
        }));
        toast.success("Label updated successfully");
        return true;
      } catch (error) {
        const errorMessage = error.response?.data?.message || "Failed to update label";
        set({ error: errorMessage });
        toast.error(errorMessage);
        return false;
      } finally {
        set({ loading: false });
      }
     },
  
    deleteLabel: async (id) => {
      set({ loading: true, error: null });
      try {
        await axios.delete(`/api/expense-labels/${id}`);
        set((state) => ({
          labels: state.labels.filter((label) => label.id !== id)
        }));
        toast.success("Label deleted successfully");
        return true;
      } catch (error) {
        const errorMessage = error.response?.data?.message || "Failed to delete label";
        set({ error: errorMessage });
        toast.error(errorMessage);
        return false;
      } finally {
        set({ loading: false });
      }
    }
  }));
  
  export default useLabelStore;



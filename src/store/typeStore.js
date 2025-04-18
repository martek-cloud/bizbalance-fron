import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";
import authStore from "./authStore";
const useExpenseTypeStore = create((set, get) => ({
  // State
  types: [],
  selectType: [],
  loading: false,
  error: null,
  currentType: null,

  // Reset state
  resetState: () => {
    set({
      types: [],
      selectType: [],
      loading: false,
      error: null,
      currentType: null,
    });
  },

  // Actions
  // Inside typeStore
  fetchSelectTypes: async () => {
    try {
      const user = authStore.getState().user;
      const allTypes = get().types;
      const filteredTypes = allTypes.filter(type => type.created_by == user.id);
      set({ selectType: filteredTypes });
      return filteredTypes;
    } catch (error) {
      console.error(error);
      toast.error("Failed to filter types");
      return [];
    }
  },
  fetchTypes: async () => {
    set({ loading: true });
    try {
      const user = authStore.getState().user;
      const response = await axios.get("/api/expense-types", {
        params: {
          role_type: user.role_type,
          comptable_key: user.comptable_key,
          comptable_reference_key: user.comptable_reference_key,
          id: user.id,
        },
      });
      set({ types: response.data });
      return response.data;
    } catch (error) {
      // Error handling remains same
    } finally {
      set({ loading: false });
    }
  },
  hasPermissiontype: (type) => {
    const user = authStore.getState().user;
    if (!user || !type) return false;
    switch (user.role_type) {
      case "admin":
        return true;

      case "comptable":
        return (
          type.created_by.toString() === user.id.toString() || // Their own types
          (type.creator?.role_type === "user" &&
            type.creator?.comptable_reference_key === user.comptable_key)
        );

      case "user":
        return type.created_by.toString() === user.id.toString();

      default:
        return false;
    }
  },
  fetchTypeById: async (id) => {
    if (!id) return null;

    set({ loading: true, error: null });
    try {
      const response = await axios.get(`/api/expense-types/${id}`);
      if (!response.data) throw new Error("No data received");

      set({ currentType: response.data });
      return response.data;
    } catch (error) {
      console.error("Error fetching expense type:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to fetch expense type";
      set({ error: errorMessage });
      toast.error(errorMessage);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  addType: async (typeData) => {
    if (!typeData?.name || !typeData?.range) {
      toast.error("Name and range are required");
      return false;
    }

    set({ loading: true, error: null });
    try {
      const response = await axios.post("/api/expense-types", typeData);
      if (!response.data) throw new Error("No data received");

      set((state) => ({
        types: [...state.types, response.data],
        currentType: response.data,
      }));

      toast.success("Expense type created successfully");
      return true;
    } catch (error) {
      console.error("Error adding expense type:", error);
      const errorMessage =
        error.response?.data?.message ||
        Object.values(error.response?.data?.errors || {})[0]?.[0] ||
        "Failed to add expense type";
      set({ error: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  updateType: async (id, typeData) => {
    if (!id || !typeData?.name || !typeData?.range) {
      toast.error("Invalid expense type data");
      return false;
    }

    set({ loading: true, error: null });
    try {
      const response = await axios.put(`/api/expense-types/${id}`, typeData);
      if (!response.data) throw new Error("No data received");

      set((state) => ({
        types: state.types.map((type) =>
          type.id === id ? response.data : type
        ),
        currentType: response.data,
      }));

      toast.success("Expense type updated successfully");
      return true;
    } catch (error) {
      console.error("Error updating expense type:", error);
      const errorMessage =
        error.response?.data?.message ||
        Object.values(error.response?.data?.errors || {})[0]?.[0] ||
        "Failed to update expense type";
      set({ error: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  deleteType: async (id) => {
    if (!id) {
      toast.error("Expense type ID is required");
      return false;
    }

    set({ loading: true, error: null });
    try {
      await axios.delete(`/api/expense-types/${id}`);

      set((state) => ({
        types: state.types.filter((type) => type.id !== id),
        currentType: state.currentType?.id === id ? null : state.currentType,
      }));

      toast.success("Expense type deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting expense type:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to delete expense type";
      set({ error: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  // Getters
  getTypeById: (id) => {
    return get().types.find((type) => type.id === id) || null;
  },

  getTypesByRange: (range) => {
    return get().types.filter((type) => type.range === range);
  },

  // Helper methods
  isLoading: () => get().loading,
  getError: () => get().error,
  getCurrentType: () => get().currentType,
  getAllTypes: () => get().types,
}));

export default useExpenseTypeStore;

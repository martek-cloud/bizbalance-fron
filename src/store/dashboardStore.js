import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";
import authStore from "./authStore";

const dashboardStore = create((set) => ({
  counts: {
    admin: 0,
    comptable: 0,
    user: 0,
    total: 0,
  },
  expenseData: {
    types: [],
    labels: [],
  },
  recentUsers: [],
  dashboardSummary: null,
  loading: false,
  error: null,

  fetchCounts: async () => {
    set({ loading: true });
    try {
      const response = await axios.get("/api/getSubordinateCounts");
      set({ counts: response.data.counts, error: null });
      return response.data.counts;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch counts";
      set({ error: message });
      toast.error(message);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  fetchTypesAndLabels: async () => {
    set({ loading: true });
    try {
      const response = await axios.get("/api/getTypesAndLabels");
      console.log("getTypesAndLabels:", response.data);
      set({ expenseData: response.data, error: null });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to fetch expense data";
      set({ error: message });
      toast.error(message);
      return null;
    } finally {
      set({ loading: false });
    }
  },
  
  fetchRecentUsers: async () => {
    set({ loading: true });
    try {
      const response = await axios.get("/api/recentUsersAdded");
      console.log("Recent Users Response:", response.data);
      set({ recentUsers: response.data }); // Note: case should match component usage
      return response.data;
    } catch (error) {
      console.error("Recent Users Error:", error);
      toast.error("Failed to fetch recent users");
      return [];
    } finally {
      set({ loading: false });
    }
  },

  fetchDashboardSummary: async () => {
    set({ loading: true });
    try {
      const response = await axios.get("/api/dashboard-summary");
      console.log("dashboardSummary:", response.data);
      set({ dashboardSummary: response.data }); // Note: case should match component usage
      return response.data;
    } catch (error) {
      console.error("Dashboard Summary Error:", error);
      toast.error("Failed to fetch dashboard summary");
      return [];
    } finally {
      set({ loading: false });
    }
  },

  reset: () =>
    set({
      counts: { admin: 0, comptable: 0, user: 0, total: 0 },
      expenseData: { types: [], labels: [] },
      loading: false,
      error: null,
    }),
}));

export default dashboardStore;

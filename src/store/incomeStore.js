import { create } from "zustand";
import axios from "@/lib/axios";
import { toast } from "react-hot-toast";
import authStore from "@/store/authStore";
import { format } from "date-fns";

const useIncomeStore = create((set, get) => ({
  // State
  incomes: [],
  loading: false,
  error: null,
  selectedIncome: null,
  dateRange: {
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
  },

  // Reset state
  resetState: () => {
    set({
      incomes: [],
      loading: false,
      error: null,
      selectedIncome: null,
      dateRange: {
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
      },
    });
  },

  // Set date range
  setDateRange: (range) => {
    set({ dateRange: range });
  },

  // Fetch incomes with role-based filtering and date range
  fetchIncomes: async () => {
    set({ loading: true, error: null });
    try {
      const user = authStore.getState().user;
      const { dateRange } = get();

      const response = await axios.get("/api/income", {
        params: {
          role_type: user.role_type,
          comptable_key: user.comptable_key,
          comptable_reference_key: user.comptable_reference_key,
          id: user.id,
          from_date: dateRange.from
            ? format(dateRange.from, "yyyy-MM-dd")
            : undefined,
          to_date: dateRange.to
            ? format(dateRange.to, "yyyy-MM-dd")
            : undefined,
        },
      });

      console.log("Date range params:", {
        from_date: dateRange.from
          ? format(dateRange.from, "yyyy-MM-dd")
          : undefined,
        to_date: dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
      });

      set({ incomes: response.data, loading: false });
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch income records";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return null;
    }
  },

  // Permission check helper
  canModifyIncome: (income) => {
    const user = authStore.getState().user;
    return (
      user &&
      user.role_type === "user" &&
      income?.created_by?.toString() === user.id?.toString()
    );
  },

  // Create new income record
  createIncome: async (incomeData) => {
    const user = authStore.getState().user;
    if (user.role_type !== "user") {
      toast.error("Only users can create income records");
      return false;
    }

    set({ loading: true, error: null });
    try {
      const response = await axios.post("/api/income", {
        ...incomeData,
        created_by: user.id,
      });

      set((state) => ({
        incomes: [...state.incomes, response.data],
        loading: false,
      }));
      toast.success("Income record created successfully");
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to create income record";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return false;
    }
  },

  // Update existing income record
  updateIncome: async (id, incomeData) => {
    const income = get().incomes.find((inc) => inc.id === id);
    if (!get().canModifyIncome(income)) {
      toast.error("You don't have permission to update this record");
      return false;
    }

    set({ loading: true, error: null });
    try {
      const response = await axios.put(`/api/income/${id}`, incomeData);
      set((state) => ({
        incomes: state.incomes.map((income) =>
          income.id === id ? response.data : income
        ),
        loading: false,
      }));
      toast.success("Income record updated successfully");
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update income record";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return false;
    }
  },

  // Delete income record
  deleteIncome: async (id) => {
    const income = get().incomes.find((inc) => inc.id === id);
    if (!get().canModifyIncome(income)) {
      toast.error("You don't have permission to delete this record");
      return false;
    }

    set({ loading: true, error: null });
    try {
      await axios.delete(`/api/income/${id}`);
      set((state) => ({
        incomes: state.incomes.filter((income) => income.id !== id),
        loading: false,
      }));
      toast.success("Income record deleted successfully");
      return true;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete income record";
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return false;
    }
  },

  // Set selected income
  setSelectedIncome: (income) => {
    set({ selectedIncome: income });
  },

  // Helper getters
  getCurrentIncome: () => get().selectedIncome,
  getAllIncomes: () => get().incomes,
  getIncomeById: (id) => get().incomes.find((income) => income.id === id),
  isLoading: () => get().loading,
  getError: () => get().error,

  // Filter helpers
  getIncomesByDateRange: (startDate, endDate) => {
    return get().incomes.filter((income) => {
      const incomeDate = new Date(income.income_date);
      return incomeDate >= startDate && incomeDate <= endDate;
    });
  },

  // Calculate totals
  calculateTotalIncome: () => {
    return get().incomes.reduce(
      (total, income) => total + parseFloat(income.gross_income),
      0
    );
  },

  calculateBusinessIncome: (businessId) => {
    return get()
      .incomes.filter((income) => income.business_id === businessId)
      .reduce((total, income) => total + parseFloat(income.gross_income), 0);
  },
}));

export default useIncomeStore;

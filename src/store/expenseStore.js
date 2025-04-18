// store/mainExpenseStore.js
import { create } from "zustand";
import axios from "@/lib/axios";
import { toast } from "react-hot-toast";
import authStore from "./authStore";

const useMainExpenseStore = create((set, get) => ({
  expenses: [],
  loading: false,
  error: null,
  currentExpense: null,

  resetState: () => {
    set({
      expenses: [],
      loading: false,
      error: null,
      currentExpense: null,
    });
  },

  fetchExpenses: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get("/api/main-expenses", { 
        params: {
          ...filters,
          expense_method: filters.expense_method || 'amount'
        }
      });

      const transformedExpenses = response.data.map((expense) => ({
        id: expense.id,
        range: expense.expense_range,
        type: expense.type?.type_name,
        type_id: expense.expense_type_id,
        label: expense.label?.label_name,
        label_id: expense.expense_label_id,
        vehicle_id: expense.vehicle_id,
        amount: expense.amount ? parseFloat(expense.amount) : null,
        date: new Date(expense.date),
        created_by: expense.created_by,
        creator: expense.creator,
        vehicle: expense.vehicle,
        method: expense.method || 'direct',
      }));

      set({ expenses: transformedExpenses });
      return transformedExpenses;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to fetch expenses";
      set({ error: errorMessage });
      toast.error(errorMessage);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  addExpense: async (expenseData) => {
    set({ loading: true, error: null });
    console.log("Expense data received:", expenseData);
    console.log("Method in expense data:", expenseData.method);
    
    try {
      // Create FormData object to handle file upload
      const formData = new FormData();
      
      // Add all expense data fields
      formData.append('expense_range', expenseData.range);
      formData.append('expense_type_id', expenseData.expense_type_id);
      formData.append('expense_label_id', expenseData.expense_label_id);
      formData.append('vehicle_id', expenseData.range === 'vehicle' ? expenseData.vehicle_id : '');
      formData.append('computable', expenseData.computable);
      formData.append('expense_method', expenseData.expense_method);
      formData.append('method', expenseData.method || 'direct');
      formData.append('amount', expenseData.expense_method === 'amount' ? expenseData.amount : '');
      formData.append('mileage', expenseData.expense_method === 'mileage' ? expenseData.mileage : '');
      formData.append('personal_miles', expenseData.expense_method === 'mileage' ? expenseData.personal_miles : '');
      formData.append('personal_use_percentage', expenseData.expense_method === 'mileage' ? expenseData.personal_use_percentage : '');
      formData.append('business_use_percentage', expenseData.expense_method === 'mileage' ? expenseData.business_use_percentage : '');
      formData.append('business_miles', expenseData.expense_method === 'mileage' ? expenseData.business_miles : '');
      formData.append('date', expenseData.date.toISOString().split("T")[0]);
      formData.append('odometer_reading', expenseData.expense_method === 'mileage' ? expenseData.odometer_reading : '');
      formData.append('starting_odometer', expenseData.expense_method === 'mileage' ? expenseData.startingOdometerReading : '');
      formData.append('note', expenseData.note || '');

      // Add receipt file if present
      if (expenseData.receipt) {
        formData.append('receipt', expenseData.receipt);
      }

      console.log("FormData contents:");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }
      
      const response = await axios.post("/api/main-expenses", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      set((state) => ({
        expenses: [...state.expenses, response.data],
        error: null
      }));

      toast.success("Expense added successfully");
      return true;
    } catch (error) {
      console.error("Error adding expense:", error);
      const errorMessage = error.response?.data?.message || "Failed to add expense";
      set({ error: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  updateExpense: async (id, expenseData) => {
    set({ loading: true, error: null });
    try {
      const transformedData = {
        expense_range: expenseData.range,
        expense_type_id: expenseData.type_id,
        expense_label_id: expenseData.label_id,
        vehicle_id: expenseData.range === 'vehicle' ? expenseData.vehicle_id : null,
        computable: expenseData.computable,
        expense_method: expenseData.expense_method,
        method: expenseData.method || 'direct',
        amount: expenseData.expense_method === 'amount' ? expenseData.amount : null,
        mileage: expenseData.expense_method === 'mileage' ? expenseData.mileage : null,
        personal_miles: expenseData.expense_method === 'mileage' ? expenseData.personal_miles : null,
        personal_use_percentage: expenseData.expense_method === 'mileage' ? expenseData.personal_use_percentage : null,
        business_use_percentage: expenseData.expense_method === 'mileage' ? expenseData.business_use_percentage : null,
        business_miles: expenseData.expense_method === 'mileage' ? expenseData.business_miles : null,
        date: expenseData.date.toISOString().split("T")[0],
        starting_odometer: expenseData.expense_method === 'mileage' ? expenseData.startingOdometerReading : null,
        note: expenseData.note || ''
      };

      const response = await axios.put(
        `/api/main-expenses/${id}`,
        transformedData
      );

      const updatedExpense = {
        id: response.data.id,
        range: response.data.expense_range,
        type: response.data.type?.type_name,
        type_id: response.data.expense_type_id,
        label: response.data.label?.label_name,
        label_id: response.data.expense_label_id,
        vehicle_id: response.data.vehicle_id,
        computable: response.data.computable,
        expense_method: response.data.expense_method,
        method: response.data.method,
        amount: response.data.amount ? parseFloat(response.data.amount) : null,
        mileage: response.data.mileage ? parseFloat(response.data.mileage) : null,
        personal_miles: response.data.personal_miles ? parseFloat(response.data.personal_miles) : null,
        personal_use_percentage: response.data.personal_use_percentage ? parseFloat(response.data.personal_use_percentage) : null,
        business_use_percentage: response.data.business_use_percentage ? parseFloat(response.data.business_use_percentage) : null,
        business_miles: response.data.business_miles ? parseFloat(response.data.business_miles) : null,
        date: new Date(response.data.date),
        created_by: response.data.created_by,
        creator: response.data.creator,
        vehicle: response.data.vehicle,
        starting_odometer: response.data.starting_odometer ? parseFloat(response.data.starting_odometer) : null,
        odometer_reading: response.data.odometer_reading ? parseFloat(response.data.odometer_reading) : null,
        note: response.data.note || ''
      };

      set((state) => ({
        expenses: state.expenses.map((expense) =>
          expense.id === id ? updatedExpense : expense
        ),
        currentExpense: updatedExpense,
      }));

      toast.success("Expense updated successfully");
      return true;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        Object.values(error.response?.data?.errors || {})[0]?.[0] ||
        "Failed to update expense";
      set({ error: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  deleteExpense: async (id) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`/api/main-expenses/${id}`);

      set((state) => ({
        expenses: state.expenses.filter((expense) => expense.id !== id),
        currentExpense:
          state.currentExpense?.id === id ? null : state.currentExpense,
      }));

      toast.success("Expense deleted successfully");
      return true;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete expense";
      set({ error: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  getLastOdometerReading: async (vehicleId) => {
    try {
      const response = await axios.get(`/api/main-expenses`, {
        params: {
          last_odometer_reading: true,
          vehicle_id: vehicleId
        }
      });
      return response.data.last_odometer_reading;
    } catch (error) {
      console.error('Error fetching last odometer reading:', error);
      return null;
    }
  },

  getLastMileageInfo: async (vehicleId) => {
    try {
      const response = await axios.get(`/api/main-expenses/last-mileage/${vehicleId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching last mileage info:', error);
      return null;
    }
  },

  getVehicleMileageExpenses: async (vehicleId) => {
    set({ loading: true, error: null });
    try {
        const response = await axios.get(`/api/main-expenses`, {
            params: {
                vehicle_id: vehicleId,
                expense_method: 'mileage'
            }
        });

        const transformedExpenses = response.data.map((expense) => ({
            id: expense.id,
            date: new Date(expense.date),
            odometer_reading: expense.odometer_reading ? parseFloat(expense.odometer_reading) : null,
            distance_covered: expense.distance_covered ? parseFloat(expense.distance_covered) : null,
            personal_miles: expense.personal_miles ? parseFloat(expense.personal_miles) : null,
            business_miles: expense.business_miles ? parseFloat(expense.business_miles) : null,
            personal_use_percentage: expense.personal_use_percentage ? parseFloat(expense.personal_use_percentage) : null,
            business_use_percentage: expense.business_use_percentage ? parseFloat(expense.business_use_percentage) : null,
            created_at: new Date(expense.created_at),
            type: expense.type?.type_name,
            label: expense.label?.label_name,
            vehicle: expense.vehicle
        }));

        return transformedExpenses;
    } catch (error) {
        const errorMessage = error.response?.data?.message || "Failed to fetch vehicle usage";
        set({ error: errorMessage });
        toast.error(errorMessage);
        return null;
    } finally {
        set({ loading: false });
    }
  },

  getExpenseSummary: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get("/api/expense-summary");
      console.log("Expense Summary Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Expense Summary Error:", error);
      toast.error("Failed to fetch expense summary");
      return null;
    } finally {
      set({ loading: false });
    }
  },

  getExpenseTypesAndLabels: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get("/api/getTypesAndLabels");
      console.log("Expense Types and Labels Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Expense Types and Labels Error:", error);
      toast.error("Failed to fetch expense types and labels");
      return null;
    } finally {
      set({ loading: false });
    }
  },
}));

export default useMainExpenseStore;

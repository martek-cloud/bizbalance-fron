import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";
import authStore from "./authStore";

const usersStore = create((set, get) => ({
  // State
  users: [],
  loading: false,
  error: null,
  currentUser: null,
  roles: [],
  roleLoading: false,

  // Actions
  fetchComptableUsers: async () => {
    try {
      const currentUser = authStore.getState().user;

      // If not admin or comptable, return empty array
      if (
        !currentUser ||
        (currentUser.role_type !== "admin" &&
          currentUser.role_type !== "comptable")
      ) {
        return [];
      }

      const response = await axios.get("/api/users/comptables");

      // Add a label to indicate if it's the current comptable
      const comptablesWithLabels = response.data.map((comptable) => ({
        ...comptable,
        displayName:
          comptable.id === currentUser.id
            ? `${comptable.first_name} ${comptable.last_name} ( You )`
            : `${comptable.first_name} ${comptable.last_name}`,
      }));

      return comptablesWithLabels;
    } catch (error) {
      console.error("Error fetching comptable users:", error);
      toast.error("Failed to fetch comptable users");
      return [];
    }
  },

  fetchRoles: async () => {
    set({ roleLoading: true });
    try {
      const response = await axios.get("/api/roles");
      if (!response.data) throw new Error("No data received");

      set({ roles: response.data });
      return response.data;
    } catch (error) {
      console.error("Error fetching roles:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to fetch roles";
      toast.error(errorMessage);
      return [];
    } finally {
      set({ roleLoading: false });
    }
  },

  updateUserRole: async (userId, roleId) => {
    set({ loading: true });
    try {
      const response = await axios.put(`/api/users/${userId}/role`, {
        role_id: roleId,
      });

      set((state) => ({
        users: state.users.map((user) =>
          user.id === userId ? response.data : user
        ),
      }));

      toast.success("User role updated successfully");
      return true;
    } catch (error) {
      console.error("Error updating user role:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update user role";
      toast.error(errorMessage);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  fetchUsers: async () => {
    set({ loading: true });
    try {
      const currentUser = authStore.getState().user;

      if (
        !currentUser ||
        (currentUser.role_type !== "admin" &&
          currentUser.role_type !== "comptable")
      ) {
        set({ users: [], error: "Unauthorized" });
        return [];
      }

      const response = await axios.get("/api/users", {
        params: {
          id: currentUser.id,
        },
      });
      set({
        users: response.data.users,
        error: null,
      });
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch users";
      set({ error: errorMessage });
      toast.error(errorMessage);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  fetchUserById: async (id) => {
    set({ loading: true });
    try {
      const response = await axios.get(`/api/users/${id}`);
      set({ currentUser: response.data });
      return response.data;
    } catch (error) {
      console.error("Error fetching user:", error);
      set({ error: "Failed to fetch user" });
      toast.error("Failed to fetch user");
      return null;
    } finally {
      set({ loading: false });
    }
  },

  addUser: async (userData) => {
    set({ loading: true });
    try {
      const currentUser = authStore.getState().user;

      const response = await axios.post("/api/users", userData, {
        headers: {
          "Content-Type": "multipart/form-data", // Important for file upload
        },
      });

      set((state) => ({ users: [...state.users, response.data.user] }));

      if (response.data.user.comptable_key) {
        toast.success(`Accountant key: ${response.data.user.comptable_key}`, {
          duration: 10000,
          position: "top-center",
        });
      }

      toast.success("User created successfully");
      return true;
    } catch (error) {
      console.error("Error adding user:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to add user";
      set({ error: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  updateUser: async (id, userData) => {
    if (userData instanceof FormData) {
      console.log("FormData contents:");
      for (let pair of userData.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }
    } else {
      console.log("userData:", userData);
    }

    set({ loading: true });
    try {
      let formDataToSubmit;

      if (userData instanceof FormData) {
        formDataToSubmit = userData;

        // Convert remove_photo to 0/1
        if (formDataToSubmit.has("remove_photo")) {
          formDataToSubmit.set(
            "remove_photo",
            formDataToSubmit.get("remove_photo") === "true" ? "1" : "0"
          );
        }
      }

      const response = await axios.post(`/api/users/${id}`, formDataToSubmit, {
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data", // Make sure this is set for file uploads
        },
      });

      set((state) => ({
        users: state.users.map((user) =>
          user.id === parseInt(id) ? response.data.user : user
        ),
      }));

      return true;
    } catch (error) {
      console.error("Full error response:", error.response?.data);
      const errorMessage =
        error.response?.data?.message ||
        Object.values(error.response?.data?.errors || {})[0]?.[0] ||
        "Failed to update user";
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },

  deleteUser: async (id) => {
    set({ loading: true });
    try {
      await axios.delete(`/api/users/${id}`);
      set((state) => ({
        users: state.users.filter((user) => user.id !== id),
        currentUser: null,
      }));
      toast.success("User deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      set({ error: "Failed to delete user" });
      toast.error("Failed to delete user");
      return false;
    } finally {
      set({ loading: false });
    }
  },

  getRecentUsers: async () => {
    try {
      const response = await axios.get("/api/users/recent");
      return response.data;
    } catch (error) {
      console.error("Error fetching recent users:", error);
      toast.error("Failed to fetch recent users");
      return [];
    }
  },

  // Getters
  getCurrentUser: () => get().currentUser,

  getUserById: (id) => {
    return get().users.find((user) => user.id === parseInt(id));
  },
}));

export default usersStore;

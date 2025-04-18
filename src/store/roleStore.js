import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

const roleStore = create((set, get) => ({
  // State
  roles: [],
  loading: false,
  error: null,
  currentRole: null,
  userPermissions: null,

  // Reset state
  resetState: () => {
    set({
      roles: [],
      loading: false,
      error: null,
      currentRole: null,
      userPermissions: null,
    });
  },

  // Actions
  fetchRoles: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get("/api/roles");
      if (!response.data) throw new Error("No data received");

      set({ roles: response.data });
      return response.data;
    } catch (error) {
      console.error("Error fetching roles:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to fetch roles";
      set({ error: errorMessage });
      toast.error(errorMessage);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  fetchRoleById: async (id) => {
    if (!id) return null;

    set({ loading: true, error: null });
    try {
      const response = await axios.get(`/api/roles/${id}`);
      if (!response.data) throw new Error("No data received");

      set({ currentRole: response.data });
      return response.data;
    } catch (error) {
      console.error("Error fetching role:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to fetch role";
      set({ error: errorMessage });
      toast.error(errorMessage);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  addRole: async (roleData) => {
    if (!roleData?.role_name || !roleData?.role_type) {
      toast.error("Role name and type are required");
      return false;
    }

    set({ loading: true, error: null });
    try {
      const response = await axios.post("/api/roles", roleData);
      if (!response.data) throw new Error("No data received");

      set((state) => ({
        roles: [...state.roles, response.data],
        currentRole: response.data,
      }));

      toast.success("Role created successfully");
      return true;
    } catch (error) {
      console.error("Error adding role:", error);
      const errorMessage =
        error.response?.data?.message ||
        Object.values(error.response?.data?.errors || {})[0]?.[0] ||
        "Failed to add role";
      set({ error: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      set({ loading: false });
    }
  },
  fetchUserPermissions: async (roleId) => {
    if (!roleId) {
      console.log("No roleId provided to fetchUserPermissions");
      return null;
    }

    set({ loading: true });
    try {
      const response = await axios.get(`/api/roles/${roleId}/permissions`);

      // Handle successful response
      if (response.data.success) {
        const permissions = response.data.data.permissions;
        set({ userPermissions: permissions });
        return permissions;
      } else {
        // Handle case where success is false
        throw new Error(response.data.message || "Failed to fetch permissions");
      }
    } catch (error) {
      console.error("Error fetching user permissions:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch permissions";
      set({ error: errorMessage, userPermissions: null });
      toast.error(errorMessage);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  hasPermission: (module, action) => {
    const { userPermissions } = get();
    
    // Parse permissions if they're stored as string
    let permissions = userPermissions;
    if (typeof userPermissions === 'string') {
        try {
            permissions = JSON.parse(userPermissions);
        } catch (error) {
            console.error('Error parsing permissions:', error);
            return false;
        }
    }

    // Check if module and action exist and return boolean result
    const hasAccess = Boolean(permissions?.[module]?.[action]);
    
    return hasAccess;
},
  updateRole: async (id, roleData) => {
    if (!id || !roleData?.role_name || !roleData?.role_type) {
      toast.error("Invalid role data");
      return false;
    }

    set({ loading: true, error: null });
    try {
      const response = await axios.put(`/api/roles/${id}`, roleData);
      if (!response.data) throw new Error("No data received");

      set((state) => ({
        roles: state.roles.map((role) =>
          role.id === id ? response.data : role
        ),
        currentRole: response.data,
      }));

      toast.success("Role updated successfully");
      return true;
    } catch (error) {
      console.error("Error updating role:", error);
      const errorMessage =
        error.response?.data?.message ||
        Object.values(error.response?.data?.errors || {})[0]?.[0] ||
        "Failed to update role";
      set({ error: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  deleteRole: async (id) => {
    if (!id) {
      toast.error("Role ID is required");
      return false;
    }

    set({ loading: true, error: null });
    try {
      await axios.delete(`/api/roles/${id}`);

      set((state) => ({
        roles: state.roles.filter((role) => role.id !== id),
        currentRole: state.currentRole?.id === id ? null : state.currentRole,
      }));

      toast.success("Role deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting role:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to delete role";
      set({ error: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  updateRolePermissions: async (id, permissions) => {
    if (!id || !permissions) {
      toast.error("Invalid permissions data");
      return false;
    }

    set({ loading: true, error: null });
    try {
      // Convert permissions object to string
      const permissionsString = JSON.stringify(permissions);

      const response = await axios.put(`/api/roles/${id}/permissions`, {
        permissions: permissionsString, // Send as string
      });

      if (!response.data) throw new Error("No data received");

      set((state) => ({
        roles: state.roles.map((role) =>
          role.id === id ? { ...role, permissions: permissionsString } : role
        ),
        currentRole: response.data,
      }));

      toast.success("Permissions updated successfully");
      return true;
    } catch (error) {
      console.error("Error updating permissions:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update permissions";
      set({ error: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  // Getters
  getRoleById: (id) => {
    return get().roles.find((role) => role.id === id) || null;
  },

  getRolesByType: (type) => {
    return get().roles.filter((role) => role.role_type === type);
  },
}));

export default roleStore;

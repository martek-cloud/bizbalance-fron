import { create } from "zustand";
import api from "@/lib/axios";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast"; // Add this import

const TOKEN_COOKIE_NAME = "auth_token";
const USER_COOKIE_NAME = "auth_user";
const COOKIE_EXPIRY = 7;

// Function to encode sensitive data
// Function to encode sensitive data
const encodeData = (data) => {
  try {
    return btoa(
      JSON.stringify({
        id: data.id,
        email: data.email,
        role_type: data.role_type,
        role_id: data.role_id,
        first_name: data.first_name,
        last_name: data.last_name,
        comptable_key: data.comptable_key,
        comptable_reference_key: data.comptable_reference_key,
        profile_picture: data.profile_picture, // Add this line
      })
    );
  } catch {
    return null;
  }
};
// Function to decode data
const decodeData = (encoded) => {
  try {
    return JSON.parse(atob(encoded));
  } catch {
    return null;
  }
};

const getStoredToken = () => {
  if (sessionStorage.getItem("is_session_auth")) {
    return sessionStorage.getItem("session_token");
  }
  return Cookies.get(TOKEN_COOKIE_NAME);
};

const getStoredUser = () => {
  if (sessionStorage.getItem("is_session_auth")) {
    const encodedUser = sessionStorage.getItem("session_user");
    return encodedUser ? decodeData(encodedUser) : null;
  }

  const userStr = Cookies.get(USER_COOKIE_NAME);
  return userStr ? decodeData(userStr) : null;
};

const authStore = create((set) => ({
  user: getStoredUser(),
  token: getStoredToken(),
  isLoading: false,
  error: null,

  login: async (credentials) => {
    try {
      const response = await api.post("/api/login", credentials);
      const { user, token } = response.data;

      const encodedUser = encodeData(user);

      if (credentials.remember) {
        Cookies.set(TOKEN_COOKIE_NAME, token, {
          expires: COOKIE_EXPIRY,
          secure: true,
        });
        Cookies.set(USER_COOKIE_NAME, encodedUser, {
          expires: COOKIE_EXPIRY,
          secure: true,
        });
        sessionStorage.removeItem("is_session_auth");
        sessionStorage.removeItem("session_token");
        sessionStorage.removeItem("session_user");
      } else {
        sessionStorage.setItem("is_session_auth", "true");
        sessionStorage.setItem("session_token", token);
        sessionStorage.setItem("session_user", encodedUser);
        Cookies.remove(TOKEN_COOKIE_NAME);
        Cookies.remove(USER_COOKIE_NAME);
      }

      set({ user: decodeData(encodedUser), token });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to login";
      throw new Error(message);
    }
  },

  register: async (userData) => {
    try {
      set({ isLoading: true });

      // if (userData.role_type === "user") {
      //   // Validate reference key for user role
      //   try {
      //     const keyCheck = await api.get(
      //       `/api/check-key/${userData.reference_key}`
      //     );
      //     if (!keyCheck.data.exists) {
      //       throw new Error("Invalid reference key");
      //     }
      //   } catch (error) {
      //     throw new Error("Invalid reference key or unable to verify");
      //   }
      // }

      const response = await api.post("/api/register", userData);
      const { user, token } = response.data;

      // Show comptable key if applicable
      if (user.role_type === "comptable" && user.comptable_key) {
        toast.success(`Your comptable key is: ${user.comptable_key}`, {
          duration: 10000,
          position: "top-center",
        });
      }

      const encodedUser = encodeData(user);
      sessionStorage.setItem("is_session_auth", "true");
      sessionStorage.setItem("session_token", token);
      sessionStorage.setItem("session_user", encodedUser);

      set({ user: decodeData(encodedUser), token, isLoading: false });
      return response.data;
    } catch (error) {
      set({ isLoading: false });
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Registration failed";
      throw new Error(message);
    }
  },

  logout: async () => {
    try {
      await api.post("/api/logout");
    } finally {
      Cookies.remove(TOKEN_COOKIE_NAME);
      Cookies.remove(USER_COOKIE_NAME);
      sessionStorage.removeItem("is_session_auth");
      sessionStorage.removeItem("session_token");
      sessionStorage.removeItem("session_user");
      set({ user: null, token: null });
    }
  },
  updateProfile: async (userData) => {
    set({ isLoading: true });
    try {
      const userId = authStore.getState().user.id;

      // If it's FormData, we need to append the _method field
      if (userData instanceof FormData) {
        userData.append("_method", "PUT"); // Important for Laravel resource controller
      }

      const response = await api.post(`/api/profile/${userId}`, userData, {
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      });

      // Update local storage/cookies with new user data
      const encodedUser = encodeData(response.data.user);
      if (sessionStorage.getItem("is_session_auth")) {
        sessionStorage.setItem("session_user", encodedUser);
      } else {
        Cookies.set(USER_COOKIE_NAME, encodedUser, {
          expires: COOKIE_EXPIRY,
          secure: true,
        });
      }

      set({
        user: decodeData(encodedUser),
        isLoading: false,
        error: null,
      });

      return true;
    } catch (error) {
      console.error("Profile update error:", error.response?.data);
      let errorMessage = "Failed to update profile";

      if (error.response?.data?.errors) {
        // Handle Laravel validation errors
        const firstError = Object.values(error.response.data.errors)[0];
        errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },
  updatePassword: async (passwordData) => {
    try {
      const userId = authStore.getState().user.id;
      const response = await api.post(
        `/api/users/${userId}/password`,
        passwordData
      );

      if (response.data.success) {
        return true;
      }
      throw new Error(response.data.message || "Failed to update password");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to update password";
      throw new Error(message);
    }
  },
  isAuthenticated: () => {
    return !!getStoredToken();
  },
}));

export default authStore;

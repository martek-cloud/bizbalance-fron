// lib/axios.js
import axios from 'axios';
import Cookies from 'js-cookie';

const TOKEN_COOKIE_NAME = 'auth_token';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
    headers: {
        'Accept': 'application/json',
    }
});

// Add request interceptor to handle FormData and tokens
api.interceptors.request.use(
    (config) => {
        // Handle FormData requests
        if (config.data instanceof FormData) {
            // Remove Content-Type header to let the browser set it with boundary
            delete config.headers['Content-Type'];
        } else {
            // For non-FormData requests, set Content-Type to application/json
            config.headers['Content-Type'] = 'application/json';
        }

        // Check sessionStorage first for non-remembered sessions
        const sessionToken = sessionStorage.getItem('session_token');
        if (sessionToken) {
            config.headers.Authorization = `Bearer ${sessionToken}`;
            return config;
        }

        // Fall back to cookies for remembered sessions
        const cookieToken = Cookies.get(TOKEN_COOKIE_NAME);
        if (cookieToken) {
            config.headers.Authorization = `Bearer ${cookieToken}`;
        }
        return config;
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear both storage mechanisms
            Cookies.remove(TOKEN_COOKIE_NAME);
            Cookies.remove('auth_user');
            sessionStorage.removeItem('is_session_auth');
            sessionStorage.removeItem('session_token');
            sessionStorage.removeItem('session_user');
            
            // For API requests, don't redirect automatically
            // Let the component handle the redirect
            if (!error.config.url.includes('/api/')) {
                window.location.href = '/auth/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
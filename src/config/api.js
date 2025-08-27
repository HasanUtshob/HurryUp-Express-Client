// Centralized API configuration
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

// Remove trailing slash if present
const normalizeUrl = (url) => url.replace(/\/$/, "");

export const API_CONFIG = {
  BASE_URL: normalizeUrl(API_BASE_URL),
  ENDPOINTS: {
    // User endpoints
    USERS: "/users",

    // Booking endpoints
    BOOKINGS: "/bookings",
    BOOKINGS_PUBLIC: "/bookings/public",

    // Agent endpoints
    AGENT_REQUESTS: "/agent-requests",

    // Analytics endpoints
    ANALYTICS: {
      DAILY_BOOKINGS: "/analytics/daily-bookings",
      DELIVERY_STATS: "/analytics/delivery-stats",
      COD_SUMMARY: "/analytics/cod-summary",
    },
  },
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Export the base URL for socket connections and other uses
export const getApiBaseUrl = () => API_CONFIG.BASE_URL;

export default API_CONFIG;
